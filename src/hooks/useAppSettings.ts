import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface PricingSettings {
  baseFare: string;
  pricePerKm: string;
  nightSurcharge: string;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch all settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Fout bij laden instellingen',
        description: 'Kon instellingen niet laden. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get pricing settings in a convenient format
  const getPricingSettings = (): PricingSettings => {
    const baseFare = settings.find(s => s.key === 'base_fare')?.value || '5.00';
    const pricePerKm = settings.find(s => s.key === 'price_per_km')?.value || '2.50';
    const nightSurcharge = settings.find(s => s.key === 'night_surcharge')?.value || '1.25';

    return {
      baseFare,
      pricePerKm,
      nightSurcharge,
    };
  };

  // Update multiple settings
  const updateSettings = async (updates: { key: string; value: string }[]) => {
    try {
      setIsSaving(true);
      
      // Update each setting
      const promises = updates.map(({ key, value }) =>
        supabase
          .from('app_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} settings`);
      }

      // Refresh settings
      await fetchSettings();

      toast({
        title: 'Instellingen opgeslagen',
        description: 'De instellingen zijn succesvol bijgewerkt.',
      });

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Fout bij opslaan',
        description: 'Kon instellingen niet opslaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update pricing settings specifically
  const updatePricingSettings = async (pricing: PricingSettings) => {
    const updates = [
      { key: 'base_fare', value: pricing.baseFare },
      { key: 'price_per_km', value: pricing.pricePerKm },
      { key: 'night_surcharge', value: pricing.nightSurcharge },
    ];

    return await updateSettings(updates);
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    fetchSettings,
    updateSettings,
    getPricingSettings,
    updatePricingSettings,
  };
}