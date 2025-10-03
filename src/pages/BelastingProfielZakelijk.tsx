import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BusinessTaxProfile {
  id?: string;
  user_id: string;
  company_name: string;
  btw_number: string;
  kvk_number: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  contact_person: string;
  billing_email: string;
  payment_terms: string;
  notes: string;
}

export default function BelastingProfielZakelijk() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessTaxProfile>({
    user_id: "",
    company_name: "",
    btw_number: "",
    kvk_number: "",
    address: "",
    postal_code: "",
    city: "",
    country: "Nederland",
    phone: "",
    email: "",
    contact_person: "",
    billing_email: "",
    payment_terms: "14",
    notes: "",
  });

  // Load existing tax profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('business_tax_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        if (data) {
          setProfile(data);
        } else {
          // Initialize with user ID for new profile
          setProfile(prev => ({ ...prev, user_id: user.id }));
        }
      } catch (error) {
        console.error('Error loading tax profile:', error);
        toast({
          title: "Fout bij laden",
          description: "Kon belastingprofiel niet laden",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Inloggen vereist",
        description: "U moet ingelogd zijn om uw belastingprofiel op te slaan",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSaving(true);

    try {
      const profileData = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (profile.id) {
        // Update existing profile
        const { error } = await supabase
          .from('business_tax_profiles')
          .update(profileData)
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from('business_tax_profiles')
          .insert([profileData])
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      }

      toast({
        title: "Opgeslagen",
        description: "Uw belastingprofiel is succesvol opgeslagen",
      });
    } catch (error) {
      console.error('Error saving tax profile:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon belastingprofiel niet opslaan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof BusinessTaxProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">Laden...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-bold mb-4">Inloggen vereist</h2>
              <p className="text-muted-foreground mb-4">
                U moet ingelogd zijn om uw zakelijke belastingprofiel te beheren
              </p>
              <Button onClick={() => navigate('/login')}>Inloggen</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Zakelijk Belastingprofiel
          </h1>
          <p className="text-muted-foreground mt-2">
            Beheer uw bedrijfsgegevens voor facturen en belastingdoeleinden
          </p>
        </div>

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Bedrijfsgegevens
              </CardTitle>
              <CardDescription>
                Vul uw complete bedrijfsgegevens in voor correcte facturatie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Bedrijfsnaam *</Label>
                  <Input
                    id="company_name"
                    value={profile.company_name}
                    onChange={(e) => updateField('company_name', e.target.value)}
                    placeholder="Uw Bedrijf B.V."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="btw_number">BTW-nummer *</Label>
                  <Input
                    id="btw_number"
                    value={profile.btw_number}
                    onChange={(e) => updateField('btw_number', e.target.value)}
                    placeholder="NL123456789B01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kvk_number">KVK-nummer *</Label>
                  <Input
                    id="kvk_number"
                    value={profile.kvk_number}
                    onChange={(e) => updateField('kvk_number', e.target.value)}
                    placeholder="12345678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contactpersoon *</Label>
                  <Input
                    id="contact_person"
                    value={profile.contact_person}
                    onChange={(e) => updateField('contact_person', e.target.value)}
                    placeholder="Jan Jansen"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Adresgegevens</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adres *</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Straatnaam 123"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postcode *</Label>
                    <Input
                      id="postal_code"
                      value={profile.postal_code}
                      onChange={(e) => updateField('postal_code', e.target.value)}
                      placeholder="1234 AB"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Plaats *</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Amsterdam"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Land *</Label>
                    <Select value={profile.country} onValueChange={(value) => updateField('country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nederland">Nederland</SelectItem>
                        <SelectItem value="België">België</SelectItem>
                        <SelectItem value="Duitsland">Duitsland</SelectItem>
                        <SelectItem value="Frankrijk">Frankrijk</SelectItem>
                        <SelectItem value="Luxemburg">Luxemburg</SelectItem>
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
                    <Label htmlFor="phone">Telefoonnummer *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+31 6 12345678"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="info@uwbedrijf.nl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing_email">Facturatie e-mail</Label>
                    <Input
                      id="billing_email"
                      type="email"
                      value={profile.billing_email}
                      onChange={(e) => updateField('billing_email', e.target.value)}
                      placeholder="facturen@uwbedrijf.nl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Betalingstermijn (dagen)</Label>
                    <Select value={profile.payment_terms} onValueChange={(value) => updateField('payment_terms', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dagen</SelectItem>
                        <SelectItem value="14">14 dagen</SelectItem>
                        <SelectItem value="30">30 dagen</SelectItem>
                        <SelectItem value="60">60 dagen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Opmerkingen</Label>
                <Textarea
                  id="notes"
                  value={profile.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Eventuele aanvullende informatie..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>Opslaan...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Opslaan
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/account')}
                >
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
