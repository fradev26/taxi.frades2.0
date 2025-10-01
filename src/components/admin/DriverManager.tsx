import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, CreditCard as Edit, Trash2, Phone, Mail, MapPin, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, validatePassword } from "@/utils/validation";

interface Driver {
  id: string;
  user_id: string;
  display_name?: string;
  phone?: string;
  company_name?: string;
  btw_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  // From auth.users via join
  email?: string;
}

interface DriverFormData {
  display_name: string;
  phone: string;
  company_name: string;
  btw_number: string;
  address: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export function DriverManager() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<DriverFormData>({
    display_name: "",
    phone: "",
    company_name: "",
    btw_number: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  // Load drivers from database
  const loadDrivers = async () => {
    try {
      setIsLoading(true);

      // Use the optimized RPC function to get profiles with user emails
      const { data: profilesData, error: profilesError } = await supabase.rpc('get_profiles_with_emails');

      if (profilesError) throw profilesError;

      // The RPC function returns data already formatted with email addresses
      setDrivers(profilesData || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast({
        title: "Fout bij laden chauffeurs",
        description: "Kon chauffeurs niet laden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      display_name: "",
      phone: "",
      company_name: "",
      btw_number: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setEditingDriver(null);
    setShowPassword(false);
  };

  // Open dialog for adding new driver
  const handleAddDriver = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for editing driver
  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      display_name: driver.display_name || "",
      phone: driver.phone || "",
      company_name: driver.company_name || "",
      btw_number: driver.btw_number || "",
      address: driver.address || "",
      email: driver.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsDialogOpen(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingDriver) {
        // Update existing driver profile
        const { error } = await (supabase as any)
          .from('profiles')
          .update({
            display_name: formData.display_name || null,
            phone: formData.phone || null,
            company_name: formData.company_name || null,
            btw_number: formData.btw_number || null,
            address: formData.address || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDriver.id);

        if (error) throw error;

        toast({
          title: "Chauffeur bijgewerkt",
          description: `${formData.display_name || formData.email} is succesvol bijgewerkt.`,
        });
      } else {
        // Create new driver - validation first
        if (!validateEmail(formData.email)) {
          toast({
            title: "Ongeldig e-mailadres",
            description: "Voer een geldig e-mailadres in.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (!formData.password || !validatePassword(formData.password)) {
          toast({
            title: "Ongeldig wachtwoord",
            description: "Wachtwoord moet minimaal 8 karakters bevatten.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Wachtwoorden komen niet overeen",
            description: "Controleer je wachtwoord en probeer opnieuw.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        // Step 1: Create user in auth.users
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: undefined, // Prevent email confirmation for admin-created users
          }
        });

        if (authError) {
          throw new Error(`Fout bij aanmaken gebruiker: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error("Geen gebruiker geretourneerd na aanmaken");
        }

        // Step 2: Create entry in public.users table
        const { error: userError } = await (supabase as any)
          .from('users')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (userError) {
          // If users table insert fails, we should clean up the auth user
          console.error('Error creating user record:', userError);
          throw new Error(`Fout bij aanmaken gebruikersrecord: ${userError.message}`);
        }

        // Step 3: Create profile for the driver
        const { error: profileError } = await (supabase as any)
          .from('profiles')
          .insert([{
            user_id: authData.user.id,
            display_name: formData.display_name || null,
            phone: formData.phone || null,
            company_name: formData.company_name || null,
            btw_number: formData.btw_number || null,
            address: formData.address || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error(`Fout bij aanmaken profiel: ${profileError.message}`);
        }

        toast({
          title: "Chauffeur toegevoegd",
          description: `${formData.display_name || formData.email} is succesvol toegevoegd als chauffeur.`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: "Fout bij opslaan",
        description: error instanceof Error ? error.message : "Kon chauffeur niet opslaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete driver profile
  const handleDeleteDriver = async (driver: Driver) => {
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .delete()
        .eq('id', driver.id);

      if (error) throw error;

      toast({
        title: "Chauffeur verwijderd",
        description: `${driver.display_name || driver.email} is succesvol verwijderd.`,
      });

      loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon chauffeur niet verwijderen. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Chauffeursbeheer
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Beheer de chauffeurs en hun profielinformatie
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddDriver} className="gap-2">
                <Plus className="w-4 h-4" />
                Voeg chauffeur toe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDriver ? "Chauffeur bewerken" : "Nieuwe chauffeur toevoegen"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="chauffeur@example.com"
                    disabled={!!editingDriver} // Can't change email for existing users
                    required={!editingDriver}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Weergavenaam</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Jan de Vries"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+31 6 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Bedrijfsnaam</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="FRADES Chauffeurs B.V."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="btw_number">BTW-nummer</Label>
                  <Input
                    id="btw_number"
                    value={formData.btw_number}
                    onChange={(e) => setFormData({ ...formData, btw_number: e.target.value })}
                    placeholder="NL123456789B01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Damrak 123, 1012 LP Amsterdam"
                  />
                </div>

                {!editingDriver && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Wachtwoord</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Minimaal 8 karakters"
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Herhaal het wachtwoord"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {editingDriver ? "Bijwerken" : "Toevoegen"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Annuleren
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen chauffeurs</h3>
            <p className="text-muted-foreground mb-4">
              Er zijn nog geen chauffeurs geregistreerd in het systeem.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Bedrijf</TableHead>
                <TableHead>Adres</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">
                    {driver.display_name || (
                      <span className="text-muted-foreground italic">Geen naam</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {driver.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {driver.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {driver.phone}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {driver.company_name ? (
                      <div>
                        <p className="font-medium">{driver.company_name}</p>
                        {driver.btw_number && (
                          <p className="text-sm text-muted-foreground">{driver.btw_number}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {driver.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{driver.address}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDriver(driver)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Chauffeur verwijderen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je zeker dat je {driver.display_name || driver.email} wilt verwijderen? 
                              Deze actie kan niet ongedaan worden gemaakt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDriver(driver)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}