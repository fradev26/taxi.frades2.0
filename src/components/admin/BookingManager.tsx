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

import { useState } from "react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CalendarCheck, MapPin, Clock, Euro, User, Car, Phone, MessageCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/utils/formatting";
import { BookingForm } from "@/components/BookingForm";
import { Plus } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  // Use optimized React Query hooks
  const { 
    data: bookings = [], 
    isLoading, 
    error: bookingsError,
    refetch: refetchBookings 
  } = useBookings({ 
    status: statusFilter, 
    paymentStatus: paymentFilter 
  });

  const updateBookingMutation = useUpdateBookingStatus();
  const { toast } = useToast();

  // Handle loading error
  if (bookingsError) {
    toast({
      title: "Fout bij laden boekingen",
      description: "Kon boekingen niet laden. Probeer het opnieuw.",
      variant: "destructive",
    });
  }

  // Update booking status using optimized mutation
  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    updateBookingMutation.mutate({ bookingId, status: newStatus });
  };

  // Bookings are already filtered by React Query
  const totalPages = Math.ceil(bookings.length / perPage);
  const paginatedBookings = bookings.slice((page - 1) * perPage, page * perPage);

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
    <Card className="shadow border border-border bg-background">
      <CardHeader>
        <CardTitle>Boekingen overzicht</CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <label className="text-muted-foreground text-sm">Aantal per pagina:</label>
          <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Datum & Tijd</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Voertuig</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Betaling</TableHead>
                <TableHead>Kost</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking: Booking) => {
                const statusBadge = getStatusBadge(booking.status);
                const paymentBadge = getPaymentStatusBadge(booking.payment_status);
                return (
                  <TableRow key={booking.id} className="hover:bg-muted/50 transition">
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
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${statusBadge.color}`}>{statusBadge.label}</span>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <Button 
                          asChild 
                          variant="outline" 
                          onClick={() => {
                            // Open dialog to view booking details
                            setIsBookingDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Bekijken
                        </Button>
                        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Bekijk
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Boeking details</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Klant</label>
                                <p className="text-sm">
                                  {booking.company_name || booking.user_email || "Onbekend"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Badge className={statusBadge.color}>
                                  {statusBadge.label}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Datum & Tijd</label>
                                <p className="text-sm">
                                  {formatDateTime(booking.scheduled_time)}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Ophaaladres</label>
                                <p className="text-sm">
                                  {booking.pickup_address}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Bestemmingsadres</label>
                                <p className="text-sm">
                                  {booking.destination_address}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Voertuig</label>
                                <p className="text-sm">
                                  {booking.vehicle_name || "Niet toegewezen"}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Kost</label>
                                <p className="text-sm">
                                  {booking.final_cost 
                                    ? formatCurrency(booking.final_cost)
                                    : booking.estimated_cost 
                                      ? `~${formatCurrency(booking.estimated_cost)}`
                                      : "TBD"
                                  }
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Betaling</label>
                                <Badge className={paymentBadge.color}>
                                  {paymentBadge.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button 
                                variant="primary" 
                                onClick={() => {
                                  // TODO: Implement edit booking functionality
                                }}
                              >
                                Bewerk boeking
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            {/* Pagination info */}
            <p className="text-sm text-muted-foreground">
              Pagina {page} van {totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
            >
              Vorige
            </Button>
            <Button 
              variant="outline" 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
            >
              Volgende
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
