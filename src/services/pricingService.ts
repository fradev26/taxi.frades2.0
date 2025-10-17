/**
 * Pricing Service
 * 
 * Handles all pricing calculations including base rates, distance-based pricing,
 * time-based surcharges, and final price computation.
 */

import { PRICING_CONFIG, getVehiclePricing, roundPrice } from '@/config/pricing';
import type { DistanceResult } from './distanceService';
import type { VehiclePricing as ConfigVehiclePricing, SurchargeRule } from '@/config/pricing';

export interface PriceCalculationParams {
  vehicleType: string;
  distance?: number;        // Distance in km
  duration?: number;        // Duration in minutes
  pickupTime?: Date;        // Pickup date and time
  pickupLocation?: string;  // Pickup location for airport detection
  destinationLocation?: string; // Destination location
  hasStopover?: boolean;    // Whether there are stops
  isReturn?: boolean;       // Round trip booking
  // Optional overrides to force admin pricing values
  overrideVehiclePricing?: Partial<ConfigVehiclePricing>;
  overrideSurcharges?: Record<string, SurchargeRule>;
}

export interface PriceBreakdown {
  basePrice: number;        // Base fare
  distancePrice: number;    // Distance-based price
  timePrice: number;        // Time/duration-based price
  surcharges: Array<{       // Applied surcharges
    name: string;
    description: string;
    amount: number;
    type: 'absolute' | 'percentage';
  }>;
  subtotal: number;         // Price before tax
  tax: number;              // Tax amount
  total: number;            // Final price including tax
  minimum: number;          // Minimum fare for vehicle type
  currency: string;         // Currency code
  estimatedOnly: boolean;   // Whether this is an estimate (missing distance data)
}

export class PricingService {
  /**
   * Calculate complete price breakdown for a ride
   */
  static calculatePrice(params: PriceCalculationParams): PriceBreakdown {
    // Allow admin-provided vehicle pricing overrides (base, perKm, perMinute, minimum)
    const defaultVehiclePricing = getVehiclePricing(params.vehicleType);
    const vehiclePricing: ConfigVehiclePricing = {
      base: params.overrideVehiclePricing?.base ?? defaultVehiclePricing.base,
      perKm: params.overrideVehiclePricing?.perKm ?? defaultVehiclePricing.perKm,
      perMinute: params.overrideVehiclePricing?.perMinute ?? defaultVehiclePricing.perMinute,
      minimum: params.overrideVehiclePricing?.minimum ?? defaultVehiclePricing.minimum,
    } as ConfigVehiclePricing;
    const pickupTime = params.pickupTime || new Date();
    
    // Base calculations
    const basePrice = vehiclePricing.base;
    const distancePrice = this.calculateDistancePrice(params.distance || 0, vehiclePricing.perKm);
    const timePrice = this.calculateTimePrice(params.duration || 0, vehiclePricing.perMinute);
    
    // Calculate surcharges
  const surcharges = this.calculateSurcharges(params, pickupTime, params.overrideSurcharges);
    const surchargeTotal = surcharges.reduce((sum, s) => sum + s.amount, 0);
    
    // Subtotal before tax
    let subtotal = basePrice + distancePrice + timePrice + surchargeTotal;
    
    // Apply minimum fare
    subtotal = Math.max(subtotal, vehiclePricing.minimum);
    
    // Apply stopover surcharge if applicable
    if (params.hasStopover) {
      subtotal += this.calculateStopoverSurcharge(subtotal);
    }
    
    // Apply return trip discount/surcharge if applicable
    if (params.isReturn) {
      subtotal = this.applyReturnTripPricing(subtotal);
    }
    
    // Calculate tax
    const tax = subtotal * PRICING_CONFIG.settings.taxRate;
    const total = roundPrice(subtotal + tax);
    
    return {
      basePrice: roundPrice(basePrice),
      distancePrice: roundPrice(distancePrice),
      timePrice: roundPrice(timePrice),
      surcharges,
      subtotal: roundPrice(subtotal),
      tax: roundPrice(tax),
      total,
      minimum: vehiclePricing.minimum,
      currency: PRICING_CONFIG.settings.currency,
      estimatedOnly: !params.distance || params.distance === 0
    };
  }

  /**
   * Calculate price from distance result
   */
  static calculatePriceFromDistance(
    vehicleType: string,
    distanceResult: DistanceResult,
    pickupTime?: Date,
    pickupLocation?: string,
    hasStopover?: boolean,
    overrideVehiclePricing?: Partial<ConfigVehiclePricing>,
    overrideSurcharges?: Record<string, SurchargeRule>
  ): PriceBreakdown {
    return this.calculatePrice({
      vehicleType,
      distance: distanceResult.distance,
      duration: distanceResult.duration,
      pickupTime,
      pickupLocation,
      hasStopover,
      overrideVehiclePricing,
      overrideSurcharges
    });
  }

  /**
   * Calculate distance-based pricing
   */
  private static calculateDistancePrice(distance: number, perKmRate: number): number {
    return distance * perKmRate;
  }

  /**
   * Calculate time-based pricing (for traffic delays, waiting time)
   */
  private static calculateTimePrice(duration: number, perMinuteRate: number): number {
    // Only charge for time above a base threshold (e.g., expected drive time)
    const baseDuration = 15; // Base 15 minutes included in base price
    const chargeableDuration = Math.max(0, duration - baseDuration);
    return chargeableDuration * perMinuteRate;
  }

  /**
   * Calculate applicable surcharges
   */
  private static calculateSurcharges(
    params: PriceCalculationParams,
    pickupTime: Date,
    overrideSurcharges?: Record<string, SurchargeRule>
  ): Array<{name: string, description: string, amount: number, type: 'absolute' | 'percentage'}> {
    const surcharges: Array<{name: string, description: string, amount: number, type: 'absolute' | 'percentage'}> = [];

    // Use overrides when provided, otherwise fall back to config
    const surchargesSource = overrideSurcharges ?? PRICING_CONFIG.surcharges;

    const vehiclePricingForBase = params.overrideVehiclePricing ? {
      base: params.overrideVehiclePricing.base ?? getVehiclePricing(params.vehicleType).base,
      perKm: params.overrideVehiclePricing.perKm ?? getVehiclePricing(params.vehicleType).perKm,
    } : getVehiclePricing(params.vehicleType);

    const baseAmount = vehiclePricingForBase.base + this.calculateDistancePrice(params.distance || 0, vehiclePricingForBase.perKm);

    // Iterate through provided surcharges and determine applicability based on their fields
    Object.entries(surchargesSource).forEach(([key, surcharge]) => {
      const isAirportPickup = params.pickupLocation ? 
        params.pickupLocation.toLowerCase().includes('airport') || 
        params.pickupLocation.toLowerCase().includes('luchthaven') : false;

      let isApplicable = false;

      const hour = pickupTime.getHours();
      const day = pickupTime.getDay();

      // Evaluate applicability using the surcharge rule fields
      if (surcharge.hours && surcharge.hours.length === 2) {
        // nightTime style [start, end] where end may be smaller than start
        const [start, end] = surcharge.hours;
        if (start <= end) {
          isApplicable = hour >= start && hour < end;
        } else {
          // e.g., 22 -> 6
          isApplicable = hour >= start || hour < end;
        }
      }

      if (!isApplicable && surcharge.timeRanges && surcharge.timeRanges.length > 0) {
        isApplicable = surcharge.timeRanges.some(([start, end]) => hour >= start && hour < end);
      }

      if (!isApplicable && surcharge.days && surcharge.days.length > 0) {
        isApplicable = surcharge.days.includes(day);
      }

      // Specific named checks
      if (!isApplicable && key === 'holiday') {
        // reuse existing simple holiday logic from config
        const month = pickupTime.getMonth() + 1;
        const date = pickupTime.getDate();
        const holidays = [
          [1,1],[4,27],[5,5],[12,25],[12,26]
        ];
        isApplicable = holidays.some(([m,d]) => m === month && d === date);
      }

      if (!isApplicable && key === 'airportPickup') {
        isApplicable = !!isAirportPickup;
      }

      if (!isApplicable && key === 'shortDistance') {
        isApplicable = params.distance !== undefined && params.distance > 0 && params.distance < 3;
      }

      if (!isApplicable && key === 'rushHour') {
        if (surcharge.timeRanges && surcharge.days) {
          const isWeekday = surcharge.days.includes(day);
          const inRange = surcharge.timeRanges.some(([start, end]) => hour >= start && hour < end);
          isApplicable = isWeekday && inRange;
        }
      }

      if (isApplicable) {
        const amount = this.calculateSurchargeAmount(baseAmount, surcharge.factor, key);
        if (amount > 0) {
          surcharges.push({
            name: key,
            description: surcharge.description,
            amount: roundPrice(amount),
            type: 'percentage'
          });
        }
      }
    });

    return surcharges;
  }

  /**
   * Calculate individual surcharge amount
   */
  private static calculateSurchargeAmount(baseAmount: number, factor: number, surchargeType: string): number {
    switch (surchargeType) {
      case 'shortDistance':
        // For short distances, apply surcharge to minimum fare
        return baseAmount * (factor - 1);
      
      case 'airportPickup':
        // Airport surcharge on base amount
        return baseAmount * (factor - 1);
      
      default:
        // Standard percentage surcharge
        return baseAmount * (factor - 1);
    }
  }

  /**
   * Calculate stopover surcharge
   */
  private static calculateStopoverSurcharge(subtotal: number): number {
    // 10% surcharge for stopovers, minimum €2.50
    const surcharge = subtotal * 0.10;
    return Math.max(surcharge, 2.50);
  }

  /**
   * Apply return trip pricing
   */
  private static applyReturnTripPricing(subtotal: number): number {
    // 10% discount for return trips
    return subtotal * 0.90;
  }

  /**
   * Get estimate price without exact distance
   */
  static getEstimatePrice(
    vehicleType: string,
    estimatedDistance: number = 5,
    pickupTime?: Date
  ): PriceBreakdown {
    return this.calculatePrice({
      vehicleType,
      distance: estimatedDistance,
      duration: estimatedDistance * 2, // Rough estimate: 2 minutes per km in city
      pickupTime,
    });
  }

  /**
   * Compare prices between vehicle types
   */
  static comparePrices(
    params: PriceCalculationParams
  ): Array<{vehicleType: string, price: PriceBreakdown}> {
    const vehicleTypes = Object.keys(PRICING_CONFIG.baseRates);
    
    return vehicleTypes.map(vehicleType => ({
      vehicleType,
      price: this.calculatePrice({
        ...params,
        vehicleType
      })
    })).sort((a, b) => a.price.total - b.price.total);
  }

  /**
   * Format price breakdown for display
   */
  static formatPriceBreakdown(breakdown: PriceBreakdown): string {
    const lines = [
      `Base fare: €${breakdown.basePrice.toFixed(2)}`,
    ];
    
    if (breakdown.distancePrice > 0) {
      lines.push(`Distance: €${breakdown.distancePrice.toFixed(2)}`);
    }
    
    if (breakdown.timePrice > 0) {
      lines.push(`Time: €${breakdown.timePrice.toFixed(2)}`);
    }
    
    breakdown.surcharges.forEach(surcharge => {
      lines.push(`${surcharge.description}: €${surcharge.amount.toFixed(2)}`);
    });
    
    if (breakdown.tax > 0) {
      lines.push(`Tax: €${breakdown.tax.toFixed(2)}`);
    }
    
    lines.push(`Total: €${breakdown.total.toFixed(2)}`);
    
    if (breakdown.estimatedOnly) {
      lines.push('(Estimate - final price may vary)');
    }
    
    return lines.join('\n');
  }

  /**
   * Check if price is within reasonable bounds
   */
  static validatePrice(breakdown: PriceBreakdown): {valid: boolean, warnings: string[]} {
    const warnings: string[] = [];
    
    // Only warn for extreme prices (over €500)
    if (breakdown.total > 500) {
      warnings.push('Controleer de route - ongewoon hoge prijs');
    }
    
    // Check if using estimated distance
    if (breakdown.estimatedOnly) {
      warnings.push('Prijs is geschat - definitieve prijs kan afwijken');
    }
    
    return {
      valid: breakdown.total > 0 && breakdown.total < 1000,
      warnings
    };
  }
}