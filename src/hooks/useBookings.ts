import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for booking data
interface BookingWithDetails {
  id: string;
  user_id: string;
  company_id?: string;
  vehicle_id?: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_address: string;
  destination_lat?: number;
  destination_lng?: number;
  waypoints?: any;
  scheduled_time: string;
  estimated_duration?: number;
  estimated_distance?: number;
  estimated_cost?: number;
  final_cost?: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  payment_id?: string;
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  vehicle_name?: string;
  user_email?: string;
  company_name?: string;
}

interface BookingFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Optimized bookings fetcher
const fetchBookingsWithDetails = async (filters: BookingFilters = {}): Promise<BookingWithDetails[]> => {
  try {
    // Use the optimized RPC function
    const { data, error } = await supabase.rpc('get_bookings_with_details');
    
    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    let bookings = data || [];

    // Apply client-side filters if needed
    if (filters.status && filters.status !== 'all') {
      bookings = bookings.filter((booking: BookingWithDetails) => booking.status === filters.status);
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      bookings = bookings.filter((booking: BookingWithDetails) => booking.payment_status === filters.paymentStatus);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      bookings = bookings.filter((booking: BookingWithDetails) => 
        new Date(booking.created_at) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      bookings = bookings.filter((booking: BookingWithDetails) => 
        new Date(booking.created_at) <= toDate
      );
    }

    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Single booking fetcher
const fetchBookingById = async (id: string): Promise<BookingWithDetails> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      vehicles(name),
      profiles(email),
      companies(name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Update booking status
const updateBookingStatus = async ({ 
  bookingId, 
  status, 
  paymentStatus 
}: { 
  bookingId: string; 
  status?: string; 
  paymentStatus?: string; 
}): Promise<BookingWithDetails> => {
  const updates: any = {
    updated_at: new Date().toISOString()
  };

  if (status) updates.status = status;
  if (paymentStatus) updates.payment_status = paymentStatus;

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Custom hooks
export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => fetchBookingsWithDetails(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBookingById(id),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!id,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: (updatedBooking) => {
      // Update the bookings list cache
      queryClient.setQueryData(['bookings'], (oldData: BookingWithDetails[] = []) => {
        return oldData.map(booking => 
          booking.id === updatedBooking.id ? updatedBooking : booking
        );
      });

      // Update the single booking cache
      queryClient.setQueryData(['booking', updatedBooking.id], updatedBooking);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      toast({
        title: "Status bijgewerkt",
        description: "De boekingstatus is succesvol bijgewerkt.",
      });
    },
    onError: (error) => {
      console.error('Error updating booking status:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon de boekingstatus niet bijwerken. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
}

// Prefetch function for better UX
export function usePrefetchBooking() {
  const queryClient = useQueryClient();

  const prefetchBooking = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['booking', id],
      queryFn: () => fetchBookingById(id),
      staleTime: 1 * 60 * 1000,
    });
  };

  return prefetchBooking;
}

// Background refresh
export function useBookingsBackgroundRefresh() {
  const queryClient = useQueryClient();

  const refreshBookings = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  return refreshBookings;
}