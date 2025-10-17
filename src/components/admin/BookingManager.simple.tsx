import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DateTimeSelector } from "@/components/ui/datetime-selector";
import { Button } from "@/components/ui/button";

export function BookingManagerSimple({ bookings }: { bookings: any[] }) {
  // Status and payment status options
  const statusOptions = [
    { value: "pending", label: "In afwachting" },
    { value: "confirmed", label: "Bevestigd" },
    { value: "completed", label: "Voltooid" },
    { value: "cancelled", label: "Geannuleerd" }
  ];
  const paymentStatusOptions = [
    { value: "unpaid", label: "Niet betaald" },
    { value: "paid", label: "Betaald" },
    { value: "refunded", label: "Terugbetaald" }
  ];

  // Update booking status/payment status
  async function updateBookingField(bookingId: string, field: "status" | "payment_status", value: string) {
    await (await import("@/integrations/supabase/client")).supabase
      .from("bookings")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", bookingId);
    // Optionally: refetch bookings or show toast
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_id: "",
    booking_type: "rit",
    date: "",
    time: "",
    pickup_address: "",
    destination: ""
  });
  // Google Maps/Places functionaliteit verwijderd voor robuustheid

  // Dummy voertuigenlijst (vervang door echte data)
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

    // Load vehicles from beheer (VehicleManagement)
    async function loadVehicles() {
      setIsLoadingVehicles(true);
      try {
        const { data, error } = await (await import("@/integrations/supabase/client")).supabase
          .from("vehicles")
          .select("*")
          .eq("available", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setVehicles(data || []);
      } catch (err) {
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    }

    // Load vehicles on mount
    React.useEffect(() => {
      loadVehicles();
    }, []);

    // Robust overlap check
    function isVehicleAvailable(vehicle_id: string, scheduled_time: string) {
      // Check for overlap with existing bookings for this vehicle
      const requestedTime = new Date(scheduled_time).getTime();
      // 1 hour window for 'uur', 15 min for 'rit'
      const windowMs = formData.booking_type === "uur" ? 60 * 60 * 1000 : 15 * 60 * 1000;
      return !bookings.some(b =>
        b.vehicle_id === vehicle_id &&
        Math.abs(new Date(b.scheduled_time).getTime() - requestedTime) < windowMs
      );
    }

  function handleAddBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!isVehicleAvailable(formData.vehicle_id, formData.scheduled_time)) {
      alert("Deze wagen is niet beschikbaar op het gekozen tijdstip.");
      return;
    }
    // Hier zou je de boeking opslaan in de database
    setIsDialogOpen(false);
    setFormData({ customer_name: "", vehicle_id: "", booking_type: "rit", scheduled_time: "", pickup_address: "", destination: "" });
  }

  return (
    <Card className="shadow border border-border bg-background">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Boekingen overzicht</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} variant="outline">Boeking toevoegen</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full text-sm">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>ID</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Wagen</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Datum/tijd</TableHead>
                <TableHead>Ophaaladres</TableHead>
                <TableHead>Bestemming</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Geen boekingen gevonden.</TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id} className={`hover:bg-muted/50 transition ${booking.booking_type === "uur" ? "border-l-4 border-primary" : ""}`}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.customer_name}</TableCell>
                    <TableCell>{booking.vehicle_name}</TableCell>
                    <TableCell>{booking.booking_type === "uur" ? <span className="px-2 py-1 rounded bg-primary text-primary-foreground">Per uur</span> : <span className="px-2 py-1 rounded bg-muted">Per rit</span>}</TableCell>
                    <TableCell>{booking.scheduled_time}</TableCell>
                    <TableCell>{booking.pickup_address}</TableCell>
                    <TableCell>{booking.destination}</TableCell>
                    <TableCell>
                      <select
                        value={booking.status}
                        onChange={e => updateBookingField(booking.id, "status", e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        value={booking.payment_status}
                        onChange={e => updateBookingField(booking.id, "payment_status", e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {paymentStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nieuwe boeking toevoegen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBooking} className="space-y-4">
              <Input placeholder="Klantnaam" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} required />

              <Input placeholder="Ophaaladres" value={formData.pickup_address} onChange={e => setFormData({ ...formData, pickup_address: e.target.value })} required />

              <Input placeholder="Bestemming" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} required />
              <select value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })} className="border rounded px-2 py-1 w-full" required>
                  <option value="">Selecteer wagen</option>
                  {isLoadingVehicles ? (
                    <option disabled>Voertuigen laden...</option>
                  ) : vehicles.length === 0 ? (
                    <option disabled>Geen voertuigen beschikbaar</option>
                  ) : vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
              </select>
              <select value={formData.booking_type} onChange={e => setFormData({ ...formData, booking_type: e.target.value })} className="border rounded px-2 py-1 w-full">
                <option value="rit">Per rit</option>
                <option value="uur">Per uur</option>
              </select>
              <Input type="datetime-local" value={formData.scheduled_time} onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })} required />
              <DateTimeSelector
                selectedDate={formData.date ? new Date(formData.date) : null}
                selectedTime={formData.time}
                onDateChange={date => setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' })}
                onTimeChange={time => setFormData({ ...formData, time })}
                minDate={new Date()}
                showQuickActions={true}
                timeStep={15}
                className="md:max-w-md"
              />
              <Input placeholder="Ophaaladres" value={formData.pickup_address} onChange={e => setFormData({ ...formData, pickup_address: e.target.value })} required />
              <Input placeholder="Bestemming" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} required />
              <Button type="submit">Toevoegen</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
