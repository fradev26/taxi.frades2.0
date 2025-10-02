export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          user_id: string | null
          company_id: string | null
          vehicle_id: string | null
          pickup_address: string | null
          destination_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          destination_lat: number | null
          destination_lng: number | null
          waypoints: Json | null
          scheduled_time: string | null
          estimated_duration: number | null
          estimated_distance: number | null
          estimated_cost: number | null
          final_cost: number | null
          status: string | null
          price: number | null
          payment_status: string | null
          payment_method: string | null
          payment_id: string | null
          vehicle_type: string | null
          confirmation_sent: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          vehicle_id?: string | null
          pickup_address?: string | null
          destination_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          destination_lat?: number | null
          destination_lng?: number | null
          waypoints?: Json | null
          scheduled_time?: string | null
          estimated_duration?: number | null
          estimated_distance?: number | null
          estimated_cost?: number | null
          final_cost?: number | null
          status?: string | null
          price?: number | null
          payment_status?: string | null
          payment_method?: string | null
          payment_id?: string | null
          vehicle_type?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          company_id?: string | null
          vehicle_id?: string | null
          pickup_address?: string | null
          destination_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          destination_lat?: number | null
          destination_lng?: number | null
          waypoints?: Json | null
          scheduled_time?: string | null
          estimated_duration?: number | null
          estimated_distance?: number | null
          estimated_cost?: number | null
          final_cost?: number | null
          status?: string | null
          price?: number | null
          payment_status?: string | null
          payment_method?: string | null
          payment_id?: string | null
          vehicle_type?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          name: string | null
          type: string | null
          capacity: number | null
          hourly_rate: number | null
          per_km_rate: number | null
          available: boolean | null
          current_location: string | null
          current_lat: number | null
          current_lng: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          type?: string | null
          capacity?: number | null
          hourly_rate?: number | null
          per_km_rate?: number | null
          available?: boolean | null
          current_location?: string | null
          current_lat?: number | null
          current_lng?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          type?: string | null
          capacity?: number | null
          hourly_rate?: number | null
          per_km_rate?: number | null
          available?: boolean | null
          current_location?: string | null
          current_lat?: number | null
          current_lng?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bookings_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          pickup_address: string
          destination_address: string
          scheduled_time: string
          status: string
          price: number
          vehicle_type: string
          user_email: string
          user_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']