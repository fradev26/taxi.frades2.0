import { supabase } from "@/integrations/supabase/client";

export interface Trip {
  id: string;
  user_id: string;
  booking_reference: string;
  
  // Trip Details
  pickup_address: string;
  pickup_coordinates: { lat: number; lng: number };
  destination_address: string;
  destination_coordinates: { lat: number; lng: number };
  stopovers?: Array<{
    address: string;
    coordinates: { lat: number; lng: number };
    order: number;
  }>;
  
  // Scheduling
  scheduled_datetime: string;
  estimated_duration: number; // in minutes
  estimated_distance: number; // in kilometers
  
  // Vehicle & Driver
  vehicle_type: string;
  vehicle_details?: {
    make: string;
    model: string;
    color: string;
    license_plate: string;
  };
  driver_id?: string;
  driver_details?: {
    name: string;
    phone: string;
    photo_url?: string;
    rating: number;
  };
  
  // Pricing
  base_price: number;
  total_price: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Status & Tracking
  status: 'scheduled' | 'confirmed' | 'driver_assigned' | 'driver_enroute' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  current_location?: { lat: number; lng: number };
  driver_eta?: number; // in minutes
  
  // Guest Information (for non-logged in bookings)
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  
  // Metadata
  booking_type: 'regular' | 'hourly' | 'airport' | 'city_to_city';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface TripUpdate {
  status?: Trip['status'];
  current_location?: { lat: number; lng: number };
  driver_eta?: number;
  driver_details?: Trip['driver_details'];
  vehicle_details?: Trip['vehicle_details'];
}

/**
 * Get all trips for the authenticated user
 */
export const getUserTrips = async (
  status?: Trip['status'], 
  limit = 50, 
  offset = 0
): Promise<{ data: Trip[] | null; error: string | null }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // For now, return demo data since we don't have trips table yet
    const demoTrips: Trip[] = [
      {
        id: "trip-001",
        user_id: user.id,
        booking_reference: "FR-2024-001",
        pickup_address: "Brussels Central Station, Brussels, Belgium",
        pickup_coordinates: { lat: 50.8457, lng: 4.3574 },
        destination_address: "Brussels Airport (BRU), Zaventem, Belgium",
        destination_coordinates: { lat: 50.9014, lng: 4.4844 },
        scheduled_datetime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimated_duration: 45,
        estimated_distance: 12.5,
        vehicle_type: "business",
        vehicle_details: {
          make: "Mercedes-Benz",
          model: "E-Class",
          color: "Zwart",
          license_plate: "1-ABC-123"
        },
        driver_id: "driver-001",
        driver_details: {
          name: "Jan Janssens",
          phone: "+32 123 456 789",
          photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          rating: 4.8
        },
        base_price: 35.00,
        total_price: 47.50,
        currency: "EUR",
        payment_method: "wallet",
        payment_status: "paid",
        status: "confirmed",
        driver_eta: 8,
        booking_type: "regular",
        special_instructions: "Bel aan bij aankomst",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: "trip-002", 
        user_id: user.id,
        booking_reference: "FR-2024-002",
        pickup_address: "Antwerp Central Station, Antwerp, Belgium",
        pickup_coordinates: { lat: 51.2172, lng: 4.4206 },
        destination_address: "Brussels, Belgium",
        destination_coordinates: { lat: 50.8476, lng: 4.3572 },
        scheduled_datetime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        estimated_duration: 75,
        estimated_distance: 45.2,
        vehicle_type: "premium",
        base_price: 65.00,
        total_price: 78.50,
        currency: "EUR",
        payment_method: "ideal",
        payment_status: "pending",
        status: "scheduled",
        booking_type: "city_to_city",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: "trip-003",
        user_id: user.id,
        booking_reference: "FR-2024-003",
        pickup_address: "Gent-Sint-Pieters Station, Ghent, Belgium",
        pickup_coordinates: { lat: 51.0357, lng: 3.7097 },
        destination_address: "Bruges, Belgium", 
        destination_coordinates: { lat: 51.2093, lng: 3.2247 },
        scheduled_datetime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        estimated_duration: 45,
        estimated_distance: 50.1,
        vehicle_type: "economy",
        vehicle_details: {
          make: "Volkswagen",
          model: "Passat",
          color: "Blauw",
          license_plate: "2-DEF-456"
        },
        driver_details: {
          name: "Marie Dubois",
          phone: "+32 987 654 321", 
          rating: 4.9
        },
        base_price: 45.00,
        total_price: 52.75,
        currency: "EUR",
        payment_method: "wallet",
        payment_status: "paid",
        status: "completed",
        booking_type: "regular",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 85000000).toISOString()
      },
      {
        id: "trip-004",
        user_id: user.id,
        booking_reference: "FR-2024-004",
        pickup_address: "Brussels, Belgium",
        pickup_coordinates: { lat: 50.8476, lng: 4.3572 },
        destination_address: "Brussels, Belgium",
        destination_coordinates: { lat: 50.8476, lng: 4.3572 },
        scheduled_datetime: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        estimated_duration: 120, // 2 hours
        estimated_distance: 45.0,
        vehicle_type: "business",
        vehicle_details: {
          make: "BMW",
          model: "5 Series",
          color: "Grijs",
          license_plate: "3-GHI-789"
        },
        driver_details: {
          name: "Pierre Laurent",
          phone: "+32 456 789 123",
          rating: 4.7
        },
        base_price: 100.00,
        total_price: 125.00,
        currency: "EUR",
        payment_method: "credit_card",
        payment_status: "paid",
        status: "completed",
        booking_type: "hourly",
        special_instructions: "2 uur stadstour",
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date(Date.now() - 259200000).toISOString(),
        completed_at: new Date(Date.now() - 251000000).toISOString()
      }
    ];

    // Filter by status if provided
    const filteredTrips = status 
      ? demoTrips.filter(trip => trip.status === status)
      : demoTrips;

    // Apply pagination
    const paginatedTrips = filteredTrips.slice(offset, offset + limit);

    return { data: paginatedTrips, error: null };
  } catch (error) {
    console.error('Error fetching user trips:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get a specific trip by ID
 */
export const getTripById = async (tripId: string): Promise<{ data: Trip | null; error: string | null }> => {
  try {
    const { data: trips, error } = await getUserTrips();
    if (error || !trips) {
      return { data: null, error: error || "Failed to fetch trips" };
    }

    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
      return { data: null, error: "Trip not found" };
    }

    return { data: trip, error: null };
  } catch (error) {
    console.error('Error fetching trip:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Cancel a trip
 */
export const cancelTrip = async (
  tripId: string, 
  cancellationReason?: string
): Promise<{ data: Trip | null; error: string | null }> => {
  try {
    const { data: trip, error } = await getTripById(tripId);
    if (error || !trip) {
      return { data: null, error: error || "Trip not found" };
    }

    // Check if trip can be cancelled
    if (!['scheduled', 'confirmed', 'driver_assigned'].includes(trip.status)) {
      return { data: null, error: "Trip cannot be cancelled at this stage" };
    }

    // For demo, just return updated trip
    const updatedTrip: Trip = {
      ...trip,
      status: 'cancelled',
      cancellation_reason: cancellationReason,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { data: updatedTrip, error: null };
  } catch (error) {
    console.error('Error cancelling trip:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Update trip status (for real-time updates)
 */
export const updateTripStatus = async (
  tripId: string, 
  updates: TripUpdate
): Promise<{ data: Trip | null; error: string | null }> => {
  try {
    const { data: trip, error } = await getTripById(tripId);
    if (error || !trip) {
      return { data: null, error: error || "Trip not found" };
    }

    const updatedTrip: Trip = {
      ...trip,
      ...updates,
      updated_at: new Date().toISOString()
    };

    return { data: updatedTrip, error: null };
  } catch (error) {
    console.error('Error updating trip:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get trip status display information
 */
export const getTripStatusInfo = (status: Trip['status']) => {
  switch (status) {
    case 'scheduled':
      return { 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100', 
        label: 'Gepland',
        description: 'Rit is gepland' 
      };
    case 'confirmed':
      return { 
        color: 'text-green-600', 
        bgColor: 'bg-green-100', 
        label: 'Bevestigd',
        description: 'Rit is bevestigd' 
      };
    case 'driver_assigned':
      return { 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100', 
        label: 'Chauffeur toegewezen',
        description: 'Chauffeur is onderweg' 
      };
    case 'driver_enroute':
      return { 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100', 
        label: 'Onderweg',
        description: 'Chauffeur is onderweg naar u' 
      };
    case 'arrived':
      return { 
        color: 'text-indigo-600', 
        bgColor: 'bg-indigo-100', 
        label: 'Gearriveerd',
        description: 'Chauffeur is gearriveerd' 
      };
    case 'in_progress':
      return { 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100', 
        label: 'Onderweg',
        description: 'Rit is in uitvoering' 
      };
    case 'completed':
      return { 
        color: 'text-green-700', 
        bgColor: 'bg-green-50', 
        label: 'Voltooid',
        description: 'Rit is succesvol voltooid' 
      };
    case 'cancelled':
      return { 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        label: 'Geannuleerd',
        description: 'Rit is geannuleerd' 
      };
    default:
      return { 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100', 
        label: 'Onbekend',
        description: 'Status onbekend' 
      };
  }
};

/**
 * Format trip duration
 */
export const formatTripDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}u ${remainingMinutes}m` : `${hours}u`;
};

/**
 * Calculate trip progress percentage
 */
export const calculateTripProgress = (status: Trip['status']): number => {
  switch (status) {
    case 'scheduled': return 10;
    case 'confirmed': return 25;
    case 'driver_assigned': return 40;
    case 'driver_enroute': return 60;
    case 'arrived': return 75;
    case 'in_progress': return 85;
    case 'completed': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};