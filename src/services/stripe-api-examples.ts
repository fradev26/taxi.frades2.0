// This file demonstrates the backend API endpoints you'll need to implement
// to fully integrate Stripe with your taxi booking application.

// Example Express.js/Node.js routes (adapt to your backend framework)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Create Payment Intent for one-time payments (credit top-up)
export const createPaymentIntent = async (req: any, res: any) => {
  try {
    const { amount, currency = 'eur' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        type: 'credit_topup',
        user_id: req.user?.id, // Get from your auth system
      },
    });

    res.send({
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
};

// Create Setup Intent for saving payment methods
export const createSetupIntent = async (req: any, res: any) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: req.user?.stripe_customer_id, // You'll need to create/store customer IDs
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    res.send({
      client_secret: setupIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
};

// Get saved payment methods
export const getPaymentMethods = async (req: any, res: any) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user?.stripe_customer_id,
      type: 'card',
    });

    res.send(paymentMethods);
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req: any, res: any) => {
  try {
    const { paymentMethodId } = req.params;

    await stripe.paymentMethods.detach(paymentMethodId);

    res.send({ success: true });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
};

// Process booking payment
export const processBookingPayment = async (req: any, res: any) => {
  try {
    const { bookingId, paymentMethodId, amount } = req.body;

    if (paymentMethodId === 'balance') {
      // Handle balance payment
      // Check user balance in your database
      // Deduct amount from balance
      // Update booking status
      
      res.send({
        success: true,
        paymentId: `balance_${Date.now()}`,
      });
    } else {
      // Handle card payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        payment_method: paymentMethodId,
        customer: req.user?.stripe_customer_id,
        confirm: true,
        metadata: {
          booking_id: bookingId,
          user_id: req.user?.id,
        },
      });

      if (paymentIntent.status === 'succeeded') {
        // Update booking in your database
        // Mark as paid
        
        res.send({
          success: true,
          paymentId: paymentIntent.id,
        });
      } else {
        res.status(400).send({
          success: false,
          error: 'Payment failed',
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
};

// Stripe webhook handler (very important for security)
export const handleStripeWebhook = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      
      // Update your database
      // Mark booking as paid
      // Send confirmation email/SMS
      break;
      
    case 'setup_intent.succeeded':
      const setupIntent = event.data.object;
      console.log('SetupIntent was successful!', setupIntent.id);
      
      // Payment method was saved successfully
      break;
      
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Routes setup example (Express.js)
/*
import express from 'express';
const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/create-setup-intent', createSetupIntent);
router.get('/payment-methods', getPaymentMethods);
router.delete('/payment-methods/:paymentMethodId', deletePaymentMethod);
router.post('/process-booking-payment', processBookingPayment);
router.post('/stripe-webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

export default router;
*/

// Supabase Edge Functions example (alternative to Express.js)
/*
// In supabase/functions/stripe-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-09-30.clover',
})

serve(async (req) => {
  const { method } = req
  const url = new URL(req.url)
  
  // Handle different endpoints based on URL path
  if (method === 'POST' && url.pathname === '/create-payment-intent') {
    // Implementation here
  }
  
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  )
})
*/