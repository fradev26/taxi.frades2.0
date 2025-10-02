import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { bookingId, paymentMethodId, amount } = await req.json()

    if (!bookingId || !paymentMethodId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user profile for balance and customer ID
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('wallet_balance, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (paymentMethodId === 'balance') {
      // Handle wallet balance payment
      if (!profile || profile.wallet_balance < amount / 100) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Insufficient wallet balance' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Deduct from wallet balance
      const newBalance = profile.wallet_balance - (amount / 100)
      await supabaseServiceClient
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id)

      // Update booking status
      await supabaseServiceClient
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: 'wallet_balance',
          amount_paid: amount / 100
        })
        .eq('id', bookingId)

      // Create transaction record
      await supabaseServiceClient
        .from('transactions')
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          type: 'payment',
          amount: -(amount / 100),
          description: 'Booking payment',
          payment_method: 'wallet_balance'
        })

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: `wallet_${Date.now()}`,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Handle card payment
      if (!profile?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No payment methods available' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        customer: profile.stripe_customer_id,
        payment_method: paymentMethodId,
        confirm: true,
        metadata: {
          booking_id: bookingId,
          user_id: user.id,
        },
      })

      if (paymentIntent.status === 'succeeded') {
        // Update booking status
        await supabaseServiceClient
          .from('bookings')
          .update({ 
            status: 'confirmed',
            payment_status: 'paid',
            payment_method: 'stripe',
            stripe_payment_intent_id: paymentIntent.id,
            amount_paid: amount / 100
          })
          .eq('id', bookingId)

        // Create transaction record
        await supabaseServiceClient
          .from('transactions')
          .insert({
            user_id: user.id,
            booking_id: bookingId,
            type: 'payment',
            amount: -(amount / 100),
            description: 'Booking payment',
            payment_method: 'stripe',
            stripe_payment_intent_id: paymentIntent.id
          })

        return new Response(
          JSON.stringify({
            success: true,
            paymentId: paymentIntent.id,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Payment failed' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

  } catch (error) {
    console.error('Error processing booking payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})