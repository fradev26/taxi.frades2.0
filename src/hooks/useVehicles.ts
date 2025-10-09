import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  hourly_rate: number;
  per_km_rate: number;
  available: boolean;
  current_location?: string;
  created_at: string;
  updated_at: string;
}

interface VehicleFormData {
  name: string;
  type: string;
  capacity: string;
  hourly_rate: string;
  per_km_rate: string;
  available: boolean;
  current_location: string;
}

// API functions
const fetchVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchAvailableVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('available', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

const createVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicleData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateVehicle = async ({ id, ...updates }: Partial<Vehicle> & { id: string }): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from('vehicles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteVehicle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Custom hooks
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: fetchAvailableVehicles,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: (newVehicle) => {
      // Add to cache
      queryClient.setQueryData(['vehicles'], (oldData: Vehicle[] = []) => [
        newVehicle,
        ...oldData
      ]);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });

      toast({
        title: "Voertuig toegevoegd",
        description: `${newVehicle.name} is succesvol toegevoegd.`,
      });
    },
    onError: (error) => {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Fout bij toevoegen",
        description: "Kon het voertuig niet toevoegen. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (updatedVehicle) => {
      // Update cache
      queryClient.setQueryData(['vehicles'], (oldData: Vehicle[] = []) => 
        oldData.map(vehicle => 
          vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
        )
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });

      toast({
        title: "Voertuig bijgewerkt",
        description: `${updatedVehicle.name} is succesvol bijgewerkt.`,
      });
    },
    onError: (error) => {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon het voertuig niet bijwerken. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData(['vehicles'], (oldData: Vehicle[] = []) => 
        oldData.filter(vehicle => vehicle.id !== deletedId)
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });

      toast({
        title: "Voertuig verwijderd",
        description: "Het voertuig is succesvol verwijderd.",
      });
    },
    onError: (error) => {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon het voertuig niet verwijderen. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
}

// Utility function to transform form data
export function transformVehicleFormData(formData: VehicleFormData): Omit<Vehicle, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: formData.name.trim(),
    type: formData.type.trim(),
    capacity: parseInt(formData.capacity) || 0,
    hourly_rate: parseFloat(formData.hourly_rate) || 0,
    per_km_rate: parseFloat(formData.per_km_rate) || 0,
    available: formData.available,
    current_location: formData.current_location.trim() || undefined,
  };
}