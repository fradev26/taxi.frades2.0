import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for booking data matching database schema
interface BookingWithDetails {
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
  duration_hours?: number;
  estimated_distance?: number;
  estimated_duration?: number;
  estimated_price?: number;
  final_price?: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  special_requests?: string;
  passenger_count: number;
  created_at: string;
  updated_at: string;
  vehicle_name?: string;
  user_email?: string;
  driver_name?: string;
}

interface BookingFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Fetch bookings directly from bookings table
const fetchBookingsWithDetails = async (filters: BookingFilters = {}): Promise<BookingWithDetails[]> => {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles:user_id (
          email,
          first_name,
          last_name
        ),
        vehicles:vehicle_id (
          make,
          model,
          license_plate
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    if (filters.dateFrom) {
      query = query.gte('pickup_time', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('pickup_time', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const transformedData = (data || []).map(booking => ({
      ...booking,
      user_email: booking.profiles?.email || '',
      vehicle_name: booking.vehicles ? `${booking.vehicles.make} ${booking.vehicles.model}` : undefined,
      driver_name: booking.driver_id ? 'Assigned Driver' : undefined
    }));

    return transformedData;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Create booking
const createBooking = async (bookingData: any): Promise<BookingWithDetails> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update booking
const updateBooking = async (id: string, updates: Partial<BookingWithDetails>): Promise<BookingWithDetails> => {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete booking
const deleteBooking = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Custom hooks
export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => fetchBookingsWithDetails(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Boeking aangemaakt!",
        description: "Uw boeking is succesvol aangemaakt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout bij aanmaken boeking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BookingWithDetails> }) =>
      updateBooking(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Boeking bijgewerkt!",
        description: "De boeking is succesvol bijgewerkt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout bij bijwerken boeking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Boeking verwijderd!",
        description: "De boeking is succesvol verwijderd.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout bij verwijderen boeking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
