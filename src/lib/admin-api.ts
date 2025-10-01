/**
 * Admin API Module
 * Centralized database access layer for admin panel operations
 * Provides optimized queries and consistent error handling
 */

import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Types for optimized queries
export interface VehicleWithStats {
  id: string;
  name: string | null;
  type: string | null;
  capacity: number | null;
  hourly_rate: number | null;
  per_km_rate: number | null;
  available: boolean | null;
  current_location: string | null;
  current_lat: number | null;
  current_lng: number | null;
  created_at: string | null;
  updated_at: string | null;
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
}

export interface BookingWithDetails {
  id: string;
  user_id?: string;
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
  vehicle_name?: string;
  user_email?: string;
  company_name?: string;
}

export interface ProfileWithEmail {
  id: string;
  user_id: string;
  display_name?: string;
  phone?: string;
  company_name?: string;
  btw_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

/**
 * Vehicle Management API
 */
export const vehicleAPI = {
  /**
   * Get all vehicles with booking statistics
   * Uses optimized RPC function for better performance
   */
  async getVehiclesWithStats(): Promise<VehicleWithStats[]> {
    const { data, error } = await supabase.rpc('get_vehicles_with_stats');
    
    if (error) {
      console.error('Error loading vehicles with stats:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Get all vehicles (basic query)
   */
  async getVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicle: TablesInsert<'vehicles'>) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  /**
   * Update an existing vehicle
   */
  async updateVehicle(id: string, updates: TablesUpdate<'vehicles'>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  /**
   * Delete a vehicle
   */
  async deleteVehicle(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  /**
   * Toggle vehicle availability
   */
  async toggleAvailability(id: string, available: boolean) {
    return vehicleAPI.updateVehicle(id, { available });
  },
};

/**
 * Booking Management API
 */
export const bookingAPI = {
  /**
   * Get all bookings with related details
   * Uses optimized RPC function for better performance
   */
  async getBookingsWithDetails(): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase.rpc('get_bookings_with_details');
    
    if (error) {
      console.error('Error loading bookings with details:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  /**
   * Update booking payment status
   */
  async updatePaymentStatus(id: string, paymentStatus: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },
};

/**
 * Driver/Profile Management API
 */
export const driverAPI = {
  /**
   * Get all profiles with user emails
   * Uses optimized RPC function for better performance
   */
  async getProfilesWithEmails(): Promise<ProfileWithEmail[]> {
    const { data, error } = await supabase.rpc('get_profiles_with_emails');
    
    if (error) {
      console.error('Error loading profiles with emails:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Create a new driver profile
   */
  async createDriver(profile: TablesInsert<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  /**
   * Update an existing driver profile
   */
  async updateDriver(id: string, updates: TablesUpdate<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  /**
   * Delete a driver profile
   */
  async deleteDriver(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

/**
 * Audit Logging
 */
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
}

export const auditAPI = {
  /**
   * Log an admin action
   */
  async logAction(action: string, resourceType: string, resourceId: string, oldValues?: Record<string, unknown> | null, newValues?: Record<string, unknown> | null) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
      }]);
    
    if (error) {
      console.error('Error logging audit action:', error);
    }
  },

  /**
   * Get audit logs with filters
   */
  async getLogs(resourceType?: string, resourceId?: string, limit: number = 100) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }
    
    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },
};

/**
 * Batch operations for efficiency
 */
export const batchAPI = {
  /**
   * Update multiple vehicles at once
   */
  async updateMultipleVehicles(updates: Array<{ id: string; data: TablesUpdate<'vehicles'> }>) {
    const promises = updates.map(({ id, data }) => 
      vehicleAPI.updateVehicle(id, data)
    );
    const results = await Promise.allSettled(promises);
    
    // Log batch operation
    await auditAPI.logAction('batch_update', 'vehicles', 'multiple', null, { count: updates.length });
    
    return results;
  },

  /**
   * Update multiple booking statuses at once
   */
  async updateMultipleBookingStatuses(updates: Array<{ id: string; status: string }>) {
    const promises = updates.map(({ id, status }) => 
      bookingAPI.updateBookingStatus(id, status)
    );
    const results = await Promise.allSettled(promises);
    
    // Log batch operation
    await auditAPI.logAction('batch_status_update', 'bookings', 'multiple', null, { count: updates.length });
    
    return results;
  },

  /**
   * Update multiple payment statuses at once
   */
  async updateMultiplePaymentStatuses(updates: Array<{ id: string; paymentStatus: string }>) {
    const promises = updates.map(({ id, paymentStatus }) => 
      bookingAPI.updatePaymentStatus(id, paymentStatus)
    );
    const results = await Promise.allSettled(promises);
    
    // Log batch operation
    await auditAPI.logAction('batch_payment_update', 'bookings', 'multiple', null, { count: updates.length });
    
    return results;
  },
};

/**
 * Real-time subscription management
 */
export const realtimeAPI = {
  /**
   * Subscribe to booking changes
   */
  subscribeToBookings(callback: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void) {
    return supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to vehicle changes
   */
  subscribeToVehicles(callback: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void) {
    return supabase
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel);
  },
};

/**
 * Export all APIs as a single object for convenience
 */
export const adminAPI = {
  vehicles: vehicleAPI,
  bookings: bookingAPI,
  drivers: driverAPI,
  batch: batchAPI,
  audit: auditAPI,
  realtime: realtimeAPI,
};

export default adminAPI;
