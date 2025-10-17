import { supabase } from "@/integrations/supabase/client";
import type { Database, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Type-safe Supabase wrapper
// Uses type assertions to work around TypeScript resolution issues
export const typedSupabase = {
  // Vehicles operations
  vehicles: {
    select: () => (supabase as any).from('vehicles').select('*'),
    insert: (data: TablesInsert<'vehicles'>[]) => (supabase as any).from('vehicles').insert(data),
    update: (id: string, data: TablesUpdate<'vehicles'>) => 
      (supabase as any).from('vehicles').update(data).eq('id', id),
    delete: (id: string) => (supabase as any).from('vehicles').delete().eq('id', id),
  },
  
  // Bookings operations
  bookings: {
    select: () => (supabase as any).from('bookings').select('*'),
    insert: (data: TablesInsert<'bookings'>[]) => (supabase as any).from('bookings').insert(data),
    update: (id: string, data: TablesUpdate<'bookings'>) => 
      (supabase as any).from('bookings').update(data).eq('id', id),
    delete: (id: string) => (supabase as any).from('bookings').delete().eq('id', id),
  },
  
  // Profiles operations
  profiles: {
  select: () => (supabase as any).from('profiles').select('*'),
  insert: (data: TablesInsert<'profiles'>[]) => (supabase as any).from('profiles').insert(data),
    // Removed CRUD operations after migration to profiles
  // ...existing code...
  },  // Auth operations (pass-through)
  auth: supabase.auth,
  
  // RPC operations (pass-through)
  rpc: supabase.rpc.bind(supabase),
};

export default typedSupabase;