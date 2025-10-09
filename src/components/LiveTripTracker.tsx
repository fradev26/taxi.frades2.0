import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trip, getTripStatusInfo, calculateTripProgress } from "@/services/tripService";
import { formatCurrency } from "@/services/walletService";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Car, 
  User, 
  Phone, 
  MessageCircle,
  Star,
  Route,
  AlertCircle,
  CheckCircle,
  Timer,
  Maximize2,
  Minimize2,
  RefreshCw
} from "lucide-react";

interface LiveTripTrackerProps {
  trip: Trip;
  onClose?: () => void;
  onContactDriver?: (phone: string) => void;
  onRefresh?: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function LiveTripTracker({ 
  trip, 
  onClose, 
  onContactDriver, 
  onRefresh,
  fullscreen = false,
  onToggleFullscreen 
}: LiveTripTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [eta, setEta] = useState(trip.driver_eta || 0);
  
  const statusInfo = getTripStatusInfo(trip.status);
  const progress = calculateTripProgress(trip.status);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Simulate ETA updates (in real app, this would come from real-time updates)
  useEffect(() => {
    if (trip.status === 'driver_enroute' && eta > 0) {
      const timer = setInterval(() => {
        setEta(prev => Math.max(0, prev - 1));
      }, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [trip.status, eta]);

  const getStatusMessage = () => {
    switch (trip.status) {
      case 'driver_enroute':
        return `Je chauffeur is onderweg. Verwachte aankomst over ${eta} minuten.`;
      case 'arrived':
        return 'Je chauffeur is gearriveerd op de ophaallocatie.';
      case 'in_progress':
        return 'Je bent onderweg naar je bestemming.';
      default:
        return statusInfo.label;
    }
  };

  const getTripSteps = () => {
    const steps = [
      { 
        id: 'confirmed', 
        label: 'Rit bevestigd', 
        completed: true,
        time: new Date(trip.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
      },
      { 
        id: 'driver_assigned', 
        label: 'Chauffeur toegewezen', 
        completed: ['driver_assigned', 'driver_enroute', 'arrived', 'in_progress', 'completed'].includes(trip.status),
        time: trip.driver_details ? '14:35' : undefined // Mock time
      },
      { 
        id: 'driver_enroute', 
        label: 'Chauffeur onderweg', 
        completed: ['driver_enroute', 'arrived', 'in_progress', 'completed'].includes(trip.status),
        active: trip.status === 'driver_enroute',
        time: trip.status === 'driver_enroute' ? `ETA: ${eta} min` : undefined
      },
      { 
        id: 'arrived', 
        label: 'Chauffeur gearriveerd', 
        completed: ['arrived', 'in_progress', 'completed'].includes(trip.status),
        active: trip.status === 'arrived',
        time: trip.status === 'arrived' ? 'Nu' : undefined
      },
      { 
        id: 'in_progress', 
        label: 'Rit gestart', 
        completed: ['in_progress', 'completed'].includes(trip.status),
        active: trip.status === 'in_progress',
        time: trip.status === 'in_progress' ? '15:05' : undefined // Mock time
      },
      { 
        id: 'completed', 
        label: 'Rit voltooid', 
        completed: trip.status === 'completed',
        active: false
      }
    ];
    
    return steps;
  };

  const tripSteps = getTripSteps();

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className={`${fullscreen ? 'h-full rounded-none border-0' : 'max-w-2xl mx-auto'}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.bgColor}`}>
                <Navigation className={`w-5 h-5 ${statusInfo.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl">Live Tracking</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {trip.booking_reference} • {currentTime.toLocaleTimeString('nl-NL')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button size="sm" variant="outline" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              {onToggleFullscreen && (
                <Button size="sm" variant="outline" onClick={onToggleFullscreen}>
                  {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}
              {onClose && (
                <Button size="sm" variant="outline" onClick={onClose}>
                  Sluiten
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Alert */}
          <Alert className={`border-l-4 ${statusInfo.bgColor.replace('bg-', 'border-l-')}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {getStatusMessage()}
            </AlertDescription>
          </Alert>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rit voortgang</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Trip Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold">Rit Status</h3>
            <div className="space-y-3">
              {tripSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500' 
                      : step.active 
                        ? 'bg-blue-500 border-blue-500 animate-pulse' 
                        : 'border-gray-300'
                  }`}>
                    {step.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    {step.active && <Timer className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.active ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-sm text-muted-foreground">{step.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Route Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
                  <div>
                    <p className="font-medium">{trip.pickup_address}</p>
                    <p className="text-sm text-muted-foreground">Ophaallocatie</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-1">
                  <div className="w-1 h-8 bg-gray-300" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1" />
                  <div>
                    <p className="font-medium">{trip.destination_address}</p>
                    <p className="text-sm text-muted-foreground">Bestemming</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Afstand:</span>
                  <span className="font-medium">{trip.estimated_distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Geschatte tijd:</span>
                  <span className="font-medium">{Math.round(trip.estimated_duration)} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Totaalprijs:</span>
                  <span className="font-medium">{formatCurrency(trip.total_price)}</span>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            {trip.driver_details && (
              <div className="space-y-4">
                <h3 className="font-semibold">Chauffeur</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {trip.driver_details.photo_url ? (
                        <img 
                          src={trip.driver_details.photo_url} 
                          alt={trip.driver_details.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{trip.driver_details.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{trip.driver_details.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {trip.vehicle_details && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span>{trip.vehicle_details.make} {trip.vehicle_details.model}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-center font-mono text-muted-foreground">#</span>
                        <span>{trip.vehicle_details.license_plate}</span>
                      </div>
                    </div>
                  )}
                  
                  {onContactDriver && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onContactDriver(trip.driver_details!.phone)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Bellen
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Berichten
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="space-y-2">
            <h3 className="font-semibold">Live Kaart</h3>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Live kaart tracking</p>
                <p className="text-sm text-muted-foreground">
                  Hier zou de live kaart met chauffeur locatie getoond worden
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}