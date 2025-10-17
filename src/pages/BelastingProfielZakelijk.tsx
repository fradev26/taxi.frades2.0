import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

interface BusinessTaxProfile {
  id?: string;
  user_id: string;
  company_name: string;
  btw_number: string;
  kvk_number: string;
  contact_person: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  billing_email: string;
  payment_terms: number;
  notes: string;
}

const COUNTRIES = [
  { value: "Netherlands", label: "Nederland" },
  { value: "Belgium", label: "België" },
  { value: "Germany", label: "Duitsland" },
  { value: "France", label: "Frankrijk" },
  { value: "Luxembourg", label: "Luxemburg" },
];

const PAYMENT_TERMS = [
  { value: 7, label: "7 dagen" },
  { value: 14, label: "14 dagen" },
  { value: 30, label: "30 dagen" },
  { value: 60, label: "60 dagen" },
];

export default function BelastingProfielZakelijk() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessTaxProfile>({
    user_id: user?.id || "",
    company_name: "",
    btw_number: "",
    kvk_number: "",
    contact_person: "",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    country: "Netherlands",
    phone: "",
    email: "",
    billing_email: "",
    payment_terms: 30,
    notes: "",
  });

  // Load existing profile
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_tax_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists yet, keep default values
          console.log('No business tax profile found, creating new');
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading business tax profile:', error);
      toast({
        title: "Fout bij laden profiel",
        description: "Er ging iets mis bij het laden van uw zakelijk belastingprofiel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Basic validation
    if (!profile.company_name || !profile.contact_person || !profile.email) {
      toast({
        title: "Verplichte velden",
        description: "Vul ten minste bedrijfsnaam, contactpersoon en e-mailadres in.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const profileData = {
        ...profile,
        user_id: user.id,
      };

      let result;
      if (profile.id) {
        // Update existing profile
        result = await supabase
          .from('business_tax_profiles')
          .update(profileData)
          .eq('id', profile.id);
      } else {
        // Create new profile
        result = await supabase
          .from('business_tax_profiles')
          .insert([profileData])
          .select()
          .single();
        
        if (result.data) {
          setProfile(prev => ({ ...prev, id: result.data.id }));
        }
      }

      if (result.error) throw result.error;

      toast({
        title: "Profiel opgeslagen",
        description: "Uw zakelijk belastingprofiel is succesvol opgeslagen.",
      });
    } catch (error) {
      console.error('Error saving business tax profile:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er ging iets mis bij het opslaan van uw profiel.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof BusinessTaxProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/account')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Account
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                Zakelijk Belastingprofiel
              </CardTitle>
              <p className="text-muted-foreground">
                Beheer uw bedrijfsgegevens voor facturen en belastingdoeleinden.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bedrijfsinformatie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Bedrijfsnaam *</Label>
                        <Input
                          id="company_name"
                          value={profile.company_name}
                          onChange={(e) => updateProfile('company_name', e.target.value)}
                          placeholder="Uw bedrijfsnaam"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contactpersoon *</Label>
                        <Input
                          id="contact_person"
                          value={profile.contact_person}
                          onChange={(e) => updateProfile('contact_person', e.target.value)}
                          placeholder="Naam contactpersoon"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="btw_number">BTW-nummer</Label>
                        <Input
                          id="btw_number"
                          value={profile.btw_number}
                          onChange={(e) => updateProfile('btw_number', e.target.value)}
                          placeholder="NL123456789B01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kvk_number">KVK-nummer</Label>
                        <Input
                          id="kvk_number"
                          value={profile.kvk_number}
                          onChange={(e) => updateProfile('kvk_number', e.target.value)}
                          placeholder="12345678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Adresgegevens</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_line1">Adres</Label>
                        <Input
                          id="address_line1"
                          value={profile.address_line1}
                          onChange={(e) => updateProfile('address_line1', e.target.value)}
                          placeholder="Straatnaam en huisnummer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address_line2">Adres (regel 2)</Label>
                        <Input
                          id="address_line2"
                          value={profile.address_line2}
                          onChange={(e) => updateProfile('address_line2', e.target.value)}
                          placeholder="Optioneel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postcode</Label>
                        <Input
                          id="postal_code"
                          value={profile.postal_code}
                          onChange={(e) => updateProfile('postal_code', e.target.value)}
                          placeholder="1234 AB"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Plaats</Label>
                        <Input
                          id="city"
                          value={profile.city}
                          onChange={(e) => updateProfile('city', e.target.value)}
                          placeholder="Plaatsnaam"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Land</Label>
                        <Select 
                          value={profile.country} 
                          onValueChange={(value) => updateProfile('country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contactgegevens</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefoonnummer</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          placeholder="+31 6 12345678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mailadres *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => updateProfile('email', e.target.value)}
                          placeholder="info@uwbedrijf.nl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing_email">Facturatie e-mailadres</Label>
                        <Input
                          id="billing_email"
                          type="email"
                          value={profile.billing_email}
                          onChange={(e) => updateProfile('billing_email', e.target.value)}
                          placeholder="facturen@uwbedrijf.nl (optioneel)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Factureringsinstellingen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment_terms">Betalingstermijn</Label>
                        <Select 
                          value={profile.payment_terms.toString()} 
                          onValueChange={(value) => updateProfile('payment_terms', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TERMS.map((term) => (
                              <SelectItem key={term.value} value={term.value.toString()}>
                                {term.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Opmerkingen</h3>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Extra opmerkingen</Label>
                      <Textarea
                        id="notes"
                        value={profile.notes}
                        onChange={(e) => updateProfile('notes', e.target.value)}
                        placeholder="Eventuele aanvullende informatie..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-4 pt-6">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Opslaan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Profiel opslaan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}