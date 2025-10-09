import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Trip, 
  getTripStatusInfo, 
  formatTripDuration, 
  calculateTripProgress 
} from "@/services/tripService";
import { formatCurrency } from "@/services/walletService";
import { 
  Car, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  MessageCircle, 
  Star, 
  Navigation, 
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Route
} from "lucide-react";

interface TripCardProps {
  trip: Trip;
  onCancel?: (tripId: string) => void;
  onViewDetails?: (tripId: string) => void;
  onTrackTrip?: (tripId: string) => void;
  onContactDriver?: (phone: string) => void;
  onRate?: (tripId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TripCard({ 
  trip, 
  onCancel, 
  onViewDetails, 
  onTrackTrip, 
  onContactDriver, 
  onRate,
  showActions = true,
  compact = false 
}: TripCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const statusInfo = getTripStatusInfo(trip.status);
  const progress = calculateTripProgress(trip.status);
  const isPast = ['completed', 'cancelled'].includes(trip.status);
  const isActive = ['driver_enroute', 'arrived', 'in_progress'].includes(trip.status);
  const canCancel = ['scheduled', 'confirmed', 'driver_assigned'].includes(trip.status);
  
  const tripDate = new Date(trip.scheduled_datetime);
  const isToday = tripDate.toDateString() === new Date().toDateString();
  const isTomorrow = tripDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const getDateLabel = () => {
    if (isToday) return 'Vandaag';
    if (isTomorrow) return 'Morgen';
    return tripDate.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(trip.id)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusInfo.bgColor}`} />
              <div className="min-w-0">
                <p className="font-medium truncate">{trip.pickup_address}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {getDateLabel()} • {tripDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(trip.total_price)}</p>
              <Badge variant="secondary" className="text-xs">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Trip Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.bgColor}`}>
                <Car className={`w-5 h-5 ${statusInfo.color}`} />
              </div>
              <div>
                <p className="font-semibold text-lg">{getDateLabel()}</p>
                <p className="text-sm text-muted-foreground">
                  {tripDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} • {trip.booking_reference}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{formatCurrency(trip.total_price)}</p>
              <Badge className={`${statusInfo.color} ${statusInfo.bgColor} border-0`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Progress Bar (for active trips) */}
          {isActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rit voortgang</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Route Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="w-0.5 h-4 bg-gray-300" />
                <div className="w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-medium">{trip.pickup_address}</p>
                  <p className="text-sm text-muted-foreground">Opstaplocatie</p>
                </div>
                <div>
                  <p className="font-medium">{trip.destination_address}</p>
                  <p className="text-sm text-muted-foreground">Bestemming</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{formatTripDuration(trip.estimated_duration)}</p>
                <p>{trip.estimated_distance.toFixed(1)} km</p>
              </div>
            </div>

            {/* Stopovers */}
            {trip.stopovers && trip.stopovers.length > 0 && (
              <div className="ml-6 pl-3 border-l border-dashed border-gray-300">
                <p className="text-sm font-medium mb-1">Tussenhaltes:</p>
                {trip.stopovers.map((stopover, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {stopover.order}. {stopover.address}
                  </p>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{trip.vehicle_type}</span>
              {trip.vehicle_details && (
                <span className="text-muted-foreground">
                  • {trip.vehicle_details.make} {trip.vehicle_details.model}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{trip.payment_method.replace('_', ' ')}</span>
              <Badge 
                variant={trip.payment_status === 'paid' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {trip.payment_status === 'paid' ? 'Betaald' : 
                 trip.payment_status === 'pending' ? 'Wachten' : 
                 trip.payment_status === 'failed' ? 'Mislukt' : 'Terugbetaald'}
              </Badge>
            </div>
          </div>

          {/* Driver Information */}
          {trip.driver_details && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {trip.driver_details.photo_url ? (
                      <img 
                        src={trip.driver_details.photo_url} 
                        alt={trip.driver_details.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{trip.driver_details.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {trip.driver_details.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                {trip.driver_eta && (
                  <div className="text-right">
                    <p className="text-sm font-medium">ETA: {trip.driver_eta} min</p>
                    <p className="text-xs text-muted-foreground">Verwachte aankomst</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Special Instructions */}
          {trip.special_instructions && (
            <>
              <Separator />
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {trip.special_instructions}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          {showActions && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isActive && onTrackTrip && (
                    <Button size="sm" onClick={() => onTrackTrip(trip.id)}>
                      <Navigation className="w-4 h-4 mr-2" />
                      Volgen
                    </Button>
                  )}
                  
                  {trip.driver_details && onContactDriver && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onContactDriver(trip.driver_details!.phone)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Bellen
                    </Button>
                  )}
                  
                  {isPast && trip.status === 'completed' && onRate && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRate(trip.id)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Beoordelen
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onViewDetails && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onViewDetails(trip.id)}
                    >
                      Details
                    </Button>
                  )}
                  
                  {canCancel && onCancel && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onCancel(trip.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Annuleren
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}