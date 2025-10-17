import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { createPaymentIntent } from '@/services/stripeService';
import { Euro } from 'lucide-react';

interface TopUpCreditProps {
  currentBalance: number;
  onSuccess: (amount: number) => void;
  onCancel: () => void;
}

const TOPUP_AMOUNTS = [10, 25, 50, 100, 200];

export const TopUpCredit: React.FC<TopUpCreditProps> = ({ 
  currentBalance, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAmount = () => {
    if (useCustomAmount && customAmount) {
      const amount = parseFloat(customAmount);
      return isNaN(amount) ? 0 : amount;
    }
    return selectedAmount;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    const amount = getAmount();
    
    if (amount < 5) {
      setError('Het minimum bedrag is €5');
      return;
    }

    if (amount > 1000) {
      setError('Het maximum bedrag is €1000');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent
      const { client_secret } = await createPaymentIntent(amount);

      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setError(error.message || 'Er is een fout opgetreden bij de betaling');
      } else if (paymentIntent?.status === 'succeeded') {
        toast({
          title: 'Krediet opgewaardeerd',
          description: `€${amount.toFixed(2)} is toegevoegd aan je wallet.`,
        });
        onSuccess(amount);
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
        <CardTitle className="flex items-center gap-2">
          <Euro className="w-5 h-5" />
          Krediet opwaarderen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Balance */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Huidige balans</p>
            <p className="text-2xl font-bold">€{currentBalance.toFixed(2)}</p>
          </div>

          {/* Amount Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Kies een bedrag</h3>
            
            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-2">
              {TOPUP_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount && !useCustomAmount ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setUseCustomAmount(false);
                    setCustomAmount('');
                  }}
                  className="text-sm"
                >
                  €{amount}
                </Button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <Button
                type="button"
                variant={useCustomAmount ? "default" : "outline"}
                onClick={() => setUseCustomAmount(!useCustomAmount)}
                className="w-full"
              >
                Ander bedrag
              </Button>
              
              {useCustomAmount && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">€</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    min="5"
                    max="1000"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* New Balance Preview */}
          <div className="p-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Nieuwe balans</p>
            <p className="text-xl font-semibold">€{(currentBalance + getAmount()).toFixed(2)}</p>
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <h3 className="font-medium">Betaalmethode</h3>
            <div className="p-4 border border-border rounded-lg">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!stripe || isLoading || getAmount() < 5}
              className="flex-1"
            >
              {isLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              €{getAmount().toFixed(2)} opwaarderen
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