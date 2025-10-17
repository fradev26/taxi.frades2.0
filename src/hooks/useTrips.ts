import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for trip data (alias for bookings)
interface Trip {
  id: string;
  user_id: string;
  vehicle_id?: string;
  driver_id?: string;
  pickup_location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  dropoff_location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  booking_type: string;
  pickup_time: string;
  dropoff_time?: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  estimated_price?: number;
  final_price?: number;
  created_at: string;
  updated_at: string;
}

// Fetch user trips (all bookings for the user)
const fetchUserTrips = async (): Promise<Trip[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('pickup_time', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Hook for user trips
export const useTrips = () => {
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['user-trips'],
    queryFn: fetchUserTrips,
  });

  return {
    trips: trips || [],
    isLoading,
    error,
  };
};