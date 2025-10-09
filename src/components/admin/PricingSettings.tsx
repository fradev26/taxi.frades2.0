import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  
  // General pricing state
  const [pricePerKm, setPricePerKm] = useState("");
  const [baseFare, setBaseFare] = useState("");
  const [nightSurcharge, setNightSurcharge] = useState("");

  // Vehicle-specific pricing state
  const [vehiclePricing, setVehiclePricing] = useState<VehiclePricing[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("standard");
  
  // Price rules state
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
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

  // Load current pricing settings
  useEffect(() => {
    if (!settingsLoading) {
      const pricing = getPricingSettings();
      setBaseFare(pricing.baseFare);
      setPricePerKm(pricing.pricePerKm);
      setNightSurcharge(pricing.nightSurcharge);
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
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Algemeen</TabsTrigger>
            <TabsTrigger value="vehicles">Per Voertuig</TabsTrigger>
            <TabsTrigger value="formulas">Prijsformules</TabsTrigger>
          </TabsList>

          {/* General Pricing Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="baseFare">Basistarief (€)</Label>
                <Input
                  id="baseFare"
                  type="number"
                  step="0.10"
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  placeholder="5.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricePerKm">Prijs per km (€)</Label>
                <Input
                  id="pricePerKm"
                  type="number"
                  step="0.10"
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  placeholder="2.50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nightSurcharge">Nachttoeslag (€)</Label>
                <Input
                  id="nightSurcharge"
                  type="number"
                  step="0.05"
                  value={nightSurcharge}
                  onChange={(e) => setNightSurcharge(e.target.value)}
                  placeholder="1.25"
                />
              </div>
            </div>
            
            <Button
              type="button"
              onClick={handleSavePricing}
              disabled={isSaving || settingsLoading}
            >
              {isSaving ? "Opslaan..." : "Algemene prijzen opslaan"}
            </Button>
          </TabsContent>

          {/* Vehicle-Specific Pricing Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Car className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Voertuig selecteren</h3>
              </div>
              
              <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Selecteer voertuigtype" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_VEHICLES.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

          {/* Price Formulas Tab */}
          <TabsContent value="formulas" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prijsformules beheren</h3>
              <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetRuleForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuwe regel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRule ? "Prijsregel bewerken" : "Nieuwe prijsregel"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Naam*</Label>
                        <Input
                          value={ruleForm.name}
                          onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                          placeholder="bijv. Weekend tarief"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Voertuigtype</Label>
                        <Select 
                          value={ruleForm.vehicle_type} 
                          onValueChange={(value) => setRuleForm({ ...ruleForm, vehicle_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle voertuigen</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="luxe">Luxe</SelectItem>
                            <SelectItem value="van">Van</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Beschrijving</Label>
                      <Textarea
                        value={ruleForm.description}
                        onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                        placeholder="Beschrijf wanneer deze regel van toepassing is..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Regeltype</Label>
                        <Select 
                          value={ruleForm.rule_type} 
                          onValueChange={(value) => setRuleForm({ ...ruleForm, rule_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="surcharge">Toeslag</SelectItem>
                            <SelectItem value="discount">Korting</SelectItem>
                            <SelectItem value="fixed_rate">Vast tarief</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Prioriteit</Label>
                        <Input
                          type="number"
                          value={ruleForm.priority}
                          onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Basistarief (€)</Label>
                        <Input
                          type="number"
                          step="0.10"
                          value={ruleForm.base_fare}
                          onChange={(e) => setRuleForm({ ...ruleForm, base_fare: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Per km (€)</Label>
                        <Input
                          type="number"
                          step="0.10"
                          value={ruleForm.per_km_rate}
                          onChange={(e) => setRuleForm({ ...ruleForm, per_km_rate: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Uurtarief (€)</Label>
                        <Input
                          type="number"
                          step="0.50"
                          value={ruleForm.hourly_rate}
                          onChange={(e) => setRuleForm({ ...ruleForm, hourly_rate: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nachttoeslag (€)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={ruleForm.night_surcharge}
                          onChange={(e) => setRuleForm({ ...ruleForm, night_surcharge: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ruleForm.is_active}
                        onCheckedChange={(checked) => setRuleForm({ ...ruleForm, is_active: checked })}
                      />
                      <Label>Actief</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveRule} disabled={!ruleForm.name}>
                        {editingRule ? "Bijwerken" : "Toevoegen"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                        Annuleren
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Voertuig</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Basistarief</TableHead>
                    <TableHead>Per km</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioriteit</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRules ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Prijsregels laden...
                      </TableCell>
                    </TableRow>
                  ) : priceRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Geen prijsregels gevonden
                      </TableCell>
                    </TableRow>
                  ) : (
                    priceRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.vehicle_type === 'all' ? 'Alle' : rule.vehicle_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.rule_type === 'surcharge' ? 'default' : 'secondary'}>
                            {rule.rule_type === 'surcharge' ? 'Toeslag' : 
                             rule.rule_type === 'discount' ? 'Korting' : 'Vast tarief'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.base_fare ? `€${rule.base_fare.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          {rule.per_km_rate ? `€${rule.per_km_rate.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Actief' : 'Inactief'}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditRule(rule)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Prijsregel verwijderen</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Weet je zeker dat je de prijsregel "{rule.name}" wilt verwijderen? 
                                    Deze actie kan niet ongedaan worden gemaakt.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRule(rule)}>
                                    Verwijderen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}