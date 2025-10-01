/**
 * Distance Calculation Service
 * 
 * Handles distance and duration calculations between locations using Google Maps API
 * with fallback to straight-line distance calculations.
 */

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

export interface DistanceResult {
  distance: number;        // Distance in kilometers
  duration: number;        // Duration in minutes
  status: 'success' | 'fallback' | 'error';
  route?: any;            // Google Maps route object
  error?: string;
}

export interface LocationCoords {
  lat: number;
  lng: number;
}

export class DistanceService {
  private static cache = new Map<string, DistanceResult>();
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Calculate distance and duration between two locations
   */
  static async calculateDistance(
    origin: string | LocationCoords,
    destination: string | LocationCoords,
    waypoints?: string[]
  ): Promise<DistanceResult> {
    const cacheKey = this.getCacheKey(origin, destination, waypoints);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Try Google Maps Distance Matrix API first
      const result = await this.calculateWithGoogleMaps(origin, destination, waypoints);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Google Maps distance calculation failed, using fallback:', error);
      
      // Fallback to straight-line distance
      const fallbackResult = await this.calculateStraightLineDistance(origin, destination);
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Calculate distance using Google Maps Distance Matrix API
   */
  private static async calculateWithGoogleMaps(
    origin: string | LocationCoords,
    destination: string | LocationCoords,
    waypoints?: string[]
  ): Promise<DistanceResult> {
    return new Promise((resolve, reject) => {
      if (!window.google?.maps) {
        reject(new Error('Google Maps API not available'));
        return;
      }

      const service = new window.google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [this.formatLocation(origin)],
        destinations: [this.formatLocation(destination)],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response: any, status: any) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0]?.elements[0];
          
          if (element?.status === window.google.maps.DistanceMatrixElementStatus.OK) {
            const distance = element.distance.value / 1000; // Convert to km
            const duration = element.duration.value / 60;   // Convert to minutes

            resolve({
              distance: Math.round(distance * 100) / 100, // Round to 2 decimals
              duration: Math.ceil(duration), // Round up to next minute
              status: 'success'
            });
          } else {
            reject(new Error(`Distance calculation failed: ${element?.status}`));
          }
        } else {
          reject(new Error(`Google Maps API error: ${status}`));
        }
      });
    });
  }

  /**
   * Fallback straight-line distance calculation
   */
  private static async calculateStraightLineDistance(
    origin: string | LocationCoords,
    destination: string | LocationCoords
  ): Promise<DistanceResult> {
    try {
      const originCoords = await this.getCoordinates(origin);
      const destCoords = await this.getCoordinates(destination);
      
      const distance = this.haversineDistance(originCoords, destCoords);
      
      // Estimate driving time (assume average 40 km/h in city)
      const estimatedDuration = (distance / 40) * 60; // minutes
      
      return {
        distance: Math.round(distance * 100) / 100,
        duration: Math.ceil(estimatedDuration),
        status: 'fallback'
      };
    } catch (error) {
      return {
        distance: 0,
        duration: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get coordinates for a location
   */
  private static async getCoordinates(location: string | LocationCoords): Promise<LocationCoords> {
    if (typeof location === 'object') {
      return location;
    }

    // Try to use Google Maps Geocoding API
    if (window.google?.maps) {
      return new Promise((resolve, reject) => {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address: location }, (results: any, status: any) => {
          if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    }

    // Fallback: try to extract coordinates from string or use default
    throw new Error('Cannot determine coordinates without Google Maps API');
  }

  /**
   * Calculate straight-line distance using Haversine formula
   */
  private static haversineDistance(coord1: LocationCoords, coord2: LocationCoords): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format location for Google Maps API
   */
  private static formatLocation(location: string | LocationCoords): string | any {
    if (typeof location === 'string') {
      return location;
    }
    return new (window.google?.maps?.LatLng || Object)(location.lat, location.lng);
  }

  /**
   * Generate cache key for distance calculation
   */
  private static getCacheKey(
    origin: string | LocationCoords,
    destination: string | LocationCoords,
    waypoints?: string[]
  ): string {
    const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
    const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
    const waypointsStr = waypoints ? waypoints.join('|') : '';
    
    return `${originStr}->${destStr}${waypointsStr ? `|${waypointsStr}` : ''}`;
  }

  /**
   * Get result from cache if not expired
   */
  private static getFromCache(key: string): DistanceResult | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - (cached as any).timestamp < this.CACHE_DURATION) {
      return cached;
    }
    return null;
  }

  /**
   * Store result in cache with timestamp
   */
  private static setCache(key: string, result: DistanceResult): void {
    (result as any).timestamp = Date.now();
    this.cache.set(key, result);
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - (value as any).timestamp >= this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Estimate if location is an airport
   */
  static isAirportLocation(location: string): boolean {
    const airportKeywords = [
      'airport', 'luchthaven', 'bru', 'brussels airport',
      'schiphol', 'ams', 'eindhoven airport', 'ehv',
      'maastricht airport', 'mst', 'rotterdam airport', 'rtm'
    ];
    
    const locationLower = location.toLowerCase();
    return airportKeywords.some(keyword => locationLower.includes(keyword));
  }
}