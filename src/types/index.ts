export interface BookingFormData {
  pickup: string;
  destination: string;
  stopover?: string; // Keep for backwards compatibility
  stopovers: Stopover[];
  date: string;
  time: string;
  paymentMethod: string;
  vehicleType?: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  // Route information
  estimatedDistance?: number; // in meters
  estimatedDuration?: number; // in seconds
  estimatedDurationInTraffic?: number; // in seconds with traffic
  // Guest booking fields
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface HourlyBookingData {
  duration: number; // hours
  startDate: Date | null;
  startTime: string;
  pickupLocation: string;
  pickupCoords?: { lat: number; lng: number };
  stopovers: Stopover[];
  vehicleType: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface Stopover {
  id: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  duration?: number; // minutes (optional for regular rides)
}

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  hourlyRate: number;
  maxPassengers: number;
  features: string[];
}

