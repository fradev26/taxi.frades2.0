import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

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

    // basic validation
    const required = ['pickup_address', 'destination_address', 'scheduled_time', 'payment_method'];
    for (const r of required) {
      if (!body[r]) {
        return new Response(JSON.stringify({ error: `${r} is required` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const token = uuidv4();

    const insertData = {
      vehicle_id: body.vehicle_id || null,
      pickup_address: body.pickup_address,
      pickup_lat: body.pickup_lat || null,
      pickup_lng: body.pickup_lng || null,
      destination_address: body.destination_address,
      destination_lat: body.destination_lat || null,
      destination_lng: body.destination_lng || null,
      scheduled_time: body.scheduled_time,
      payment_method: body.payment_method,
      status: 'payment_pending',
      guest_name: body.guest_name || null,
      guest_email: body.guest_email || null,
      guest_phone: body.guest_phone || null,
      guest_token: token,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseServiceClient
      .from('bookings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert guest booking', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, booking: data, token }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('create-guest-booking error', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
