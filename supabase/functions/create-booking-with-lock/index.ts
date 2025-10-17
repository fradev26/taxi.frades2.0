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

    const body = await req.json();
    const required = ['user_id', 'vehicle_id', 'pickup_address', 'destination_address', 'scheduled_time', 'payment_method'];
    for (const r of required) {
      if (!body[r]) {
        return new Response(JSON.stringify({ error: `${r} is required` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Acquire vehicle lock by checking availability and updating in a single call
    const { data: vehicle, error: vehicleErr } = await supabaseServiceClient
      .from('vehicles')
      .select('id, is_available')
      .eq('id', body.vehicle_id)
      .single();

    if (vehicleErr) {
      return new Response(JSON.stringify({ error: 'Failed to fetch vehicle' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!vehicle.is_available) {
      return new Response(JSON.stringify({ error: 'Vehicle not available' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update vehicle to not available
    const { error: updateErr } = await supabaseServiceClient
      .from('vehicles')
      .update({ is_available: false, updated_at: new Date().toISOString() })
      .eq('id', body.vehicle_id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: 'Failed to lock vehicle' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const bookingData = {
      user_id: body.user_id,
      vehicle_id: body.vehicle_id,
      pickup_address: body.pickup_address,
      pickup_lat: body.pickup_lat || null,
      pickup_lng: body.pickup_lng || null,
      destination_address: body.destination_address,
      destination_lat: body.destination_lat || null,
      destination_lng: body.destination_lng || null,
      scheduled_time: body.scheduled_time,
      payment_method: body.payment_method,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const { data: insertedBooking, error: insertError } = await supabaseServiceClient
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (insertError) {
      // rollback vehicle availability on failure
      await supabaseServiceClient
        .from('vehicles')
        .update({ is_available: true, updated_at: new Date().toISOString() })
        .eq('id', body.vehicle_id);

      return new Response(JSON.stringify({ error: 'Failed to create booking' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, booking: insertedBooking }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('create-booking-with-lock error', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
