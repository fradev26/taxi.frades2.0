import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Store the stripe promise to avoid recreating it
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe instance. Returns null if the publishable key is not configured.
 * This allows the app to run without Stripe configured.
 */
export const getStripe = () => {
  // If no key is configured, return null
  if (!stripePublishableKey || stripePublishableKey === 'your-stripe-publishable-key-here') {
    console.warn('Stripe publishable key not configured. Payment features will be disabled.');
    return Promise.resolve(null);
  }

  // Initialize stripe only once
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }

  return stripePromise;
};

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = () => {
  return !!(stripePublishableKey && stripePublishableKey !== 'your-stripe-publishable-key-here');
};

/**
 * Create a payment intent for adding funds to wallet
 * This would typically call your backend API
 */
export const createPaymentIntent = async (amount: number, currency: string = 'eur') => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  // TODO: This should call your backend API to create a payment intent
  // For now, we'll just return a placeholder
  // In production, you would do something like:
  // const response = await fetch('/api/payment-intent', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, currency })
  // });
  // return response.json();

  console.log(`Creating payment intent for ${amount} ${currency}`);
  throw new Error('Backend API not implemented yet. Connect this to your payment backend.');
};

/**
 * Create a setup intent for adding payment methods
 * This would typically call your backend API
 */
export const createSetupIntent = async () => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  // TODO: This should call your backend API to create a setup intent
  // For now, we'll just return a placeholder
  console.log('Creating setup intent for adding payment method');
  throw new Error('Backend API not implemented yet. Connect this to your payment backend.');
};
