/**
 * Pricing Configuration for Taxi Services
 * 
 * This file contains all pricing rules, rates, and surcharges for the taxi booking system.
 * Update these values to adjust pricing without code changes.
 */

export interface VehiclePricing {
  base: number;           // Base fare in EUR
  perKm: number;         // Rate per kilometer in EUR
  perMinute: number;     // Rate per minute in EUR (for traffic/waiting time)
  minimum: number;       // Minimum fare in EUR
}

export interface SurchargeRule {
  factor: number;        // Multiplier (1.25 = 25% surcharge)
  hours?: number[];      // [start, end] hours (24h format)
  timeRanges?: number[][]; // Multiple time ranges [[7,9], [17,19]]
  days?: number[];       // Days of week (0 = Sunday, 6 = Saturday)
  description: string;   // User-friendly description
}

export interface PricingConfig {
  baseRates: Record<string, VehiclePricing>;
  surcharges: Record<string, SurchargeRule>;
  settings: {
    currency: string;
    taxRate: number;         // VAT/BTW rate (0.21 = 21%)
    roundingPrecision: number; // Decimal places for final price
    minimumBookingTime: number; // Minimum booking time in minutes
  };
}

export const PRICING_CONFIG: PricingConfig = {
  baseRates: {
    standard: {
      base: 5.50,         // Standard sedan base fare
      perKm: 1.85,        // Per kilometer rate
      perMinute: 0.35,    // Per minute rate (for waiting/traffic)
      minimum: 12.50      // Minimum fare
    },
    luxury: {
      base: 8.50,         // Luxury vehicle base fare
      perKm: 2.75,        // Higher per km rate for luxury
      perMinute: 0.55,    // Premium per minute rate
      minimum: 18.00      // Higher minimum fare
    },
    minibus: {
      base: 12.00,        // Minibus/van base fare
      perKm: 2.25,        // Group vehicle per km rate
      perMinute: 0.45,    // Group vehicle per minute rate
      minimum: 25.00      // Group minimum fare
    },
    suv: {
      base: 7.00,         // SUV base fare
      perKm: 2.15,        // SUV per km rate
      perMinute: 0.45,    // SUV per minute rate
      minimum: 15.00      // SUV minimum fare
    }
  },

  surcharges: {
    nightTime: {
      factor: 1.25,       // 25% surcharge
      hours: [22, 6],     // 10 PM to 6 AM
      description: "Nachttarief (22:00 - 06:00)"
    },
    weekend: {
      factor: 1.15,       // 15% surcharge
      days: [0, 6],       // Sunday and Saturday
      description: "Weekend toeslag"
    },
    holiday: {
      factor: 1.35,       // 35% surcharge
      description: "Feestdag toeslag"
    },
    rushHour: {
      factor: 1.20,       // 20% surcharge
      timeRanges: [[7, 9], [17, 19]], // 7-9 AM and 5-7 PM
      days: [1, 2, 3, 4, 5], // Monday to Friday
      description: "Spitsuur toeslag (07:00-09:00, 17:00-19:00)"
    },
    airportPickup: {
      factor: 1.10,       // 10% surcharge
      description: "Luchthaven ophaalservice"
    },
    shortDistance: {
      factor: 1.50,       // 50% surcharge for very short trips
      description: "Korte afstand toeslag (< 3km)"
    }
  },

  settings: {
    currency: "EUR",
    taxRate: 0.21,        // 21% BTW (VAT)
    roundingPrecision: 2, // Round to cents
    minimumBookingTime: 120 // 2 hours minimum advance booking
  }
};

/**
 * Helper function to get vehicle pricing
 */
export function getVehiclePricing(vehicleType: string): VehiclePricing {
  const normalizedType = vehicleType.toLowerCase();
  return PRICING_CONFIG.baseRates[normalizedType] || PRICING_CONFIG.baseRates.standard;
}

/**
 * Helper function to check if a surcharge applies
 */
export function isSurchargeApplicable(
  surchargeKey: string, 
  pickupTime: Date,
  isAirportPickup: boolean = false,
  distance: number = 0
): boolean {
  const surcharge = PRICING_CONFIG.surcharges[surchargeKey];
  if (!surcharge) return false;

  const hour = pickupTime.getHours();
  const day = pickupTime.getDay();

  switch (surchargeKey) {
    case 'nightTime':
      return surcharge.hours ? 
        (hour >= surcharge.hours[0] || hour < surcharge.hours[1]) : false;
    
    case 'weekend':
      return surcharge.days ? surcharge.days.includes(day) : false;
    
    case 'holiday':
      // TODO: Implement holiday detection based on Dutch holidays
      return isHoliday(pickupTime);
    
    case 'rushHour':
      if (!surcharge.timeRanges || !surcharge.days) return false;
      const isWeekday = surcharge.days.includes(day);
      const isRushHour = surcharge.timeRanges.some(([start, end]) => 
        hour >= start && hour < end
      );
      return isWeekday && isRushHour;
    
    case 'airportPickup':
      return isAirportPickup;
    
    case 'shortDistance':
      return distance > 0 && distance < 3; // Less than 3km
    
    default:
      return false;
  }
}

/**
 * Check if a date is a Dutch public holiday
 * TODO: Implement comprehensive holiday detection
 */
function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Simple holiday check - extend as needed
  const holidays = [
    [1, 1],   // New Year's Day
    [4, 27],  // King's Day
    [5, 5],   // Liberation Day
    [12, 25], // Christmas Day
    [12, 26], // Boxing Day
  ];
  
  return holidays.some(([m, d]) => month === m && day === d);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: PRICING_CONFIG.settings.currency,
    minimumFractionDigits: PRICING_CONFIG.settings.roundingPrecision,
    maximumFractionDigits: PRICING_CONFIG.settings.roundingPrecision,
  }).format(amount);
}

/**
 * Round price according to configuration
 */
export function roundPrice(amount: number): number {
  const precision = Math.pow(10, PRICING_CONFIG.settings.roundingPrecision);
  return Math.round(amount * precision) / precision;
}