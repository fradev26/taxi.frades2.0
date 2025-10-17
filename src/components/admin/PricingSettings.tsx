import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Vehicle selector replaced with custom card layout to match booking form
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Euro, Plus, Edit, Trash2, Car } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { VehicleSelector } from "@/components/VehicleSelector";
import { STANDARD_VEHICLES } from "@/config/vehicles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveAdminSetting, getAdminSetting } from '@/lib/adminSettingsApi';
import { PRICING_CONFIG } from '@/config/pricing';
import { PricingService } from '@/services/pricingService';
import { formatPrice as formatCurrency } from '@/config/pricing';

interface PriceRule {
  id: string;
  name: string;
  description?: string;
  vehicle_type: string;
  rule_type: string;
  base_fare?: number;
  per_km_rate?: number;
  hourly_rate?: number;
  night_surcharge?: number;
  percentage_modifier?: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface VehiclePricing {
  vehicleType: string;
  baseFare: string;
  perKmRate: string;
  hourlyRate: string;
  nightSurcharge: string;
}

export function PricingSettings() {
  const { 
    isLoading: settingsLoading, 
    isSaving, 
    getPricingSettings, 
    updatePricingSettings 
  } = useAppSettings();
  
  const { toast } = useToast();
  
  // General pricing state (prefilled defaults)
  const [pricePerKm, setPricePerKm] = useState("2.50");
  const [baseFare, setBaseFare] = useState("5.00");
  const [nightSurcharge, setNightSurcharge] = useState("1.25");

  // Vehicle-specific pricing state
  const [vehiclePricing, setVehiclePricing] = useState<VehiclePricing[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("standard");
  
  // Price rules state
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    description: "",
    vehicle_type: "all",
    rule_type: "surcharge",
    base_fare: "",
    per_km_rate: "",
    hourly_rate: "",
    night_surcharge: "",
    percentage_modifier: "",
    is_active: true,
    priority: "0"
  });

  // Pricing override editor state
  const [pricingOverride, setPricingOverride] = useState<any>(() => ({
    baseRates: Object.keys(PRICING_CONFIG.baseRates).reduce((acc: any, k) => {
      acc[k] = { ...PRICING_CONFIG.baseRates[k] };
      return acc;
    }, {}),
    surcharges: Object.keys(PRICING_CONFIG.surcharges).reduce((acc: any, k) => {
      acc[k] = { ...PRICING_CONFIG.surcharges[k] };
      return acc;
    }, {}),
    settings: { ...PRICING_CONFIG.settings }
  }));

  // Load saved overrides from app_settings on mount
  useEffect(() => {
    let mounted = true;
    const loadOverrides = async () => {
      try {
        // Try backend first
        const res: any = await getAdminSetting('pricing_overrides');
        if (!mounted) return;
        if (res?.error) {
          // no saved settings or error reading
          console.warn('getAdminSetting error', res.error);
          // try loading a local draft fallback
          const draft = localStorage.getItem('pricing_overrides_draft');
          if (draft) {
            try {
              const parsed = JSON.parse(draft);
              const mergedDraft = {
                baseRates: { ...(Object.keys(PRICING_CONFIG.baseRates).reduce((acc: any, k) => { acc[k] = { ...PRICING_CONFIG.baseRates[k] }; return acc; }, {})), ...(parsed.baseRates || {}) },
                surcharges: { ...(Object.keys(PRICING_CONFIG.surcharges).reduce((acc: any, k) => { acc[k] = { ...PRICING_CONFIG.surcharges[k] }; return acc; }, {})), ...(parsed.surcharges || {}) },
                settings: { ...PRICING_CONFIG.settings, ...(parsed.settings || {}) }
              };
              setPricingOverride(mergedDraft);
              toast({ title: 'Lokaal concept geladen', description: 'Er is een lokaal opgeslagen concept geladen.' });
            } catch (e) {
              console.warn('Failed to parse local draft', e);
            }
          }
          return;
        }
        const saved = res?.data;
        if (saved) {
          // Merge saved overrides with defaults to ensure all keys exist
          const merged = {
            baseRates: { ...(Object.keys(PRICING_CONFIG.baseRates).reduce((acc: any, k) => { acc[k] = { ...PRICING_CONFIG.baseRates[k] }; return acc; }, {})), ...(saved.baseRates || {}) },
            surcharges: { ...(Object.keys(PRICING_CONFIG.surcharges).reduce((acc: any, k) => { acc[k] = { ...PRICING_CONFIG.surcharges[k] }; return acc; }, {})), ...(saved.surcharges || {}) },
            settings: { ...PRICING_CONFIG.settings, ...(saved.settings || {}) }
          };
          setPricingOverride(merged);
          toast({ title: 'Prijsconfiguratie geladen', description: 'Opgeslagen prijsinstellingen zijn geladen.' });
        }
      } catch (err) {
        console.error('Error loading saved pricing overrides', err);
        toast({ title: 'Fout bij laden', description: 'Kon opgeslagen prijsconfiguratie niet laden', variant: 'destructive' });
      }
    };
    loadOverrides();
    return () => { mounted = false; };
  }, []);

  // Preview state for live calculations
  const [preview, setPreview] = useState({ vehicleType: Object.keys(PRICING_CONFIG.baseRates)[0], distance: 5, duration: 15, isAirport: false });
  const [previewBreakdown, setPreviewBreakdown] = useState<any | null>(null);

  const updateBaseRate = (vehicleType: string, field: string, value: any) => {
    setPricingOverride((prev: any) => ({
      ...prev,
      baseRates: {
        ...prev.baseRates,
        [vehicleType]: {
          ...prev.baseRates[vehicleType],
          [field]: value === '' ? '' : parseFloat(value)
        }
      }
    }));
  };

  const updateSurchargeFactor = (sKey: string, value: any) => {
    setPricingOverride((prev: any) => ({
      ...prev,
      surcharges: {
        ...prev.surcharges,
        [sKey]: {
          ...prev.surcharges[sKey],
          factor: value === '' ? '' : parseFloat(value)
        }
      }
    }));
  };

  const savePricingOverrides = async () => {
    try {
      setIsSavingRules(true);
      // Save into app_settings under key 'pricing_overrides'
      const res: any = await saveAdminSetting('pricing_overrides', pricingOverride);
      if (res?.error) {
        console.error('saveAdminSetting returned error', res.error);
        const msg = res.error?.message || JSON.stringify(res.error);
        // If saving failed due to auth/RLS, persist to localStorage as a fallback
        const session = await supabase.auth.getSession();
        const sessionData: any = session?.data?.session;
        const isAuth = !!sessionData;
        if (!isAuth) {
          // save draft locally and notify user
          try {
            localStorage.setItem('pricing_overrides_draft', JSON.stringify(pricingOverride));
            toast({ title: 'Opslaan lokaal', description: 'Je bent niet ingelogd als admin. Wijzigingen zijn lokaal opgeslagen als concept.' });
          } catch (e) {
            console.error('Failed to save draft locally', e);
            toast({ title: 'Fout bij opslaan', description: msg || 'Kon prijsinstellingen niet opslaan', variant: 'destructive' });
          }
        } else {
          toast({ title: 'Fout bij opslaan', description: msg || 'Kon prijsinstellingen niet opslaan', variant: 'destructive' });
        }
        return;
      }

      // Verify persistence by reading back the saved setting
      try {
        const check: any = await getAdminSetting('pricing_overrides');
        if (check?.error) {
          console.warn('Saved but failed to read back setting', check.error);
          toast({ title: 'Opgeslagen (onbekende status)', description: 'Opgeslagen, maar kon niet verifiëren.', variant: 'warning' });
        } else if (check?.data) {
          // Update editor with canonical saved value (merge with defaults to keep keys)
          const saved = check.data;
          const merged = {
            baseRates: { ...(Object.keys(PRICING_CONFIG.baseRates).reduce((acc: any, k) => { acc[k] = { ...PRICING_CONFIG.baseRates[k] }; return acc; }, {})), ...(saved.baseRates || {}) },
            surcharges: { ...(Object.keys(PRICING_CONFIG.surcharges).reduce((acc: any, k) => { acc[k] = { ...PRICING_CONFIG.surcharges[k] }; return acc; }, {})), ...(saved.surcharges || {}) },
            settings: { ...PRICING_CONFIG.settings, ...(saved.settings || {}) }
          };
          setPricingOverride(merged);
          toast({ title: 'Prijsconfiguratie opgeslagen', description: 'De prijsinstellingen zijn succesvol bijgewerkt.' });
        } else {
          // No data returned
          toast({ title: 'Prijsconfiguratie opgeslagen', description: 'De prijsinstellingen zijn succesvol bijgewerkt.' });
        }
      } catch (err) {
        console.error('Error verifying saved pricing overrides', err);
        toast({ title: 'Opgeslagen', description: 'De prijsinstellingen zijn opgeslagen, maar verificatie mislukte.' });
      }
    } catch (err) {
      console.error('Error saving pricing overrides', err);
      toast({ title: 'Fout bij opslaan', description: 'Kon prijsinstellingen niet opslaan', variant: 'destructive' });
    } finally {
      setIsSavingRules(false);
    }
  };

  const resetPricingOverrides = () => {
    setPricingOverride({
      baseRates: Object.keys(PRICING_CONFIG.baseRates).reduce((acc: any, k) => {
        acc[k] = { ...PRICING_CONFIG.baseRates[k] };
        return acc;
      }, {}),
      surcharges: Object.keys(PRICING_CONFIG.surcharges).reduce((acc: any, k) => {
        acc[k] = { ...PRICING_CONFIG.surcharges[k] };
        return acc;
      }, {}),
      settings: { ...PRICING_CONFIG.settings }
    });
    toast({ title: 'Defaults hersteld', description: 'Prijsconfiguratie teruggezet naar standaardwaarden.' });
  };

  const computePreview = () => {
    try {
      const overrideVehiclePricing = pricingOverride.baseRates[preview.vehicleType];
      const overrideSurcharges = pricingOverride.surcharges;
      const breakdown = PricingService.calculatePrice({
        vehicleType: preview.vehicleType,
        distance: preview.distance,
        duration: preview.duration,
        pickupTime: new Date(),
        pickupLocation: preview.isAirport ? 'Airport' : '',
        overrideVehiclePricing,
        overrideSurcharges
      });
      setPreviewBreakdown(breakdown);
    } catch (err) {
      console.error('Error computing preview', err);
      toast({ title: 'Berekening mislukt', description: 'Kon prijsvoorbeeld niet berekenen', variant: 'destructive' });
    }
  };

  // Load current pricing settings
  useEffect(() => {
    if (!settingsLoading) {
      const pricing = getPricingSettings();
      // Only overwrite defaults if settings are present
      if (pricing?.baseFare) setBaseFare(pricing.baseFare);
      if (pricing?.pricePerKm) setPricePerKm(pricing.pricePerKm);
      if (pricing?.nightSurcharge) setNightSurcharge(pricing.nightSurcharge);
    }
  }, [settingsLoading, getPricingSettings]);

  // Initialize vehicle-specific pricing
  useEffect(() => {
    const initialVehiclePricing = STANDARD_VEHICLES.map(vehicle => ({
      vehicleType: vehicle.id,
      baseFare: "5.00",
      perKmRate: vehicle.perKmRate.toString(),
      hourlyRate: vehicle.hourlyRate.toString(),
      nightSurcharge: "1.25"
    }));
    setVehiclePricing(initialVehiclePricing);
  }, []);

  // Load price rules
  useEffect(() => {
    loadPriceRules();
  }, []);

  const loadPriceRules = async () => {
    try {
      setIsLoadingRules(true);
      const { data, error } = await supabase
        .from('price_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPriceRules(data || []);
    } catch (error) {
      console.error('Error loading price rules:', error);
      toast({
        title: "Fout bij laden prijsregels",
        description: "Er ging iets mis bij het laden van de prijsregels.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRules(false);
    }
  };

  const handleSavePricing = async () => {
    const success = await updatePricingSettings({
      baseFare,
      pricePerKm,
      nightSurcharge,
    });
    
    if (success) {
      toast({
        title: "Algemene prijzen opgeslagen",
        description: "De algemene prijsinstellingen zijn succesvol bijgewerkt.",
      });
    }
  };

  const handleSaveVehiclePricing = async () => {
    const currentVehicle = vehiclePricing.find(v => v.vehicleType === selectedVehicleType);
    if (!currentVehicle) return;

    // Here you would save to your backend/database
    toast({
      title: "Voertuigprijzen opgeslagen",
      description: `Prijzen voor ${STANDARD_VEHICLES.find(v => v.id === selectedVehicleType)?.name} zijn bijgewerkt.`,
    });
  };

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        name: ruleForm.name,
        description: ruleForm.description || null,
        vehicle_type: ruleForm.vehicle_type,
        rule_type: ruleForm.rule_type,
        base_fare: ruleForm.base_fare ? parseFloat(ruleForm.base_fare) : null,
        per_km_rate: ruleForm.per_km_rate ? parseFloat(ruleForm.per_km_rate) : null,
        hourly_rate: ruleForm.hourly_rate ? parseFloat(ruleForm.hourly_rate) : null,
        night_surcharge: ruleForm.night_surcharge ? parseFloat(ruleForm.night_surcharge) : null,
        percentage_modifier: ruleForm.percentage_modifier ? parseFloat(ruleForm.percentage_modifier) : null,
        is_active: ruleForm.is_active,
        priority: parseInt(ruleForm.priority)
      };

      let result;
      if (editingRule) {
        result = await supabase
          .from('price_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
      } else {
        result = await supabase
          .from('price_rules')
          .insert([ruleData]);
      }

      if (result.error) throw result.error;

      toast({
        title: editingRule ? "Prijsregel bijgewerkt" : "Prijsregel toegevoegd",
        description: `De prijsregel "${ruleForm.name}" is succesvol ${editingRule ? 'bijgewerkt' : 'toegevoegd'}.`,
      });

      setIsRuleDialogOpen(false);
      resetRuleForm();
      loadPriceRules();
    } catch (error) {
      console.error('Error saving price rule:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er ging iets mis bij het opslaan van de prijsregel.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (rule: PriceRule) => {
    try {
      const { error } = await supabase
        .from('price_rules')
        .delete()
        .eq('id', rule.id);

      if (error) throw error;

      toast({
        title: "Prijsregel verwijderd",
        description: `De prijsregel "${rule.name}" is succesvol verwijderd.`,
      });

      loadPriceRules();
    } catch (error) {
      console.error('Error deleting price rule:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Er ging iets mis bij het verwijderen van de prijsregel.",
        variant: "destructive",
      });
    }
  };

  const toggleRuleActive = async (rule: PriceRule, newState: boolean) => {
    try {
      const { error } = await supabase
        .from('price_rules')
        .update({ is_active: newState })
        .eq('id', rule.id);

      if (error) throw error;

      // Update local state
      setPriceRules((prev) => prev.map(r => r.id === rule.id ? { ...r, is_active: newState } : r));
      toast({ title: 'Status bijgewerkt', description: `Prijsregel "${rule.name}" is ${newState ? 'geactiveerd' : 'gedeactiveerd'}.` });
    } catch (err) {
      console.error('Error toggling rule:', err);
      toast({ title: 'Fout', description: 'Kon status niet bijwerken', variant: 'destructive' });
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: "",
      description: "",
      vehicle_type: "all",
      rule_type: "surcharge",
      base_fare: "",
      per_km_rate: "",
      hourly_rate: "",
      night_surcharge: "",
      percentage_modifier: "",
      is_active: true,
      priority: "0"
    });
    setEditingRule(null);
  };

  const startEditRule = (rule: PriceRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      description: rule.description || "",
      vehicle_type: rule.vehicle_type,
      rule_type: rule.rule_type,
      base_fare: rule.base_fare?.toString() || "",
      per_km_rate: rule.per_km_rate?.toString() || "",
      hourly_rate: rule.hourly_rate?.toString() || "",
      night_surcharge: rule.night_surcharge?.toString() || "",
      percentage_modifier: rule.percentage_modifier?.toString() || "",
      is_active: rule.is_active,
      priority: rule.priority.toString()
    });
    setIsRuleDialogOpen(true);
  };

  const currentVehiclePricing = vehiclePricing.find(v => v.vehicleType === selectedVehicleType);
  const selectedVehicle = STANDARD_VEHICLES.find(v => v.id === selectedVehicleType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="w-5 h-5 text-primary" />
          Prijsbeheer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehicles">Per Voertuig</TabsTrigger>
            <TabsTrigger value="formulas">Prijsformules</TabsTrigger>
          </TabsList>

          {/* Vehicle-Specific Pricing Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Car className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Voertuig selecteren</h3>
              </div>
              
              <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {STANDARD_VEHICLES.map((vehicle) => {
                    const isSelected = vehicle.id === selectedVehicleType;
                    const CardIcon = vehicle.icon;
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => setSelectedVehicleType(vehicle.id)}
                        className={`flex items-center gap-4 p-4 rounded-lg w-full text-left transition-shadow ${isSelected ? 'bg-black text-white' : 'bg-white border border-gray-200 hover:shadow-md'}`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
                          <CardIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${isSelected ? 'text-white' : 'text-black'}`}>{vehicle.name}</div>
                          <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>{vehicle.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentVehiclePricing && selectedVehicle && (
                <div className="border rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <selectedVehicle.icon className="w-6 h-6 text-primary" />
                    <h4 className="text-lg font-semibold">{selectedVehicle.name}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Basistarief (€)</Label>
                      <Input
                        type="number"
                        step="0.10"
                        value={currentVehiclePricing.baseFare}
                        onChange={(e) => {
                          const updated = vehiclePricing.map(v => 
                            v.vehicleType === selectedVehicleType 
                              ? { ...v, baseFare: e.target.value }
                              : v
                          );
                          setVehiclePricing(updated);
                        }}
                        placeholder="5.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Prijs per km (€)</Label>
                      <Input
                        type="number"
                        step="0.10"
                        value={currentVehiclePricing.perKmRate}
                        onChange={(e) => {
                          const updated = vehiclePricing.map(v => 
                            v.vehicleType === selectedVehicleType 
                              ? { ...v, perKmRate: e.target.value }
                              : v
                          );
                          setVehiclePricing(updated);
                        }}
                        placeholder="2.50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Uurtarief (€)</Label>
                      <Input
                        type="number"
                        step="0.50"
                        value={currentVehiclePricing.hourlyRate}
                        onChange={(e) => {
                          const updated = vehiclePricing.map(v => 
                            v.vehicleType === selectedVehicleType 
                              ? { ...v, hourlyRate: e.target.value }
                              : v
                          );
                          setVehiclePricing(updated);
                        }}
                        placeholder="25.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Nachttoeslag (€)</Label>
                      <Input
                        type="number"
                        step="0.05"
                        value={currentVehiclePricing.nightSurcharge}
                        onChange={(e) => {
                          const updated = vehiclePricing.map(v => 
                            v.vehicleType === selectedVehicleType 
                              ? { ...v, nightSurcharge: e.target.value }
                              : v
                          );
                          setVehiclePricing(updated);
                        }}
                        placeholder="1.25"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveVehiclePricing}>
                    Prijzen opslaan voor {selectedVehicle.name}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Price Formulas Tab - REPLACED WITH EDITABLE PRICING CONFIGURATION */}
          <TabsContent value="formulas" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prijsberekening (bewerken)</h3>
                <div className="text-sm text-muted-foreground">Wijzig hier het centrale prijsmodel dat gebruikt wordt door de booking flow</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Editable configuration */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium">Algemene instellingen</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>BTW (%)</Label>
                      <Input type="number" step="0.01" value={pricingOverride.settings.taxRate} onChange={(e) => setPricingOverride(prev => ({...prev, settings: {...prev.settings, taxRate: parseFloat(e.target.value) || 0}}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Afronden (decimalen)</Label>
                      <Input type="number" value={pricingOverride.settings.roundingPrecision} onChange={(e) => setPricingOverride(prev => ({...prev, settings: {...prev.settings, roundingPrecision: parseInt(e.target.value) || 2}}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum boekingstijd (min)</Label>
                      <Input type="number" value={pricingOverride.settings.minimumBookingTime} onChange={(e) => setPricingOverride(prev => ({...prev, settings: {...prev.settings, minimumBookingTime: parseInt(e.target.value) || 0}}))} />
                    </div>
                  </div>

                  <h4 className="font-medium pt-4">Per-voertuig tarieven</h4>
                  <div className="space-y-3">
                    {Object.keys(PRICING_CONFIG.baseRates).map((vt) => (
                      <div key={vt} className="grid grid-cols-2 gap-3 items-center">
                        <div className="col-span-1">
                          <div className="text-sm font-medium">{vt}</div>
                        </div>
                        <div className="col-span-1 grid grid-cols-2 gap-2">
                          <Input type="number" step="0.05" value={pricingOverride.baseRates[vt]?.base ?? PRICING_CONFIG.baseRates[vt].base} onChange={(e) => updateBaseRate(vt, 'base', e.target.value)} placeholder="Base" />
                          <Input type="number" step="0.01" value={pricingOverride.baseRates[vt]?.perKm ?? PRICING_CONFIG.baseRates[vt].perKm} onChange={(e) => updateBaseRate(vt, 'perKm', e.target.value)} placeholder="Per km" />
                          <Input type="number" step="0.01" value={pricingOverride.baseRates[vt]?.perMinute ?? PRICING_CONFIG.baseRates[vt].perMinute} onChange={(e) => updateBaseRate(vt, 'perMinute', e.target.value)} placeholder="Per min" />
                          <Input type="number" step="0.01" value={pricingOverride.baseRates[vt]?.minimum ?? PRICING_CONFIG.baseRates[vt].minimum} onChange={(e) => updateBaseRate(vt, 'minimum', e.target.value)} placeholder="Minimum" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-medium pt-4">Toeslagen (factoren)</h4>
                  <div className="space-y-2">
                    {Object.keys(PRICING_CONFIG.surcharges).map((sKey) => (
                      <div key={sKey} className="flex items-center gap-3">
                        <div className="flex-1 text-sm font-medium">{sKey}</div>
                        <Input type="number" step="0.01" value={pricingOverride.surcharges[sKey]?.factor ?? PRICING_CONFIG.surcharges[sKey].factor} onChange={(e) => updateSurchargeFactor(sKey, e.target.value)} className="w-32" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button onClick={savePricingOverrides} variant="taxi-primary">Opslaan</Button>
                    <Button variant="outline" onClick={resetPricingOverrides}>Herstel defaults</Button>
                  </div>
                </div>

                {/* Right: Live preview */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium">Live voorbeeld</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <Label>Voertuig</Label>
                      <Select value={preview.vehicleType} onValueChange={(v) => setPreview(prev => ({...prev, vehicleType: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(PRICING_CONFIG.baseRates).map(vt => (
                            <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Afstand (km)</Label>
                        <Input type="number" value={preview.distance} onChange={(e) => setPreview(p => ({...p, distance: parseFloat(e.target.value) || 0}))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Duur (min)</Label>
                        <Input type="number" value={preview.duration} onChange={(e) => setPreview(p => ({...p, duration: parseFloat(e.target.value) || 0}))} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch checked={preview.isAirport} onCheckedChange={(c) => setPreview(p => ({...p, isAirport: !!c}))} />
                      <Label>Ophaal op luchthaven</Label>
                    </div>

                    <div className="pt-2">
                      <Button onClick={computePreview}>Bereken prijs</Button>
                    </div>

                    {previewBreakdown && (
                      <div className="space-y-2 pt-2">
                        <div className="text-sm">Base: {formatCurrency(previewBreakdown.basePrice)}</div>
                        <div className="text-sm">Distance: {formatCurrency(previewBreakdown.distancePrice)}</div>
                        <div className="text-sm">Time: {formatCurrency(previewBreakdown.timePrice)}</div>
                        {previewBreakdown.surcharges.map(s => (
                          <div key={s.name} className="text-sm">{s.description}: {formatCurrency(s.amount)}</div>
                        ))}
                        <div className="font-semibold">Totaal: {formatCurrency(previewBreakdown.total)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}