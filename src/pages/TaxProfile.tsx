import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Building, Receipt, Edit3, Save, X, FileText, Euro, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserProfile, updateUserProfile, UserProfile, UpdateUserProfileData } from "@/services/userService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TaxData {
  company_name: string;
  btw_number: string;
  company_address: string;
  company_phone: string;
  tax_category: string;
  fiscal_year: string;
  accounting_method: string;
  notes: string;
}

export default function TaxProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [taxData, setTaxData] = useState<TaxData>({
    company_name: "",
    btw_number: "",
    company_address: "",
    company_phone: "",
    tax_category: "",
    fiscal_year: "",
    accounting_method: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Inloggen vereist",
        description: "Je moet inloggen om je belastingprofiel te beheren.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user) {
      loadUserProfile();
    }
  }, [user, authLoading, navigate]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
  const { data, error } = await getCurrentUserProfile();

      if (error) {
        console.error('Profile loading error:', error);
        toast({
          title: "Fout bij laden profiel",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setUserProfile(data);
        setTaxData({
          company_name: data.company_name || "",
          btw_number: data.btw_number || "",
          company_address: data.address || "", // Using address field temporarily
          company_phone: data.phone || "", // Using phone field temporarily
          tax_category: "individual", // Default value since field doesn't exist yet
          fiscal_year: new Date().getFullYear().toString(),
          accounting_method: "cash", // Default value
          notes: "" // Empty since field doesn't exist yet
        });
        toast({
          title: "Belastingprofiel geladen",
          description: "Je belastinggegevens zijn succesvol geladen.",
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
      const updateData: UpdateUserProfileData = {
        company_name: taxData.company_name,
        btw_number: taxData.btw_number,
        // For now, only update existing fields in database
        // New tax fields will be added later when database is updated
      };

  const { data, error } = await updateUserProfile(user.id, updateData);

      if (error) {
        toast({
          title: "Fout bij opslaan",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setUserProfile(data);
        setIsEditing(false);
        toast({
          title: "Belastinggegevens bijgewerkt",
          description: "Je belastinggegevens zijn succesvol opgeslagen.",
        });
      }
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setTaxData({
        company_name: userProfile.company_name || "",
        btw_number: userProfile.btw_number || "",
        company_address: userProfile.address || "",
        company_phone: userProfile.phone || "",
        tax_category: "individual",
        fiscal_year: new Date().getFullYear().toString(),
        accounting_method: "cash",
        notes: ""
      });
    }
    setIsEditing(false);
  };

  const validateBTWNumber = (btw: string) => {
    // Basic BTW number validation for Belgium
    const cleanBTW = btw.replace(/[^0-9]/g, '');
    if (cleanBTW.length === 10) {
      const checkDigits = parseInt(cleanBTW.substring(8, 10));
      const baseNumber = parseInt(cleanBTW.substring(0, 8));
      const calculatedCheck = 97 - (baseNumber % 97);
      return calculatedCheck === checkDigits;
    }
    return false;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Belastingprofiel</h1>
          <p className="text-gray-600">
            Beheer je bedrijfsgegevens en belastinginformatie voor facturen en administratie.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle>Bedrijfsgegevens</CardTitle>
              </div>
              {!isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bewerken
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuleren
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Bedrijfsnaam</Label>
                  <Input
                    id="company_name"
                    value={taxData.company_name}
                    onChange={(e) => setTaxData(prev => ({ ...prev, company_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Uw bedrijfsnaam"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="btw_number">BTW-nummer</Label>
                  <Input
                    id="btw_number"
                    value={taxData.btw_number}
                    onChange={(e) => setTaxData(prev => ({ ...prev, btw_number: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="BE0123456789"
                    className={taxData.btw_number && !validateBTWNumber(taxData.btw_number) ? "border-red-500" : ""}
                  />
                  {taxData.btw_number && !validateBTWNumber(taxData.btw_number) && (
                    <p className="text-sm text-red-500">Ongeldig BTW-nummer format</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Bedrijfsadres</Label>
                <Textarea
                  id="company_address"
                  value={taxData.company_address}
                  onChange={(e) => setTaxData(prev => ({ ...prev, company_address: e.target.value }))}
                  disabled={true}
                  placeholder="(Wordt binnenkort beschikbaar - gebruik voorlopig het adres in uw accountinstellingen)"
                  rows={3}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  U kunt dit veld binnenkort bewerken. Gebruik voorlopig het adres in uw accountinstellingen.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_phone">Bedrijfstelefoon</Label>
                <Input
                  id="company_phone"
                  value={taxData.company_phone}
                  onChange={(e) => setTaxData(prev => ({ ...prev, company_phone: e.target.value }))}
                  disabled={true}
                  placeholder="(Wordt binnenkort beschikbaar - gebruik voorlopig de telefoon in uw accountinstellingen)"
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  U kunt dit veld binnenkort bewerken. Gebruik voorlopig het telefoonnummer in uw accountinstellingen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle>Belastinginstellingen</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">In ontwikkeling</span>
                </div>
                <p className="text-sm text-amber-700">
                  De uitgebreide belastingsinstellingen zijn momenteel in ontwikkeling. 
                  Voorlopig kunt u alleen uw bedrijfsnaam en BTW-nummer beheren.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                <div className="space-y-2">
                  <Label htmlFor="tax_category">Belastingcategorie</Label>
                  <Select disabled={true}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Binnenkort beschikbaar" />
                    </SelectTrigger>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscal_year">Boekjaar</Label>
                  <Select disabled={true}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Binnenkort beschikbaar" />
                    </SelectTrigger>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 opacity-50">
                <Label htmlFor="accounting_method">Boekhoudmethode</Label>
                <Select disabled={true}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue placeholder="Binnenkort beschikbaar" />
                  </SelectTrigger>
                </Select>
              </div>

              <div className="space-y-2 opacity-50">
                <Label htmlFor="notes">Opmerkingen</Label>
                <Textarea
                  disabled={true}
                  placeholder="Deze functie wordt binnenkort beschikbaar"
                  rows={4}
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-900">Aanvullende instellingen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-800 text-sm mb-4">
                Voor het bewerken van uw adres en telefoonnummer, ga naar uw accountinstellingen.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/account")}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Ga naar Accountinstellingen
              </Button>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">Belangrijke informatie</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ul className="space-y-2 text-sm">
                <li>• Deze gegevens worden gebruikt voor het genereren van facturen</li>
                <li>• Zorg ervoor dat uw BTW-nummer correct is voor zakelijke ritten</li>
                <li>• Uw gegevens worden veilig opgeslagen en alleen gebruikt voor administratieve doeleinden</li>
                <li>• Neem contact op met onze support voor vragen over belastingaftrek</li>
                <li>• De uitgebreide belastingsinstellingen worden binnenkort toegevoegd</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}