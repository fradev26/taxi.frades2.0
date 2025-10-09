import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TripCard } from "@/components/TripCard";
import { LiveTripTracker } from "@/components/LiveTripTracker";
import { TripRating } from "@/components/TripRating";
import { Navigation } from "@/components/Navigation";
import { useTrips } from "@/hooks/useTrips";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/EmptyState";
import { LoadingStates } from "@/components/LoadingStates";
import { 
  Car, 
  MapPin, 
  Clock, 
  Calendar, 
  Star, 
  Phone, 
  MessageCircle,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Navigation as NavigationIcon,
  Plus
} from "lucide-react";

export default function Trips() {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past'>('active');
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [tripToCancel, setTripToCancel] = useState<string | null>(null);
  const [showLiveTracker, setShowLiveTracker] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [trackerFullscreen, setTrackerFullscreen] = useState(false);
  
  const {
    trips,
    upcomingTrips,
    activeTrips,
    pastTrips,
    isLoading,
    error,
    refreshTrips,
    cancelTrip
  } = useTrips();
  
  const { toast } = useToast();

  // Auto-refresh active trips
  useEffect(() => {
    if (activeTrips.length > 0) {
      const interval = setInterval(refreshTrips, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTrips.length, refreshTrips]);

  const handleCancelTrip = async (tripId: string) => {
    setTripToCancel(tripId);
    setShowCancelDialog(true);
  };

  const confirmCancelTrip = async () => {
    if (!tripToCancel) return;
    
    try {
      await cancelTrip(tripToCancel);
      toast({
        title: "Rit geannuleerd",
        description: "Je rit is succesvol geannuleerd.",
      });
    } catch (error) {
      toast({
        title: "Annulering mislukt",
        description: "Er is een fout opgetreden bij het annuleren van je rit.",
        variant: "destructive",
      });
    }
    
    setShowCancelDialog(false);
    setTripToCancel(null);
  };

  const handleTrackTrip = (tripId: string) => {
    setSelectedTrip(tripId);
    setShowLiveTracker(true);
  };

  const handleContactDriver = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewDetails = (tripId: string) => {
    setSelectedTrip(tripId);
    setShowTripDetails(true);
  };

  const handleRateTrip = (tripId: string) => {
    setSelectedTrip(tripId);
    setShowRating(true);
  };

  if (isLoading) {
    return <LoadingStates.TripsPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Er is een fout opgetreden bij het laden van je ritten. Probeer het opnieuw.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const selectedTripData = selectedTrip ? trips.find(t => t.id === selectedTrip) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Mijn Ritten</h1>
              <p className="text-muted-foreground">
                Bekijk je geboekte ritten en ritgeschiedenis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshTrips}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Vernieuwen
              </Button>
              <Button size="sm" variant="taxi-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Rit
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{activeTrips.length}</p>
                    <p className="text-sm text-muted-foreground">Actieve ritten</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <NavigationIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{upcomingTrips.length}</p>
                    <p className="text-sm text-muted-foreground">Komende ritten</p>
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
                    <p className="text-2xl font-bold">{pastTrips.length}</p>
                    <p className="text-sm text-muted-foreground">Voltooide ritten</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trip Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <NavigationIcon className="w-4 h-4" />
                Actief ({activeTrips.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Komend ({upcomingTrips.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Geschiedenis ({pastTrips.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Trips */}
            <TabsContent value="active">
              {activeTrips.length > 0 ? (
                <div className="space-y-4">
                  {activeTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onCancel={handleCancelTrip}
                      onViewDetails={handleViewDetails}
                      onTrackTrip={handleTrackTrip}
                      onContactDriver={handleContactDriver}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="trips"
                  title="Geen actieve ritten"
                  description="Je hebt momenteel geen actieve ritten."
                  actionLabel="Nieuwe rit boeken"
                />
              )}
            </TabsContent>

            {/* Upcoming Trips */}
            <TabsContent value="upcoming">
              {upcomingTrips.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onCancel={handleCancelTrip}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="trips"
                  title="Geen geplande ritten"
                  description="Je hebt geen ritten gepland voor de komende tijd."
                  actionLabel="Rit plannen"
                />
              )}
            </TabsContent>

            {/* Past Trips */}
            <TabsContent value="past">
              {pastTrips.length > 0 ? (
                <div className="space-y-4">
                  {pastTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onViewDetails={handleViewDetails}
                      onRate={trip.status === 'completed' ? handleRateTrip : undefined}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="trips"
                  title="Geen ritgeschiedenis"
                  description="Je hebt nog geen ritten gemaakt."
                  actionLabel="Eerste rit boeken"
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Trip Details Modal */}
          <Dialog open={showTripDetails} onOpenChange={setShowTripDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Rit Details</DialogTitle>
              </DialogHeader>
              {selectedTripData && (
                <TripCard
                  trip={selectedTripData}
                  onCancel={handleCancelTrip}
                  onTrackTrip={handleTrackTrip}
                  onContactDriver={handleContactDriver}
                  onRate={selectedTripData.status === 'completed' ? handleRateTrip : undefined}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Cancel Confirmation Dialog */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rit annuleren</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Weet je zeker dat je deze rit wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Behouden
                  </Button>
                  <Button variant="destructive" onClick={confirmCancelTrip}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Live Trip Tracker */}
          <Dialog open={showLiveTracker} onOpenChange={setShowLiveTracker}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedTripData && (
                <LiveTripTracker
                  trip={selectedTripData}
                  onClose={() => setShowLiveTracker(false)}
                  onContactDriver={handleContactDriver}
                  onRefresh={refreshTrips}
                  fullscreen={trackerFullscreen}
                  onToggleFullscreen={() => setTrackerFullscreen(!trackerFullscreen)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Trip Rating */}
          <Dialog open={showRating} onOpenChange={setShowRating}>
            <DialogContent className="max-w-2xl">
              {selectedTripData && (
                <TripRating
                  trip={selectedTripData}
                  onSubmitRating={(rating) => {
                    console.log('Rating submitted:', rating);
                    // Here you would typically send the rating to your backend
                    toast({
                      title: "Beoordeling ontvangen",
                      description: "Bedankt voor je feedback!",
                    });
                  }}
                  onClose={() => setShowRating(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}