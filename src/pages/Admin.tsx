import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { Settings, Car, Euro, Users, CalendarCheck, Mail } from "lucide-react";
import { VehicleManagement } from "@/components/admin/VehicleManagement";
import { PricingSettings } from "@/components/admin/PricingSettings";
import { BookingManagerSimple } from "@/components/admin/BookingManager.simple";
import { StatsDashboard } from "@/components/admin/StatsDashboard";
import AdminSettingsPanel from "@/components/admin/AdminSettingsPanel";
import { UserManager } from "@/components/admin/UserManager";
// Sidebar wordt nu direct via AdminSettingsPanel geïntegreerd
import { DriverManagerNew } from "@/components/admin/DriverManager.new";
import { useState } from "react";
import { useBookings } from "@/hooks/useBookings";

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  // Haal echte boekingen op
  const { bookings = [], isLoading: bookingsLoading } = useBookings();

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
    <AdminSettingsPanel />
  );
}