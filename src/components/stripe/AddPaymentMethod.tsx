import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { createSetupIntent } from '@/services/stripeService';

interface AddPaymentMethodProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create setup intent for saving the payment method
      const { client_secret } = await createSetupIntent();

      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, setupIntent } = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setError(error.message || 'Er is een fout opgetreden');
      } else if (setupIntent?.status === 'succeeded') {
        toast({
          title: 'Betaalmethode toegevoegd',
          description: 'Je nieuwe betaalmethode is succesvol opgeslagen.',
        });
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'hsl(var(--foreground))',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieuwe betaalmethode toevoegen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1"
            >
              {isLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              Opslaan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuleren
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};