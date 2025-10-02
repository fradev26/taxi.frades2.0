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

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !endpointSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing signature or endpoint secret' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.log(`Webhook signature verification failed.`, (err as Error).message)
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${(err as Error).message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Received webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)

        if (paymentIntent.metadata.type === 'credit_topup') {
          // Handle credit top-up
          const userId = paymentIntent.metadata.user_id
          const amount = paymentIntent.amount / 100 // Convert from cents

          // Update user's wallet balance
          const { data: profile } = await supabaseServiceClient
            .from('profiles')
            .select('wallet_balance')
            .eq('id', userId)
            .single()

          const newBalance = (profile?.wallet_balance || 0) + amount
          
          await supabaseServiceClient
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId)

          // Create transaction record
          await supabaseServiceClient
            .from('transactions')
            .insert({
              user_id: userId,
              type: 'topup',
              amount: amount,
              description: 'Wallet top-up',
              payment_method: 'stripe',
              stripe_payment_intent_id: paymentIntent.id
            })

          console.log(`Updated wallet balance for user ${userId}: +€${amount}`)
        }
        break
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent
        console.log('SetupIntent succeeded:', setupIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})