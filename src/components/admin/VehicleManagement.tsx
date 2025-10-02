import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, CreditCard as Edit, Trash2, MapPin } from "lucide-react";
import { typedSupabase } from "@/lib/supabase-typed";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { STANDARD_VEHICLES } from "@/config/vehicles";

interface Vehicle {
  id: string;
  name: string | null;
  type: string | null;
  capacity: number | null;
  hourly_rate: number | null;
  per_km_rate: number | null;
  available: boolean | null;
  current_location?: string;
  current_lat?: number;
  current_lng?: number;
  created_at: string | null;
  updated_at: string | null;
}

interface VehicleFormData {
  name: string;
  type: string;
  capacity: string;
  hourly_rate: string;
  per_km_rate: string;
  available: boolean;
  current_location: string;
}

// Use standardized vehicle types from config
const vehicleTypes = STANDARD_VEHICLES.map(vehicle => ({
  value: vehicle.id,
  label: vehicle.name
}));

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    name: "",
    type: "",
    capacity: "",
    hourly_rate: "",
    per_km_rate: "",
    available: true,
    current_location: "",
  });
  const { toast } = useToast();

  // Load vehicles from database
  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: "Fout bij laden voertuigen",
        description: "Kon voertuigen niet laden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      capacity: "",
      hourly_rate: "",
      per_km_rate: "",
      available: true,
      current_location: "",
    });
    setEditingVehicle(null);
  };

  // Open dialog for adding new vehicle
  const handleAddVehicle = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for editing vehicle
  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
        name: vehicle.name || "",
        type: vehicle.type || "",
        capacity: vehicle.capacity?.toString() || "",
        hourly_rate: vehicle.hourly_rate?.toString() || "",
        per_km_rate: vehicle.per_km_rate?.toString() || "",
        available: vehicle.available ?? true,
      current_location: vehicle.current_location || "",
    });
    setIsDialogOpen(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse numeric values with proper fallbacks
      const capacity = parseInt(formData.capacity) || null;
      const hourly_rate = parseFloat(formData.hourly_rate) || null;
      const per_km_rate = parseFloat(formData.per_km_rate) || null;

      const vehicleData = {
        name: formData.name || null,
        type: formData.type || null,
        capacity,
        hourly_rate,
        per_km_rate,
        available: formData.available,
        current_location: formData.current_location || null,
        current_lat: null,
        current_lng: null,
        updated_at: new Date().toISOString(),
      };

      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) throw error;

        toast({
          title: "Voertuig bijgewerkt",
          description: `${formData.name} is succesvol bijgewerkt.`,
        });
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert([vehicleData]);

        if (error) throw error;

        toast({
          title: "Voertuig toegevoegd",
          description: `${formData.name} is succesvol toegevoegd aan de vloot.`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Kon voertuig niet opslaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicle.id);

      if (error) throw error;

      toast({
        title: "Voertuig verwijderd",
        description: `${vehicle.name || 'Het voertuig'} is succesvol verwijderd uit de vloot.`,
      });

      loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon voertuig niet verwijderen. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  // Toggle vehicle availability
  const toggleAvailability = async (vehicle: Vehicle) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          available: !vehicle.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicle.id);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: `${vehicle.name || 'Voertuig'} is nu ${newAvailability ? 'beschikbaar' : 'niet beschikbaar'}.`,
      });

      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle availability:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon status niet bijwerken. Probeer het opnieuw.",
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
              <Car className="w-5 h-5 text-primary" />
              Voertuigbeheer
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Beheer de beschikbare voertuigen in je vloot
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddVehicle} className="gap-2">
                <Plus className="w-4 h-4" />
                Voeg voertuig toe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Voertuig bewerken" : "Nieuw voertuig toevoegen"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="BMW 5 Serie"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer voertuigtype" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capaciteit</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Uurtarief (€)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      placeholder="45.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="per_km_rate">Prijs per km (€)</Label>
                  <Input
                    id="per_km_rate"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.per_km_rate}
                    onChange={(e) => setFormData({ ...formData, per_km_rate: e.target.value })}
                    placeholder="2.50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_location">Huidige locatie</Label>
                  <Input
                    id="current_location"
                    value={formData.current_location}
                    onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                    placeholder="Amsterdam Centraal"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                  />
                  <Label htmlFor="available">Beschikbaar</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {editingVehicle ? "Bijwerken" : "Toevoegen"}
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
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen voertuigen</h3>
            <p className="text-muted-foreground mb-4">
              Je hebt nog geen voertuigen toegevoegd aan je vloot.
            </p>
            <Button onClick={handleAddVehicle} className="gap-2">
              <Plus className="w-4 h-4" />
              Voeg je eerste voertuig toe
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capaciteit</TableHead>
                <TableHead>Uurtarief</TableHead>
                <TableHead>Per km</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.name || 'Onbekend'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {vehicleTypes.find(t => t.value === vehicle.type)?.label || vehicle.type || 'Onbekend'}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.capacity || 0} personen</TableCell>
                  <TableCell>€{(vehicle.hourly_rate || 0).toFixed(2)}</TableCell>
                  <TableCell>€{(vehicle.per_km_rate || 0).toFixed(3)}</TableCell>
                  <TableCell>
                    {vehicle.current_location ? (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {vehicle.current_location}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Niet ingesteld</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={vehicle.available || false}
                        onCheckedChange={() => toggleAvailability(vehicle)}
                      />
                      <Badge variant={vehicle.available ? "default" : "secondary"}>
                        {vehicle.available ? "Beschikbaar" : "Niet beschikbaar"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
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
                            <AlertDialogTitle>Voertuig verwijderen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je zeker dat je {vehicle.name || 'dit voertuig'} wilt verwijderen? 
                              Deze actie kan niet ongedaan worden gemaakt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteVehicle(vehicle)}
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