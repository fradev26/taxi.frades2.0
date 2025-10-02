/**
 * Pricing Service
 * 
 * Handles all pricing calculations including base rates, distance-based pricing,
 * time-based surcharges, and final price computation.
 */

import { PRICING_CONFIG, getVehiclePricing, isSurchargeApplicable, roundPrice } from '@/config/pricing';
import type { DistanceResult } from './distanceService';

export interface PriceCalculationParams {
  vehicleType: string;
  distance?: number;        // Distance in km
  duration?: number;        // Duration in minutes
  pickupTime?: Date;        // Pickup date and time
  pickupLocation?: string;  // Pickup location for airport detection
  destinationLocation?: string; // Destination location
  hasStopover?: boolean;    // Whether there are stops
  isReturn?: boolean;       // Round trip booking
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
    const vehiclePricing = getVehiclePricing(params.vehicleType);
    const pickupTime = params.pickupTime || new Date();
    
    // Base calculations
    const basePrice = vehiclePricing.base;
    const distancePrice = this.calculateDistancePrice(params.distance || 0, vehiclePricing.perKm);
    const timePrice = this.calculateTimePrice(params.duration || 0, vehiclePricing.perMinute);
    
    // Calculate surcharges
    const surcharges = this.calculateSurcharges(params, pickupTime);
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
    hasStopover?: boolean
  ): PriceBreakdown {
    return this.calculatePrice({
      vehicleType,
      distance: distanceResult.distance,
      duration: distanceResult.duration,
      pickupTime,
      pickupLocation,
      hasStopover,
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
    pickupTime: Date
  ): Array<{name: string, description: string, amount: number, type: 'absolute' | 'percentage'}> {
    const surcharges: Array<{name: string, description: string, amount: number, type: 'absolute' | 'percentage'}> = [];
    const baseAmount = getVehiclePricing(params.vehicleType).base + 
                      this.calculateDistancePrice(params.distance || 0, getVehiclePricing(params.vehicleType).perKm);
    
    // Check each surcharge type
    Object.entries(PRICING_CONFIG.surcharges).forEach(([key, surcharge]) => {
      const isAirportPickup = params.pickupLocation ? 
        params.pickupLocation.toLowerCase().includes('airport') || 
        params.pickupLocation.toLowerCase().includes('luchthaven') : false;
        
      const isApplicable = isSurchargeApplicable(
        key, 
        pickupTime, 
        isAirportPickup, 
        params.distance || 0
      );
      
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