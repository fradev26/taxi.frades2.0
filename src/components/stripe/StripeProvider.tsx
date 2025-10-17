import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/services/stripeService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const stripePromise = getStripe();

  if (!stripePromise) {
    console.warn('Stripe is not configured. Payment features will be disabled.');
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

// Hook to check if Stripe is available
export const useStripeAvailable = () => {
  return getStripe() !== null;
};