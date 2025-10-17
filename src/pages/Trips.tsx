import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { EmptyState } from "@/components/EmptyState";
import { 
  Clock, 
  MapPin, 
  Car, 
  User,
  Calendar,
  Phone,
  MessageCircle,
  Star,
  Navigation as NavigationIcon
} from "lucide-react";

import { useNavigate } from 'react-router-dom';

export default function Trips() {
  // Use the trips hook to fetch real trips for the current user
  const { trips, isLoading } = (() => {
    try {
      // dynamic import to avoid circular deps during build step
      const mod = require('../hooks/useTrips');
      return mod.useTrips();
    } catch (e) {
      // Fallback for build-time or SSR
      return { trips: [], isLoading: false };
    }
  })();

  const upcomingTrips = (trips || []).filter((t: any) => new Date(t.scheduled_time) > new Date() && t.status !== 'cancelled');
  const pastTrips = (trips || []).filter((t: any) => new Date(t.scheduled_time) <= new Date() || t.status === 'completed' || t.status === 'cancelled');

  const navigate = useNavigate();

  const TripCard = ({ trip, isPast = false }: { trip: any; isPast?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => trip?.id && navigate(`${ROUTES.TRIPS}/${trip.id}`)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Trip Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <p className="font-semibold">
                  {new Date(`${trip.date}T${trip.time}`).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">{trip.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">€ {trip.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                {isPast ? trip.duration : trip.estimatedDuration}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-accent-green rounded-full mt-1"></div>
              <div>
                <p className="font-medium">{trip.pickup}</p>
                <p className="text-sm text-muted-foreground">Ophaallocatie</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-1">
              <div className="w-1 h-8 bg-border"></div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-primary rounded-full mt-1"></div>
              <div>
                <p className="font-medium">{trip.destination}</p>
                <p className="text-sm text-muted-foreground">Bestemming</p>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg luxury-solid-bg luxury-rounded">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{trip.driver}</p>
                <p className="text-sm text-muted-foreground">
                  {trip.vehicle} • {trip.licensePlate}
                </p>
              </div>
            </div>
            
            {!isPast && (
              <div className="flex gap-2">
                <Button size="sm" variant="taxi-outline">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="taxi-outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {isPast && trip.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < trip.rating 
                        ? "fill-accent-green text-accent-green" 
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isPast && (
            <div className="flex gap-2 pt-2">
              <Button variant="taxi-primary" size="sm" className="flex-1">
                <NavigationIcon className="w-4 h-4 mr-2" />
                Chauffeur volgen
              </Button>
              <Button variant="taxi-outline" size="sm">
                Wijzigen
              </Button>
              <Button variant="destructive" size="sm">
                Annuleren
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Activiteit</h1>
            <p className="text-muted-foreground">
              Overzicht van je ritten en boekingen
            </p>
          </div>

          {/* Trip Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="w-4 h-4" />
                Geplande ritten ({upcomingTrips.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2">
                <Clock className="w-4 h-4" />
                Afgelopen ritten ({pastTrips.length})
              </TabsTrigger>
            </TabsList>

            {/** Unified empty state copy for both upcoming and past tabs */}
            {(() => {
              const emptyTitle = "Je hebt nog geen ritten";
              const emptyDescription = "";
              const emptyAction = "Boek je eerste rit";

              return (
                <>
                  <TabsContent value="upcoming" className="space-y-4 mt-6">
                    {upcomingTrips.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingTrips.map((trip) => (
                          <TripCard key={trip.id} trip={trip} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        type="trips"
                        title={emptyTitle}
                        description={emptyDescription}
                        actionLabel={emptyAction}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4 mt-6">
                    {pastTrips.length > 0 ? (
                      <div className="space-y-4">
                        {pastTrips.map((trip) => (
                          <TripCard key={trip.id} trip={trip} isPast={true} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        type="trips"
                        title={emptyTitle}
                        description={emptyDescription}
                        actionLabel={emptyAction}
                      />
                    )}
                  </TabsContent>
                </>
              );
            })()}
          </Tabs>
        </div>
      </div>
    </div>
  );
}