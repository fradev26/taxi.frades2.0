import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriceDisplay } from '@/components/PriceDisplay';
import { PricingService } from '@/services/pricingService';
import { DistanceService } from '@/services/distanceService';
import { PRICING_CONFIG, getVehiclePricing } from '@/config/pricing';
import type { PriceBreakdown } from '@/services/pricingService';

export default function PricingTest() {
  const [pickup, setPickup] = useState('Brussels Central Station');
  const [destination, setDestination] = useState('Brussels Airport');
  const [vehicleType, setVehicleType] = useState('standard');
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = async () => {
    if (!pickup || !destination) return;

    setLoading(true);
    setError(null);

    try {
      // For demo, use estimated distance
      const estimatedDistance = 15; // km
      const estimatedDuration = 25; // minutes
      
      const breakdown = PricingService.calculatePrice({
        vehicleType,
        distance: estimatedDistance,
        duration: estimatedDuration,
        pickupTime: new Date(),
        pickupLocation: pickup,
        destinationLocation: destination,
        hasStopover: false
      });

      setPriceBreakdown(breakdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [pickup, destination, vehicleType]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Pricing System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup location"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PRICING_CONFIG.baseRates).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} - 
                      €{PRICING_CONFIG.baseRates[type].perKm}/km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculatePrice} className="w-full">
              Recalculate Price
            </Button>
          </CardContent>
        </Card>

        <PriceDisplay
          priceBreakdown={priceBreakdown}
          loading={loading}
          error={error}
          showBreakdown={true}
        />

        {/* Configuration Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Pricing Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Base Rates:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(PRICING_CONFIG.baseRates).map(([type, rates]) => (
                    <div key={type} className="p-3 border rounded">
                      <h5 className="font-medium capitalize">{type}</h5>
                      <p className="text-sm text-muted-foreground">
                        Base: €{rates.base}<br/>
                        Per km: €{rates.perKm}<br/>
                        Per min: €{rates.perMinute}<br/>
                        Minimum: €{rates.minimum}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Surcharges:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(PRICING_CONFIG.surcharges).map(([key, surcharge]) => (
                    <div key={key} className="p-3 border rounded">
                      <h5 className="font-medium">{key}</h5>
                      <p className="text-sm text-muted-foreground">
                        Factor: {surcharge.factor}x ({Math.round((surcharge.factor - 1) * 100)}%)<br/>
                        {surcharge.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}