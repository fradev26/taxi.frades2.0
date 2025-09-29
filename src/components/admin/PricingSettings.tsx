import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Euro } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

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

  // Load current pricing settings
  useEffect(() => {
    if (!settingsLoading) {
      const pricing = getPricingSettings();
      setBaseFare(pricing.baseFare);
      setPricePerKm(pricing.pricePerKm);
      setNightSurcharge(pricing.nightSurcharge);
    }
  }, [settingsLoading, getPricingSettings]);

  const handleSavePricing = async () => {
    const success = await updatePricingSettings({
      baseFare,
      pricePerKm,
      nightSurcharge,
    });
    
    // Settings are automatically refreshed and toast is shown in the hook
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="w-5 h-5 text-primary" />
          Prijsinstellingen
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
  );
}