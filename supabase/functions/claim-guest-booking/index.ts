import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from Authorization header if present
    const authHeader = req.headers.get('Authorization') || '';
    let userId: string | null = null;

    if (authHeader.startsWith('Bearer ')) {
      // Attempt to parse user via supabase auth (best-effort)
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data } = await supabaseClient.auth.getUser();
      userId = data?.user?.id || null;
    }

    const body = await req.json();
    const token = body?.token || null;

    if (!token) {
      return new Response(JSON.stringify({ error: 'token is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Find booking by token
    const { data: booking, error: bookingErr } = await supabaseServiceClient
      .from('bookings')
      .select('*')
      .eq('guest_token', token)
      .single();

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // If there's an authenticated user, claim the booking
    if (userId) {
      const updates: any = { user_id: userId, updated_at: new Date().toISOString() };
      // Only change status if it's payment_pending and not yet paid
      if (booking.payment_status !== 'paid') {
        updates.status = 'payment_pending_claimed';
      }

      const { data: updated, error: updateErr } = await supabaseServiceClient
        .from('bookings')
        .update(updates)
        .eq('id', booking.id)
        .select()
        .single();

      if (updateErr) {
        return new Response(JSON.stringify({ error: 'Failed to claim booking' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true, booking: updated }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // If no authenticated user, return booking info but do not claim
    return new Response(JSON.stringify({ success: true, booking }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('claim-guest-booking error', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
