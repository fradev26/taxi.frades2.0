import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TripCard } from "@/components/TripCard";
import { LiveTripTracker } from "@/components/LiveTripTracker";
import { useTrips } from "@/hooks/useTrips";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Clock, 
  Car, 
  Navigation, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Activity,
  BarChart3
} from "lucide-react";

interface TripsDashboardProps {
  className?: string;
}

export function TripsDashboard({ className }: TripsDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'active' | 'analytics'>('overview');
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  
  const {
    trips,
    upcomingTrips,
    activeTrips,
    pastTrips,
    isLoading,
    error,
    refreshTrips
  } = useTrips();
  
  const { toast } = useToast();

  // Auto-refresh for active trips
  useEffect(() => {
    if (activeTrips.length > 0) {
      const interval = setInterval(refreshTrips, 15000); // Every 15 seconds
      return () => clearInterval(interval);
    }
  }, [activeTrips.length, refreshTrips]);

  // Calculate trip statistics
  const totalTrips = trips.length;
  const completedTrips = pastTrips.filter(trip => trip.status === 'completed').length;
  const totalSpent = pastTrips
    .filter(trip => trip.status === 'completed')
    .reduce((sum, trip) => sum + trip.total_price, 0);
  const avgRating = pastTrips
    .filter(trip => trip.status === 'completed' && trip.driver_details?.rating)
    .reduce((sum, trip, _, arr) => sum + (trip.driver_details?.rating || 0) / arr.length, 0);

  const handleTrackTrip = (tripId: string) => {
    setSelectedTrip(tripId);
    toast({
      title: "Live tracking gestart",
      description: "Je kunt nu je rit live volgen.",
    });
  };

  const getCurrentActiveTrips = () => {
    return activeTrips.filter(trip => 
      ['driver_enroute', 'arrived', 'in_progress'].includes(trip.status)
    );
  };

  const getUpcomingToday = () => {
    const today = new Date().toDateString();
    return upcomingTrips.filter(trip => 
      new Date(trip.scheduled_datetime).toDateString() === today
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Er is een fout opgetreden bij het laden van je ritten. Probeer het opnieuw.
        </AlertDescription>
      </Alert>
    );
  }

  const currentActiveTrips = getCurrentActiveTrips();
  const todayUpcoming = getUpcomingToday();
  const selectedTripData = selectedTrip ? trips.find(t => t.id === selectedTrip) : null;

  return (
    <div className={className}>
      {/* Active Trip Alert */}
      {currentActiveTrips.length > 0 && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Je hebt {currentActiveTrips.length} actieve rit{currentActiveTrips.length > 1 ? 'ten' : ''}. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-blue-600"
              onClick={() => setActiveView('active')}
            >
              Bekijk details →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentActiveTrips.length}</p>
                <p className="text-sm text-muted-foreground">Actief nu</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{todayUpcoming.length}</p>
                <p className="text-sm text-muted-foreground">Vandaag gepland</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{completedTrips}</p>
                <p className="text-sm text-muted-foreground">Voltooid</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">€{totalSpent.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Totaal uitgegeven</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="active">
            Actief ({currentActiveTrips.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Today's Upcoming Trips */}
          {todayUpcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Vandaag gepland ({todayUpcoming.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayUpcoming.slice(0, 3).map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    compact={true}
                    onViewDetails={(id) => console.log('View details', id)}
                  />
                ))}
                {todayUpcoming.length > 3 && (
                  <Button variant="outline" className="w-full">
                    Bekijk alle {todayUpcoming.length} ritten van vandaag
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Completed Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recente ritten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastTrips.slice(0, 3).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  compact={true}
                  onViewDetails={(id) => console.log('View details', id)}
                />
              ))}
              {pastTrips.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nog geen voltooide ritten
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Trips Tab */}
        <TabsContent value="active" className="space-y-4">
          {currentActiveTrips.length > 0 ? (
            <>
              {currentActiveTrips.map((trip) => (
                <div key={trip.id}>
                  {selectedTrip === trip.id ? (
                    <LiveTripTracker
                      trip={trip}
                      onClose={() => setSelectedTrip(null)}
                      onContactDriver={(phone) => window.open(`tel:${phone}`, '_self')}
                      onRefresh={refreshTrips}
                    />
                  ) : (
                    <TripCard
                      trip={trip}
                      onTrackTrip={handleTrackTrip}
                      onContactDriver={(phone) => window.open(`tel:${phone}`, '_self')}
                      onViewDetails={(id) => console.log('View details', id)}
                    />
                  )}
                </div>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Navigation className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Geen actieve ritten</h3>
                <p className="text-muted-foreground mb-4">
                  Je hebt momenteel geen actieve ritten.
                </p>
                <Button>Nieuwe rit boeken</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Rit Statistieken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Totaal ritten:</span>
                    <span className="font-medium">{totalTrips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Voltooid:</span>
                    <span className="font-medium">{completedTrips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gemiddelde rating:</span>
                    <span className="font-medium">
                      {avgRating > 0 ? avgRating.toFixed(1) + ' ⭐' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totaal uitgegeven:</span>
                    <span className="font-medium">€{totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favoriete Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Geen data beschikbaar
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}