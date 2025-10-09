import { useState, useEffect, useCallback } from 'react';
import { 
  getUserTrips,
  getTripById,
  cancelTrip,
  updateTripStatus,
  Trip,
  TripUpdate
} from '@/services/tripService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UseTripsResult {
  // State
  trips: Trip[];
  upcomingTrips: Trip[];
  pastTrips: Trip[];
  activeTrips: Trip[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Actions
  refreshTrips: () => Promise<void>;
  cancelTripById: (tripId: string, reason?: string) => Promise<boolean>;
  updateTrip: (tripId: string, updates: TripUpdate) => Promise<boolean>;
  getTripDetails: (tripId: string) => Promise<Trip | null>;
  
  // Utilities
  getTripsByStatus: (status: Trip['status']) => Trip[];
  getUpcomingTripsCount: () => number;
  getActiveTripsCount: () => number;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Categorize trips
  const upcomingTrips = trips.filter(trip => 
    ['scheduled', 'confirmed', 'driver_assigned', 'driver_enroute', 'arrived'].includes(trip.status) &&
    new Date(trip.scheduled_datetime) > new Date()
  );

  const pastTrips = trips.filter(trip => 
    ['completed', 'cancelled'].includes(trip.status) ||
    (trip.status === 'scheduled' && new Date(trip.scheduled_datetime) < new Date())
  );

  const activeTrips = trips.filter(trip =>
    ['driver_enroute', 'arrived', 'in_progress'].includes(trip.status)
  );

  // Load trips
  const loadTrips = useCallback(async () => {
    if (authLoading || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getUserTrips();
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Error loading trips",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setTrips(result.data || []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load trips';
      setError(errorMsg);
      toast({
        title: "Error loading trips",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  // Refresh trips
  const refreshTrips = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const result = await getUserTrips();
      
      if (result.error) {
        setError(result.error);
      } else {
        setTrips(result.data || []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh trips');
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  // Cancel trip
  const cancelTripById = useCallback(async (tripId: string, reason?: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to cancel trips",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = await cancelTrip(tripId, reason);
      
      if (result.error) {
        toast({
          title: "Failed to cancel trip",
          description: result.error,
          variant: "destructive"
        });
        return false;
      } else {
        // Update local state
        if (result.data) {
          setTrips(prevTrips => 
            prevTrips.map(trip => 
              trip.id === tripId ? result.data! : trip
            )
          );
        }
        
        toast({
          title: "Trip cancelled",
          description: "Your trip has been successfully cancelled",
        });
        return true;
      }
    } catch (err) {
      toast({
        title: "Failed to cancel trip",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Update trip
  const updateTrip = useCallback(async (tripId: string, updates: TripUpdate): Promise<boolean> => {
    try {
      const result = await updateTripStatus(tripId, updates);
      
      if (result.error) {
        console.error('Failed to update trip:', result.error);
        return false;
      } else {
        // Update local state
        if (result.data) {
          setTrips(prevTrips => 
            prevTrips.map(trip => 
              trip.id === tripId ? result.data! : trip
            )
          );
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to update trip:', err);
      return false;
    }
  }, []);

  // Get trip details
  const getTripDetails = useCallback(async (tripId: string): Promise<Trip | null> => {
    try {
      const result = await getTripById(tripId);
      
      if (result.error) {
        toast({
          title: "Failed to load trip details",
          description: result.error,
          variant: "destructive"
        });
        return null;
      }
      
      return result.data;
    } catch (err) {
      toast({
        title: "Failed to load trip details",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Utility functions
  const getTripsByStatus = useCallback((status: Trip['status']): Trip[] => {
    return trips.filter(trip => trip.status === status);
  }, [trips]);

  const getUpcomingTripsCount = useCallback((): number => {
    return upcomingTrips.length;
  }, [upcomingTrips]);

  const getActiveTripsCount = useCallback((): number => {
    return activeTrips.length;
  }, [activeTrips]);

  // Load trips when component mounts or user changes
  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Auto-refresh active trips every 30 seconds
  useEffect(() => {
    if (!user || activeTrips.length === 0) return;
    
    const interval = setInterval(() => {
      refreshTrips();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user, activeTrips.length, refreshTrips]);

  return {
    // State
    trips,
    upcomingTrips,
    pastTrips,
    activeTrips,
    isLoading,
    isRefreshing,
    error,
    
    // Actions
    refreshTrips,
    cancelTripById,
    updateTrip,
    getTripDetails,
    
    // Utilities
    getTripsByStatus,
    getUpcomingTripsCount,
    getActiveTripsCount
  };
}