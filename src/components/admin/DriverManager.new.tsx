import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Driver {
  id: string;
  user_id: string;
  display_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  btw_number?: string;
  address?: string;
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

export function DriverManagerNew() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadDrivers = async () => {
      setIsLoading(true);
      try {
        const { data: drivers, error } = await supabase
          .from("chauffeurs")
          .select("*");
        if (error) {
          setDrivers([]);
          toast({
            title: "Fout bij laden chauffeurs",
            description: "Kon chauffeurs niet laden uit chauffeurs-tabel. Probeer het opnieuw.",
            variant: "destructive",
          });
        } else {
          setDrivers(drivers || []);
        }
      } catch (error) {
        setDrivers([]);
        toast({
          title: "Fout bij laden chauffeurs",
          description: error instanceof Error ? error.message : "Kon chauffeurs niet laden. Probeer het opnieuw.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadDrivers();
  }, [toast]);

  const handleAddDriver = async () => {
    const { error } = await supabase.from("chauffeurs").insert([formData]);
    if (error) {
      toast({ title: "Fout bij toevoegen chauffeur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chauffeur toegevoegd", variant: "success" });
      setIsDialogOpen(false);
      setFormData({ display_name: "", phone: "", company_name: "", btw_number: "", address: "", email: "", password: "", confirmPassword: "" });
      // Herlaad chauffeurs
      const { data } = await supabase.from("chauffeurs").select("*");
      setDrivers(data || []);
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver) return;
    const { error } = await supabase.from("chauffeurs").update(formData).eq("id", editingDriver.id);
    if (error) {
      toast({ title: "Fout bij bewerken chauffeur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chauffeur bijgewerkt", variant: "success" });
      setIsDialogOpen(false);
      setEditingDriver(null);
      setFormData({ display_name: "", phone: "", company_name: "", btw_number: "", address: "", email: "", password: "", confirmPassword: "" });
      const { data } = await supabase.from("chauffeurs").select("*");
      setDrivers(data || []);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    const { error } = await supabase.from("chauffeurs").delete().eq("id", id);
    if (error) {
      toast({ title: "Fout bij verwijderen chauffeur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chauffeur verwijderd", variant: "success" });
      const { data } = await supabase.from("chauffeurs").select("*");
      setDrivers(data || []);
    }
  };

  return (
    <Card className="shadow-lg border border-border">
      <CardHeader>
        <CardTitle>Chauffeursbeheer</CardTitle>
        <CardDescription>Beheer alle geregistreerde chauffeurs</CardDescription>
        <Button onClick={() => { setIsDialogOpen(true); setEditingDriver(null); }} className="mt-4">Nieuwe chauffeur toevoegen</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></span>
            <span className="text-muted-foreground">Laden...</span>
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Geen chauffeurs gevonden.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefoon</TableHead>
                  <TableHead>Bedrijf</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id} className="hover:bg-muted/50 transition">
                    <TableCell>
                      <span className="font-semibold">{driver.display_name || "-"}</span>
                      {driver.company_name && <Badge className="ml-2" variant="secondary">{driver.company_name}</Badge>}
                    </TableCell>
                    <TableCell>{driver.email || "-"}</TableCell>
                    <TableCell>{driver.phone || "-"}</TableCell>
                    <TableCell>{driver.company_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingDriver(driver); setFormData(driver); setIsDialogOpen(true); }}>Bewerken</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteDriver(driver.id)}>Verwijderen</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDriver ? "Chauffeur bewerken" : "Nieuwe chauffeur toevoegen"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); editingDriver ? handleEditDriver() : handleAddDriver(); }} className="space-y-4">
              <Input placeholder="Naam" value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} required />
              <Input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              <Input placeholder="Telefoon" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              <Input placeholder="Bedrijf" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
              <Input placeholder="BTW nummer" value={formData.btw_number} onChange={e => setFormData({ ...formData, btw_number: e.target.value })} />
              <Input placeholder="Adres" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuleren</Button>
                <Button type="submit">{editingDriver ? "Opslaan" : "Toevoegen"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
