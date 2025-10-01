/// <reference types="@supabase/supabase-js" />

// Extend SupabaseClient to allow custom RPC functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient<Database = any> {
    rpc(
      fn: 'get_bookings_with_details',
      params?: Record<string, any>,
      options?: any
    ): Promise<{ data: any; error: any }>;
    rpc(
      fn: 'get_profiles_with_emails',
      params?: Record<string, any>,
      options?: any
    ): Promise<{ data: any; error: any }>;
  }
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CalendarCheck, MapPin, Clock, Euro, User, Car, Phone, MessageCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/utils/formatting";
import { BookingForm } from "@/components/BookingForm";
import { Plus } from "lucide-react";

interface Booking {
  id: string;
  user_id?: string;
  company_id?: string;
  vehicle_id?: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  destination_address: string;
  destination_lat?: number;
  destination_lng?: number;
  waypoints?: any;
  scheduled_time: string;
  estimated_duration?: number;
  estimated_distance?: number;
  estimated_cost?: number;
  final_cost?: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  payment_id?: string;
  confirmation_sent: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  vehicle_name?: string;
  user_email?: string;
  company_name?: string;
}

const statusOptions = [
  { value: "pending", label: "In afwachting", color: "bg-yellow-400 text-yellow-900 shadow-md border-2 border-yellow-500" },
  { value: "confirmed", label: "Bevestigd", color: "bg-blue-500 text-white shadow-md border-2 border-blue-600" },
  { value: "in_progress", label: "Onderweg", color: "bg-green-500 text-white shadow-md border-2 border-green-600" },
  { value: "completed", label: "Voltooid", color: "bg-purple-500 text-white shadow-md border-2 border-purple-600" },
  { value: "cancelled", label: "Geannuleerd", color: "bg-red-500 text-white shadow-md border-2 border-red-600" },
];

const paymentStatusOptions = [
  { value: "pending", label: "In afwachting", color: "bg-orange-400 text-orange-900 shadow-md border-2 border-orange-500" },
  { value: "paid", label: "Betaald", color: "bg-emerald-500 text-white shadow-md border-2 border-emerald-600" },
  { value: "failed", label: "Mislukt", color: "bg-rose-500 text-white shadow-md border-2 border-rose-600" },
  { value: "refunded", label: "Terugbetaald", color: "bg-cyan-500 text-white shadow-md border-2 border-cyan-600" },
];

export function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load bookings from database
  const loadBookings = async () => {
    try {
      setIsLoading(true);

      // Use the optimized RPC function to get bookings with all related data
      const { data: bookingsData, error: bookingsError } = await supabase.rpc('get_bookings_with_details');

      if (bookingsError) throw bookingsError;

      // The RPC function returns data already formatted
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Fout bij laden boekingen",
        description: "Kon boekingen niet laden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: "De boekingsstatus is succesvol bijgewerkt.",
      });

      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon status niet bijwerken. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    const paymentMatch = paymentFilter === "all" || booking.payment_status === paymentFilter;
    return statusMatch && paymentMatch;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    const statusOption = paymentStatusOptions.find(option => option.value === status);
    return statusOption || { label: status, color: "bg-gray-100 text-gray-800" };
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
              <CalendarCheck className="w-5 h-5 text-primary" />
              Boekingsbeheer
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Beheer alle ritten en boekingen in het systeem
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Boeking toevoegen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nieuwe boeking toevoegen</DialogTitle>
                </DialogHeader>
                <BookingForm
                  onBookingSuccess={() => {
                    setIsBookingDialogOpen(false);
                    loadBookings();
                  }}
                  onBookingCancel={() => setIsBookingDialogOpen(false)}
                  showCancelButton={true}
                />
              </DialogContent>
            </Dialog>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter betaling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle betalingen</SelectItem>
                {paymentStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen boekingen</h3>
            <p className="text-muted-foreground mb-4">
              {bookings.length === 0 
                ? "Er zijn nog geen boekingen in het systeem."
                : "Geen boekingen gevonden met de huidige filters."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum & Tijd</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Voertuig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Betaling</TableHead>
                  <TableHead>Kosten</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const paymentBadge = getPaymentStatusBadge(booking.payment_status);
                  
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(booking.scheduled_time).toLocaleDateString('nl-NL')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.scheduled_time).toLocaleTimeString('nl-NL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium truncate max-w-32">
                              {booking.pickup_address}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-muted-foreground truncate max-w-32">
                              {booking.destination_address}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {booking.company_name || booking.user_email || "Onbekend"}
                            </p>
                            {booking.company_name && booking.user_email && (
                              <p className="text-xs text-muted-foreground">{booking.user_email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {booking.vehicle_name || "Niet toegewezen"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => updateBookingStatus(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={statusBadge.color}>
                              {statusBadge.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={paymentBadge.color}>
                          {paymentBadge.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {booking.final_cost 
                                ? formatCurrency(booking.final_cost)
                                : booking.estimated_cost 
                                  ? `~${formatCurrency(booking.estimated_cost)}`
                                  : "TBD"
                              }
                            </p>
                            {booking.estimated_duration && (
                              <p className="text-xs text-muted-foreground">
                                ~{booking.estimated_duration} min
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}