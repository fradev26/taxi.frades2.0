import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Euro, Plus, Trash2, Edit } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VehicleSelector } from "@/components/VehicleSelector";

interface PriceRule {
  id: string;
  vehicle_type: string;
  rule_name: string;
  base_fare: number;
  per_km_rate: number;
  per_hour_rate: number;
  night_surcharge: number;
  min_fare: number;
  created_at: string;
}

export function PricingSettings() {
  const { 
    isLoading: settingsLoading, 
    isSaving, 
    getPricingSettings, 
    updatePricingSettings 
  } = useAppSettings();
  
  const [pricePerKm, setPricePerKm] = useState("");
  const [baseFare, setBaseFare] = useState("");
  const [nightSurcharge, setNightSurcharge] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("standard");
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);
  const [ruleFormData, setRuleFormData] = useState({
    vehicle_type: "standard",
    rule_name: "",
    base_fare: "",
    per_km_rate: "",
    per_hour_rate: "",
    night_surcharge: "",
    min_fare: "",
  });
  const { toast } = useToast();

  // Load current pricing settings
  useEffect(() => {
    if (!settingsLoading) {
      const pricing = getPricingSettings();
      setBaseFare(pricing.baseFare);
      setPricePerKm(pricing.pricePerKm);
      setNightSurcharge(pricing.nightSurcharge);
    }
  }, [settingsLoading, getPricingSettings]);

  // Load price rules from database
  const loadPriceRules = async () => {
    try {
      setIsLoadingRules(true);
      const { data, error } = await supabase
        .from('price_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPriceRules(data || []);
    } catch (error) {
      console.error('Error loading price rules:', error);
      toast({
        title: "Fout bij laden prijsregels",
        description: "Kon prijsregels niet laden.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRules(false);
    }
  };

  useEffect(() => {
    loadPriceRules();
  }, []);

  const handleSavePricing = async () => {
    const success = await updatePricingSettings({
      baseFare,
      pricePerKm,
      nightSurcharge,
    });
    
    if (success) {
      toast({
        title: "Prijzen opgeslagen",
        description: "De algemene prijsinstellingen zijn bijgewerkt.",
      });
    }
  };

  // Handle vehicle-specific pricing
  const handleSaveVehiclePricing = async () => {
    try {
      // Save vehicle-specific pricing logic here
      toast({
        title: "Voertuigprijzen opgeslagen",
        description: `Prijzen voor ${selectedVehicleType} zijn bijgewerkt.`,
      });
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Kon voertuigprijzen niet opslaan.",
        variant: "destructive",
      });
    }
  };

  // Save or update price rule
  const handleSaveRule = async () => {
    try {
      const ruleData = {
        vehicle_type: ruleFormData.vehicle_type,
        rule_name: ruleFormData.rule_name,
        base_fare: parseFloat(ruleFormData.base_fare),
        per_km_rate: parseFloat(ruleFormData.per_km_rate),
        per_hour_rate: parseFloat(ruleFormData.per_hour_rate),
        night_surcharge: parseFloat(ruleFormData.night_surcharge),
        min_fare: parseFloat(ruleFormData.min_fare),
      };

      if (editingRule) {
        const { error } = await supabase
          .from('price_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
        toast({
          title: "Prijsregel bijgewerkt",
          description: "De prijsregel is succesvol bijgewerkt.",
        });
      } else {
        const { error } = await supabase
          .from('price_rules')
          .insert([ruleData]);

        if (error) throw error;
        toast({
          title: "Prijsregel toegevoegd",
          description: "De nieuwe prijsregel is toegevoegd.",
        });
      }

      setIsDialogOpen(false);
      resetRuleForm();
      loadPriceRules();
    } catch (error) {
      console.error('Error saving price rule:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon prijsregel niet opslaan.",
        variant: "destructive",
      });
    }
  };

  // Delete price rule
  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('price_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Prijsregel verwijderd",
        description: "De prijsregel is succesvol verwijderd.",
      });

      loadPriceRules();
    } catch (error) {
      console.error('Error deleting price rule:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon prijsregel niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const resetRuleForm = () => {
    setRuleFormData({
      vehicle_type: "standard",
      rule_name: "",
      base_fare: "",
      per_km_rate: "",
      per_hour_rate: "",
      night_surcharge: "",
      min_fare: "",
    });
    setEditingRule(null);
  };

  const openEditDialog = (rule: PriceRule) => {
    setEditingRule(rule);
    setRuleFormData({
      vehicle_type: rule.vehicle_type,
      rule_name: rule.rule_name,
      base_fare: rule.base_fare.toString(),
      per_km_rate: rule.per_km_rate.toString(),
      per_hour_rate: rule.per_hour_rate.toString(),
      night_surcharge: rule.night_surcharge.toString(),
      min_fare: rule.min_fare.toString(),
    });
    setIsDialogOpen(true);
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      standard: "Standard",
      luxury: "Luxe",
      van: "Van",
    };
    return labels[type] || type;
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">Algemeen</TabsTrigger>
        <TabsTrigger value="vehicle">Per Voertuig</TabsTrigger>
        <TabsTrigger value="formulas">Prijsformules</TabsTrigger>
      </TabsList>

      {/* General Pricing */}
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              Algemene Prijsinstellingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              {isSaving ? "Opslaan..." : "Prijzen opslaan"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Vehicle-Specific Pricing */}
      <TabsContent value="vehicle">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              Prijzen per Voertuigtype
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Stel specifieke prijzen in voor elk voertuigtype
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Selecteer Voertuigtype</Label>
              <VehicleSelector
                selectedVehicle={selectedVehicleType}
                onVehicleSelect={setSelectedVehicleType}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Basistarief (€)</Label>
                <Input
                  type="number"
                  step="0.10"
                  placeholder="5.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Prijs per km (€)</Label>
                <Input
                  type="number"
                  step="0.10"
                  placeholder="2.50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Uurtarief (€)</Label>
                <Input
                  type="number"
                  step="0.10"
                  placeholder="45.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nachttoeslag (€)</Label>
                <Input
                  type="number"
                  step="0.05"
                  placeholder="1.25"
                />
              </div>
            </div>
            
            <Button onClick={handleSaveVehiclePricing}>
              Voertuigprijzen opslaan
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Price Formulas */}
      <TabsContent value="formulas">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-primary" />
                  Prijsformule Beheer
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Beheer prijsregels en formules voor verschillende scenario's
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetRuleForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Regel Toevoegen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRule ? "Prijsregel Bewerken" : "Nieuwe Prijsregel"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Regelnaam</Label>
                      <Input
                        value={ruleFormData.rule_name}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, rule_name: e.target.value })}
                        placeholder="Bijv. Weekend tarief"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Voertuigtype</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={ruleFormData.vehicle_type}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, vehicle_type: e.target.value })}
                      >
                        <option value="standard">Standard</option>
                        <option value="luxury">Luxe</option>
                        <option value="van">Van</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Basistarief (€)</Label>
                        <Input
                          type="number"
                          step="0.10"
                          value={ruleFormData.base_fare}
                          onChange={(e) => setRuleFormData({ ...ruleFormData, base_fare: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Per km (€)</Label>
                        <Input
                          type="number"
                          step="0.10"
                          value={ruleFormData.per_km_rate}
                          onChange={(e) => setRuleFormData({ ...ruleFormData, per_km_rate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Per uur (€)</Label>
                        <Input
                          type="number"
                          step="0.10"
                          value={ruleFormData.per_hour_rate}
                          onChange={(e) => setRuleFormData({ ...ruleFormData, per_hour_rate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Nachttoeslag (€)</Label>
                        <Input
                          type="number"
                          step="0.05"
                          value={ruleFormData.night_surcharge}
                          onChange={(e) => setRuleFormData({ ...ruleFormData, night_surcharge: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Minimumtarief (€)</Label>
                        <Input
                          type="number"
                          step="0.10"
                          value={ruleFormData.min_fare}
                          onChange={(e) => setRuleFormData({ ...ruleFormData, min_fare: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveRule} className="flex-1">
                        {editingRule ? "Bijwerken" : "Toevoegen"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuleren
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRules ? (
              <div className="text-center py-8">Laden...</div>
            ) : priceRules.length === 0 ? (
              <div className="text-center py-12">
                <Euro className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nog geen prijsregels ingesteld. Klik op "Regel Toevoegen" om te beginnen.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead>Per km</TableHead>
                    <TableHead>Per uur</TableHead>
                    <TableHead>Nacht</TableHead>
                    <TableHead>Min.</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.rule_name}</TableCell>
                      <TableCell>{getVehicleTypeLabel(rule.vehicle_type)}</TableCell>
                      <TableCell>€{rule.base_fare.toFixed(2)}</TableCell>
                      <TableCell>€{rule.per_km_rate.toFixed(2)}</TableCell>
                      <TableCell>€{rule.per_hour_rate.toFixed(2)}</TableCell>
                      <TableCell>€{rule.night_surcharge.toFixed(2)}</TableCell>
                      <TableCell>€{rule.min_fare.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(rule)}
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
                                <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Deze prijsregel wordt permanent verwijderd.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteRule(rule.id)}>
                                  Verwijderen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}