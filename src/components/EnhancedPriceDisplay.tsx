import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriceBreakdown } from "@/services/pricingService";

interface EnhancedPriceDisplayProps {
  priceBreakdown: PriceBreakdown | null;
  loading?: boolean;
  error?: string | null;
  estimatedDistance?: number; // in meters
  estimatedDuration?: number; // in seconds
  estimatedDurationInTraffic?: number; // in seconds with traffic
  scheduledTime?: string;
  className?: string;
  showTrafficImpact?: boolean;
  showTimeBasedPricing?: boolean;
}

export function EnhancedPriceDisplay({
  priceBreakdown,
  loading = false,
  error = null,
  estimatedDistance,
  estimatedDuration,
  estimatedDurationInTraffic,
  scheduledTime,
  className,
  showTrafficImpact = true,
  showTimeBasedPricing = true
}: EnhancedPriceDisplayProps) {
  
  // Calculate traffic delay
  const trafficDelay = estimatedDurationInTraffic && estimatedDuration 
    ? Math.max(0, estimatedDurationInTraffic - estimatedDuration) 
    : 0;
  
  // Format time
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')} uur`;
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Check if it's rush hour
  const isRushHour = () => {
    if (!scheduledTime) return false;
    const time = new Date(`2024-01-01T${scheduledTime}`);
    const hour = time.getHours();
    const day = new Date().getDay();
    
    // Weekdays only
    if (day === 0 || day === 6) return false;
    
    // Rush hours: 7-9 AM or 5-7 PM
    return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  };

  // Check if it's night time
  const isNightTime = () => {
    if (!scheduledTime) return false;
    const time = new Date(`2024-01-01T${scheduledTime}`);
    const hour = time.getHours();
    return hour >= 22 || hour <= 6;
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Prijsberekening mislukt</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!priceBreakdown) {
    return (
      <Card className={cn("border-muted bg-muted/20", className)}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Voer ophaal- en bestemmingsadres in voor prijsberekening</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Route Information */}
        {(estimatedDistance || estimatedDuration) && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {estimatedDistance && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDistance(estimatedDistance)}</span>
                </div>
              )}
              {estimatedDurationInTraffic && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDuration(estimatedDurationInTraffic)}</span>
                  {trafficDelay > 60 && showTrafficImpact && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      +{formatDuration(trafficDelay)} verkeer
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Time-based indicators */}
            {showTimeBasedPricing && (
              <div className="flex gap-1">
                {isRushHour() && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Spitsuur
                  </Badge>
                )}
                {isNightTime() && (
                  <Badge variant="outline" className="text-xs">
                    🌙 Nacht
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Basisprijs</span>
            <span>€{priceBreakdown.basePrice.toFixed(2)}</span>
          </div>
          
          {priceBreakdown.distancePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span>Afstandsprijs</span>
              <span>€{priceBreakdown.distancePrice.toFixed(2)}</span>
            </div>
          )}
          
          {priceBreakdown.timePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tijdsprijs</span>
              <span>€{priceBreakdown.timePrice.toFixed(2)}</span>
            </div>
          )}

          {/* Surcharges */}
          {priceBreakdown.surcharges.map((surcharge, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                {surcharge.name === 'rushHour' && <TrendingUp className="w-3 h-3" />}
                {surcharge.name === 'nightTime' && <span>🌙</span>}
                {surcharge.name === 'airportPickup' && <span>✈️</span>}
                <span className="text-orange-600">{surcharge.description}</span>
              </span>
              <span className="text-orange-600">+€{surcharge.amount.toFixed(2)}</span>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex justify-between text-sm border-t pt-2">
            <span>Subtotaal</span>
            <span>€{priceBreakdown.subtotal.toFixed(2)}</span>
          </div>
          
          {/* Tax */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>BTW (21%)</span>
            <span>€{priceBreakdown.tax.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Totaal</span>
            {priceBreakdown.estimatedOnly && (
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Schatting
              </Badge>
            )}
          </div>
          <span className="text-lg font-bold text-primary">
            €{priceBreakdown.total.toFixed(2)}
          </span>
        </div>

        {/* Minimum fare notice */}
        {priceBreakdown.subtotal === priceBreakdown.minimum && (
          <p className="text-xs text-muted-foreground">
            * Minimumtarief van €{priceBreakdown.minimum.toFixed(2)} is van toepassing
          </p>
        )}

        {/* Traffic impact notice */}
        {trafficDelay > 300 && showTrafficImpact && ( // 5+ minutes delay
          <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Verkeersimpact</p>
              <p className="text-amber-700">
                Verwachte vertraging van {formatDuration(trafficDelay)} door verkeersdrukte.
                Overweeg een andere vertrektijd.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}