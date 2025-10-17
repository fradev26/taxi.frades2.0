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

    // Parse request body
    const body = await req.json()
    const bookingIdFromBody = body?.bookingId || null
    const guestToken = body?.guest_token || null
    const paymentMethodId = body?.paymentMethodId || null
    const amount = body?.amount || null

    if ((!bookingIdFromBody && !guestToken) || !paymentMethodId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    // Determine booking: either by provided bookingId or by guest_token
    let bookingId = bookingIdFromBody
    let bookingRecord: any = null

    if (!bookingId && guestToken) {
      const { data: booking, error: bookingErr } = await supabaseServiceClient
        .from('bookings')
        .select('*')
        .eq('guest_token', guestToken)
        .single()

      if (bookingErr || !booking) {
        return new Response(
          JSON.stringify({ error: 'Booking not found for provided guest token' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      bookingRecord = booking
      bookingId = booking.id
    }

    // Try to get the authenticated user if present. For guest_token flows this may be null.
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Get user profile for balance and customer ID when we have a user
    let profile: any = null
    if (user) {
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('wallet_balance, stripe_customer_id')
        .eq('id', user.id)
        .single()

      profile = profileData
    }

    if (paymentMethodId === 'balance') {
      // Wallet payments require an authenticated user
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Wallet payments require authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

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
      // Card payment handling for both authenticated users and guest bookings
      // If user has a stripe_customer_id, prefer charging the customer; otherwise create a standalone PaymentIntent
      let paymentIntent

      if (profile?.stripe_customer_id) {
        paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'eur',
          customer: profile.stripe_customer_id,
          payment_method: paymentMethodId,
          confirm: true,
          metadata: {
            booking_id: bookingId,
            user_id: user?.id || null,
            guest_token: guestToken || null,
          },
        })
      } else {
        // Guest payment flow: create a PaymentIntent without a customer. Set receipt_email if available.
        const receiptEmail = bookingRecord?.guest_email || null
        paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'eur',
          payment_method: paymentMethodId,
          confirm: true,
          receipt_email: receiptEmail || undefined,
          metadata: {
            booking_id: bookingId,
            user_id: user?.id || null,
            guest_token: guestToken || null,
          },
        })
      }

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

        // Create transaction record (user_id may be null for guest bookings)
        await supabaseServiceClient
          .from('transactions')
          .insert({
            user_id: bookingRecord?.user_id || user?.id || null,
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