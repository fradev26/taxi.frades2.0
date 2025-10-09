import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { Settings, Car, Euro, Users, CalendarCheck } from "lucide-react";
import { VehicleManagement } from "@/components/admin/VehicleManagement";
import { PricingSettings } from "@/components/admin/PricingSettings";
import { DriverManager } from "@/components/admin/DriverManager";
import { BookingManager } from "@/components/admin/BookingManager";

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();

  // Debug information
  console.log('Admin Debug:', { 
    user: user?.email, 
    isAdmin, 
    isLoading,
    userMetadata: user?.user_metadata 
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">Laden...</div>
    </div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center pt-6">
          <h1 className="text-2xl font-bold mb-4">Toegang geweigerd</h1>
          <p className="text-muted-foreground mb-4">Je hebt geen toegang tot dit admin paneel.</p>
          {user && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <p><strong>Huidige gebruiker:</strong> {user.email}</p>
              <p><strong>Admin status:</strong> {isAdmin ? 'Ja' : 'Nee'}</p>
              <p className="mt-2 text-xs">Admin toegang vereist @frades.be email</p>
            </div>
          )}
          {!user && (
            <div className="text-sm text-muted-foreground">
              <p>Je bent niet ingelogd. <a href="/login" className="text-primary underline">Log hier in</a></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Beheer je taxi-service instellingen
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              Boekingen
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Prijzen
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Voertuigen
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Chauffeurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingManager />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingSettings />
          </TabsContent>

          <TabsContent value="fleet">
            <VehicleManagement />
          </TabsContent>

          <TabsContent value="drivers">
            <DriverManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}