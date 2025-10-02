import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, FileText, Save, X, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TaxProfile {
  company_name: string;
  btw_number: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

export default function BelastingProfielZakelijk() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [taxProfile, setTaxProfile] = useState<TaxProfile>({
    company_name: "",
    btw_number: "",
    address: "",
    postal_code: "",
    city: "",
    country: "België",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
  });
  const [tempProfile, setTempProfile] = useState<TaxProfile>({ ...taxProfile });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      loadTaxProfile();
    }
  }, [user, authLoading, navigate]);

  const loadTaxProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, btw_number, address, postal_code, city, country, contact_person, contact_email, contact_phone')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error loading tax profile:', error);
      } else if (data) {
        const profile: TaxProfile = {
          company_name: data.company_name || "",
          btw_number: data.btw_number || "",
          address: data.address || "",
          postal_code: data.postal_code || "",
          city: data.city || "",
          country: data.country || "België",
          contact_person: data.contact_person || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
        };
        setTaxProfile(profile);
        setTempProfile(profile);
      }
    } catch (error) {
      console.error('Unexpected error loading tax profile:', error);
      toast({
        title: "Fout bij laden",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate BTW number format (basic validation)
    if (tempProfile.btw_number && !tempProfile.btw_number.match(/^BE\d{10}$/)) {
      toast({
        title: "Ongeldig BTW-nummer",
        description: "BTW-nummer moet in het formaat BE0123456789 zijn.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: tempProfile.company_name,
          btw_number: tempProfile.btw_number,
          address: tempProfile.address,
          postal_code: tempProfile.postal_code,
          city: tempProfile.city,
          country: tempProfile.country,
          contact_person: tempProfile.contact_person,
          contact_email: tempProfile.contact_email,
          contact_phone: tempProfile.contact_phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      setTaxProfile(tempProfile);
      setIsEditing(false);
      toast({
        title: "Profiel bijgewerkt",
        description: "Uw belastingprofiel is succesvol opgeslagen.",
      });
    } catch (error) {
      console.error('Error saving tax profile:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van uw profiel.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile({ ...taxProfile });
    setIsEditing(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-primary" />
            Belastingprofiel Zakelijk
          </h1>
          <p className="text-muted-foreground">
            Beheer uw bedrijfsgegevens en BTW-informatie voor facturen
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Bedrijfsgegevens
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
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? "Opslaan..." : "Opslaan"}
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
          <CardContent className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bedrijfsinformatie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Bedrijfsnaam</Label>
                  <Input
                    id="company_name"
                    value={tempProfile.company_name}
                    onChange={(e) => setTempProfile({ ...tempProfile, company_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Bedrijfsnaam"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btw_number">BTW-nummer</Label>
                  <Input
                    id="btw_number"
                    value={tempProfile.btw_number}
                    onChange={(e) => setTempProfile({ ...tempProfile, btw_number: e.target.value })}
                    disabled={!isEditing}
                    placeholder="BE0123456789"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Adresgegevens</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Straat en nummer"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postcode</Label>
                    <Input
                      id="postal_code"
                      value={tempProfile.postal_code}
                      onChange={(e) => setTempProfile({ ...tempProfile, postal_code: e.target.value })}
                      disabled={!isEditing}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Stad</Label>
                    <Input
                      id="city"
                      value={tempProfile.city}
                      onChange={(e) => setTempProfile({ ...tempProfile, city: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Brussel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Input
                      id="country"
                      value={tempProfile.country}
                      onChange={(e) => setTempProfile({ ...tempProfile, country: e.target.value })}
                      disabled={!isEditing}
                      placeholder="België"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contactpersoon</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Naam</Label>
                  <Input
                    id="contact_person"
                    value={tempProfile.contact_person}
                    onChange={(e) => setTempProfile({ ...tempProfile, contact_person: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Naam contactpersoon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">E-mail</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={tempProfile.contact_email}
                    onChange={(e) => setTempProfile({ ...tempProfile, contact_email: e.target.value })}
                    disabled={!isEditing}
                    placeholder="email@bedrijf.be"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefoon</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={tempProfile.contact_phone}
                    onChange={(e) => setTempProfile({ ...tempProfile, contact_phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+32 XXX XX XX XX"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
