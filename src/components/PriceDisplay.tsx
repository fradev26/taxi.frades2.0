import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Euro, Calculator, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/config/pricing';
import type { PriceBreakdown } from '@/services/pricingService';

interface PriceDisplayProps {
  priceBreakdown: PriceBreakdown | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  showBreakdown?: boolean;
  className?: string;
}

export function PriceDisplay({
  priceBreakdown,
  loading = false,
  error = null,
  compact = false,
  showBreakdown = true,
  className = ""
}: PriceDisplayProps) {
  
  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Prijs berekenen...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Prijsberekening mislukt:</strong> {error}
          <br />
          <span className="text-xs">Probeer een andere route of neem contact op.</span>
        </AlertDescription>
      </Alert>
    );
  }

  if (!priceBreakdown) {
    return (
      <Card className={`bg-muted/20 border-dashed ${className}`}>
        <CardContent className="p-4 text-center">
          <div className="space-y-2">
            <Calculator className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Vul ophaal- en bestemming in voor prijsberekening
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact display for mobile or small spaces
  if (compact) {
    return (
      <Card className={`bg-primary/5 border-primary/20 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Totaal:</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatPrice(priceBreakdown.total)}
              </div>
              {priceBreakdown.estimatedOnly && (
                <Badge variant="secondary" className="text-xs">
                  Schatting
                </Badge>
              )}
            </div>
          </div>
          
          {priceBreakdown.estimatedOnly && (
            <p className="text-xs text-muted-foreground mt-2">
              Definitieve prijs kan afwijken
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full breakdown display
  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Prijsberekening</h3>
            {priceBreakdown.estimatedOnly && (
              <Badge variant="outline" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Schatting
              </Badge>
            )}
          </div>

          {/* Price Breakdown */}
          {showBreakdown && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Startprijs:</span>
                <span>{formatPrice(priceBreakdown.basePrice)}</span>
              </div>
              
              {priceBreakdown.distancePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Afstand:</span>
                  <span>{formatPrice(priceBreakdown.distancePrice)}</span>
                </div>
              )}
              
              {priceBreakdown.timePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tijd/verkeer:</span>
                  <span>{formatPrice(priceBreakdown.timePrice)}</span>
                </div>
              )}
              
              {/* Surcharges */}
              {priceBreakdown.surcharges.map((surcharge, index) => (
                <div key={index} className="flex justify-between text-orange-700">
                  <span className="text-xs">{surcharge.description}:</span>
                  <span className="text-xs">+{formatPrice(surcharge.amount)}</span>
                </div>
              ))}
              
              {priceBreakdown.surcharges.length > 0 && <Separator />}
              
              {/* Tax */}
              {priceBreakdown.tax > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>BTW ({Math.round(priceBreakdown.tax / priceBreakdown.subtotal * 100)}%):</span>
                  <span>{formatPrice(priceBreakdown.tax)}</span>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Total Price */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Totaal:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(priceBreakdown.total)}
              </div>
              <div className="text-xs text-muted-foreground">
                incl. BTW
              </div>
            </div>
          </div>

          {/* Minimum fare notice */}
          {priceBreakdown.subtotal === priceBreakdown.minimum && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Minimumtarief van {formatPrice(priceBreakdown.minimum)} is toegepast
              </AlertDescription>
            </Alert>
          )}

          {/* Estimate notice */}
          {priceBreakdown.estimatedOnly && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Dit is een schatting. De definitieve prijs wordt berekend op basis van de werkelijke route en reistijd.
              </AlertDescription>
            </Alert>
          )}

          {/* Success indicator */}
          {!priceBreakdown.estimatedOnly && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Exacte prijs berekend</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified price display for inline use
export function InlinePrice({ 
  price, 
  loading = false, 
  estimated = false 
}: { 
  price?: number, 
  loading?: boolean, 
  estimated?: boolean 
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Euro className="h-4 w-4 animate-pulse" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!price) {
    return (
      <span className="text-muted-foreground text-sm">
        Prijs berekenen...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Euro className="h-4 w-4" />
      <span className="font-semibold">{formatPrice(price)}</span>
      {estimated && (
        <Badge variant="outline" className="text-xs ml-1">
          ~
        </Badge>
      )}
    </div>
  );
}

// Price comparison component for vehicle selection
export function PriceComparison({ 
  prices 
}: { 
  prices: Array<{vehicleType: string, price: PriceBreakdown}> 
}) {
  const sortedPrices = prices.sort((a, b) => a.price.total - b.price.total);
  const cheapest = sortedPrices[0];

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Prijsvergelijking:</h4>
      {sortedPrices.map(({vehicleType, price}, index) => (
        <div key={vehicleType} className="flex items-center justify-between p-2 rounded border">
          <div className="flex items-center gap-2">
            <span className="capitalize font-medium">{vehicleType}</span>
            {index === 0 && (
              <Badge variant="secondary" className="text-xs">
                Goedkoopst
              </Badge>
            )}
          </div>
          <InlinePrice price={price.total} estimated={price.estimatedOnly} />
        </div>
      ))}
    </div>
  );
}