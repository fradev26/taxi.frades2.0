import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
        if (error) {
          console.error('Error loading booking:', error);
          setBooking(null);
        } else {
          setBooking(data);
        }
      } catch (err) {
        console.error('Error fetching booking', err);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Boeking niet gevonden</CardTitle>
            </CardHeader>
            <CardContent>
              <p>De gevraagde boeking kon niet worden gevonden.</p>
              <div className="mt-4">
                <Button onClick={() => navigate(ROUTES.TRIPS)}>Terug naar Activiteit</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Boeking details</h1>

          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{booking.status}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Ophaallocatie</p>
                  <p className="font-medium">{booking.pickup_address}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Bestemming</p>
                  <p className="font-medium">{booking.destination_address}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Geboekt voor</p>
                  <p className="font-medium">{new Date(booking.scheduled_time).toLocaleString('nl-NL')}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Betaling</p>
                  <p className="font-medium">{booking.payment_status} — {booking.payment_method || 'n.v.t.'}</p>
                </div>

                {booking.guest_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gast</p>
                    <p className="font-medium">{booking.guest_name} • {booking.guest_email} • {booking.guest_phone}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="taxi-outline" onClick={() => navigate(-1)}>Terug</Button>
                  {/* Show claim button when booking has a guest_token and is not yet attached */}
                  {booking?.guest_token && !booking?.user_id && (
                    user ? (
                      <Button
                        variant="taxi-primary"
                        onClick={async () => {
                          setClaiming(true);
                          try {
                            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                            const res = await fetch(`${supabaseUrl}/functions/v1/claim-guest-booking`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session?.access_token}`,
                              },
                              body: JSON.stringify({ token: booking.guest_token }),
                            });

                            const data = await res.json().catch(() => ({}));
                            if (res.ok) {
                              const payload = await res.json().catch(() => ({}));
                              toast({ title: 'Boeking gekoppeld', description: 'Je boeking is nu gekoppeld aan je account.' });
                              // Refresh booking
                              const { data: refreshed } = await supabase.from('bookings').select('*').eq('id', booking.id).single();
                              setBooking(refreshed || booking);
                              // Invalidate trips cache so Trips page updates
                              queryClient.invalidateQueries({ queryKey: ['user-trips'] });
                              // Disable claim button by ensuring booking.user_id exists now
                            } else {
                              toast({ title: 'Koppelen mislukt', description: data?.error || 'Kon boeking niet koppelen', variant: 'destructive' });
                            }
                          } catch (err) {
                            console.error('Claim error', err);
                            toast({ title: 'Koppelen mislukt', description: 'Er is een fout opgetreden', variant: 'destructive' });
                          } finally {
                            setClaiming(false);
                          }
                        }}
                        disabled={claiming}
                      >
                        {claiming ? 'Bezig...' : 'Boeking koppelen'}
                      </Button>
                    ) : (
                      <Button variant="taxi-primary" onClick={() => window.location.href = `/login?postPayment=true&guestBooking=true&token=${booking.guest_token}`}>Inloggen en claimen</Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
