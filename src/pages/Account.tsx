import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Navigation } from "@/components/Navigation";
import { User, Mail, Phone, MapPin, Bell, Shield, CreditCard, LogOut, CreditCard as Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "Jan",
    lastName: "de Vries", 
    email: "jan.devries@example.nl",
    phone: "+31 6 12345678",
    address: "Damrak 123, 1012 LP Amsterdam",
  });
  
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);
  const [notifications, setNotifications] = useState({
    tripUpdates: true,
    promotions: false,
    reminders: true,
    driverMessages: true,
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = () => {
    setUserInfo(tempUserInfo);
    setIsEditing(false);
    toast({
      title: "Profiel bijgewerkt",
      description: "Je profielgegevens zijn succesvol opgeslagen.",
    });
  };

  const handleCancel = () => {
    setTempUserInfo(userInfo);
    setIsEditing(false);
  };

  const handleLogout = () => {
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-muted-foreground">
              Beheer je persoonlijke gegevens en voorkeuren
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture & Basic Info */}
            <Card className="lg:col-span-1">
              <CardContent className="text-center p-6">
                <div className="w-24 h-24 bg-background border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {userInfo.firstName} {userInfo.lastName}
                </h2>
                <p className="text-muted-foreground mb-4">{userInfo.email}</p>
                <Button variant="taxi-outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Foto wijzigen
                </Button>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Persoonlijke gegevens
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="taxi-outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Bewerken
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="taxi-primary"
                      size="sm"
                      onClick={handleSave}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Opslaan
                    </Button>
                    <Button
                      variant="taxi-ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Annuleren
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Voornaam</Label>
                    <Input
                      id="firstName"
                      value={tempUserInfo.firstName}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Achternaam</Label>
                    <Input
                      id="lastName"
                      value={tempUserInfo.lastName}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={tempUserInfo.email}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, email: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={tempUserInfo.phone}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, phone: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={tempUserInfo.address}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, address: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificatie-instellingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rit-updates</p>
                  <p className="text-sm text-muted-foreground">
                    Ontvang meldingen over je ritten en chauffeur-updates
                  </p>
                </div>
                <Switch 
                  checked={notifications.tripUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, tripUpdates: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promoties en aanbiedingen</p>
                  <p className="text-sm text-muted-foreground">
                    Ontvang meldingen over acties en speciale aanbiedingen
                  </p>
                </div>
                <Switch 
                  checked={notifications.promotions}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, promotions: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Herinneringen</p>
                  <p className="text-sm text-muted-foreground">
                    Ontvang herinneringen voor geplande ritten
                  </p>
                </div>
                <Switch 
                  checked={notifications.reminders}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, reminders: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chauffeur berichten</p>
                  <p className="text-sm text-muted-foreground">
                    Ontvang berichten van chauffeurs
                  </p>
                </div>
                <Switch 
                  checked={notifications.driverMessages}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, driverMessages: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="taxi-outline" className="h-16 flex-col gap-2">
                  <CreditCard className="w-6 h-6" />
                  <span>Betaalmethoden</span>
                </Button>
                <Button variant="taxi-outline" className="h-16 flex-col gap-2">
                  <Shield className="w-6 h-6" />
                  <span>Privacy</span>
                </Button>
                <Button variant="taxi-outline" className="h-16 flex-col gap-2">
                  <Bell className="w-6 h-6" />
                  <span>Notificaties</span>
                </Button>
                <Button 
                  variant="destructive" 
                  className="h-16 flex-col gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-6 h-6" />
                  <span>Uitloggen</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}