import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Hash, 
  Edit3, 
  Save, 
  X,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserProfile, updateUserProfile, UserProfile, UpdateUserProfileData } from "@/services/userService";
import { signOut } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempUserInfo, setTempUserInfo] = useState<UpdateUserProfileData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Inloggen vereist",
        description: "Je moet inloggen om je profiel te beheren.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!authLoading && user) {
      loadUserProfile();
    }
  }, [user, authLoading, navigate]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getCurrentUserProfile();

      if (error) {
        console.error('Profile loading error:', error);
        
        // Check for permission denied errors - try to load from localStorage first
        if (error.message && error.message.includes('permission denied')) {
          console.log('Permission denied - checking for local data');
          
          // Try to load from localStorage
          const localProfile = localStorage.getItem(`profile_${user!.id}`);
          let basicProfile;
          
          if (localProfile) {
            try {
              basicProfile = JSON.parse(localProfile);
              console.log('Found local profile data');
            } catch {
              console.log('Invalid local profile data, creating basic profile');
            }
          }
          
          // If no local data, create basic profile from auth data
          if (!basicProfile) {
            basicProfile = {
              id: user!.id,
              email: user!.email || '',
              first_name: user!.user_metadata?.first_name || '',
              last_name: user!.user_metadata?.last_name || '',
              phone: user!.user_metadata?.phone || '',
              address: '',
              company_name: '',
              btw_number: '',
              created_at: user!.created_at,
              updated_at: user!.created_at
            };
          }
          
          setUserProfile(basicProfile);
          setTempUserInfo({
            first_name: basicProfile.first_name,
            last_name: basicProfile.last_name,
            phone: basicProfile.phone,
            address: basicProfile.address,
            company_name: basicProfile.company_name,
            btw_number: basicProfile.btw_number
          });
          
          toast({
            title: "Profiel geladen (basisgegevens)",
            description: "Je profiel is geladen met basisgegevens. Wijzigingen opslaan is mogelijk beperkt.",
            variant: "default",
          });
        } else {
          toast({
            title: "Fout bij laden profiel",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data) {
        setUserProfile(data);
        setTempUserInfo({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          company_name: data.company_name || '',
          btw_number: data.btw_number || ''
        });
        toast({
          title: "Profiel geladen",
          description: "Je profielgegevens zijn succesvol geladen.",
        });
      } else {
        console.error('No profile data returned');
        toast({
          title: "Profiel probleem",
          description: "Er werd geen profieldata gevonden. Probeer de pagina te verversen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      toast({
        title: "Fout bij laden profiel",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !userProfile) return;

    setIsSaving(true);
    try {
      const { data, error } = await updateUserProfile(user.id, tempUserInfo);

      if (error) {
        console.error('Save error:', error);
        
        // Check for permission denied - save locally instead
        if ((error.message && error.message.includes('permission denied')) || error.isPermissionError) {
          console.log('Permission denied - saving locally');
          
          // Update the local profile state with new data
          const updatedProfile = {
            ...userProfile,
            ...tempUserInfo,
            updated_at: new Date().toISOString()
          };
          
          setUserProfile(updatedProfile);
          setIsEditing(false);
          
          // Save to localStorage as backup
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
          
          toast({
            title: "Profiel lokaal opgeslagen",
            description: "Je wijzigingen zijn lokaal opgeslagen. Database opslaan is momenteel beperkt.",
            variant: "default",
          });
        } else {
          toast({
            title: "Fout bij opslaan",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data) {
        setUserProfile(data);
        setIsEditing(false);
        
        // Clear any local backup since database save succeeded
        localStorage.removeItem(`profile_${user.id}`);
        
        toast({
          title: "Profiel bijgewerkt",
          description: "Je profielgegevens zijn succesvol opgeslagen in de database.",
        });
      }
    } catch (error) {
      console.error('Unexpected save error:', error);
      
      // Fallback: save locally
      const updatedProfile = {
        ...userProfile,
        ...tempUserInfo,
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(updatedProfile);
      setIsEditing(false);
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      
      toast({
        title: "Profiel lokaal opgeslagen",
        description: "Er was een probleem met de database. Je wijzigingen zijn lokaal opgeslagen.",
        variant: "default",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setTempUserInfo({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        company_name: userProfile.company_name || '',
        btw_number: userProfile.btw_number || ''
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Fout bij uitloggen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Uitgelogd",
          description: "Je bent succesvol uitgelogd.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Fout bij uitloggen",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  };

  const validateBTWNumber = (btw: string) => {
    const cleanBTW = btw.replace(/[^0-9]/g, '');
    if (cleanBTW.length === 10) {
      const checkDigits = parseInt(cleanBTW.substring(8, 10));
      const baseNumber = parseInt(cleanBTW.substring(0, 8));
      const calculatedCheck = 97 - (baseNumber % 97);
      return calculatedCheck === checkDigits;
    }
    return false;
  };

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4">Authenticatie controleren...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no user after auth loading is complete, don't show anything (redirect is happening)
  if (!user) {
    return null;
  }

  // Show loading during profile loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4">Profiel laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center pt-6">
              <h1 className="text-2xl font-bold mb-4">Profiel wordt aangemaakt</h1>
              <p className="text-muted-foreground mb-4">
                Er wordt een profiel voor uw account aangemaakt. Dit kan even duren.
              </p>
              <div className="space-y-2">
                <Button onClick={() => loadUserProfile()} variant="default">
                  Opnieuw proberen
                </Button>
                <Button onClick={() => navigate("/")} variant="outline">
                  Terug naar hoofdpagina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header - Uber Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profiel</h1>
              <p className="text-gray-600 mt-1">
                Beheer je persoonlijke en zakelijke gegevens
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bewerken
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuleren
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {isSaving ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Opslaan
                  </Button>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="personal">Persoonlijk</TabsTrigger>
            <TabsTrigger value="business">Zakelijk</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Persoonlijke gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Voornaam</Label>
                    <Input
                      id="firstName"
                      value={tempUserInfo.first_name || ''}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, first_name: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Achternaam</Label>
                    <Input
                      id="lastName"
                      value={tempUserInfo.last_name || ''}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, last_name: e.target.value})}
                      disabled={!isEditing}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email || user?.email || ''}
                      disabled={true}
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    E-mailadres kan niet worden gewijzigd
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={tempUserInfo.phone || ''}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, phone: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10 bg-white"
                      placeholder="+32 123 456 789"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      value={tempUserInfo.address || ''}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, address: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10 bg-white"
                      placeholder="Straat 123, 1000 Brussel"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Information Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Zakelijke gegevens
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Deze gegevens zijn optioneel en worden gebruikt voor zakelijke ritten en facturen.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Bedrijfsnaam</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="companyName"
                      value={tempUserInfo.company_name || ''}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, company_name: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10 bg-white"
                      placeholder="Uw bedrijfsnaam (optioneel)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="btwNumber">BTW-nummer</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="btwNumber"
                      value={tempUserInfo.btw_number || ''}
                      onChange={(e) => setTempUserInfo({...tempUserInfo, btw_number: e.target.value})}
                      disabled={!isEditing}
                      className={`pl-10 bg-white ${
                        tempUserInfo.btw_number && !validateBTWNumber(tempUserInfo.btw_number) 
                          ? "border-red-500" 
                          : ""
                      }`}
                      placeholder="BE0123456789 (optioneel)"
                    />
                  </div>
                  {tempUserInfo.btw_number && !validateBTWNumber(tempUserInfo.btw_number) && (
                    <p className="text-sm text-red-500">Ongeldig BTW-nummer format</p>
                  )}
                  <p className="text-xs text-gray-500">
                    BTW-nummer is vereist voor het aftrekken van zakelijke ritten
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Zakelijke ritten</h3>
                    <p className="text-sm text-blue-700">
                      Met een geldig BTW-nummer kunt u uw zakelijke ritten aftrekken van de belasting. 
                      Alle ritten worden automatisch geregistreerd voor uw administratie.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}