import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { processBookingPayment, getPaymentMethods } from '@/services/stripeService';
import { CreditCard, Wallet } from 'lucide-react';

interface BookingPaymentProps {
  bookingData: {
    id: string;
    from: string;
    to: string;
    amount: number;
    vehicle?: string;
  };
  userBalance: number;
  onPaymentSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export const BookingPayment: React.FC<BookingPaymentProps> = ({
  bookingData,
  userBalance,
  onPaymentSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card' | 'saved'>('balance');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadSavedPaymentMethods();
  }, []);

  const loadSavedPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setSavedPaymentMethods(methods.data || []);
      if (methods.data?.length > 0) {
        setSelectedSavedMethod(methods.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'balance') {
        if (userBalance < bookingData.amount) {
          setError('Onvoldoende saldo. Kies een andere betaalwijze of waardeer je saldo op.');
          setIsLoading(false);
          return;
        }

        // Process payment with balance
        const result = await processBookingPayment(
          bookingData.id, 
          'balance', 
          bookingData.amount
        );
        
        if (result.success) {
          toast({
            title: 'Betaling geslaagd',
            description: 'Je rit is betaald en bevestigd.',
          });
          onPaymentSuccess(result.paymentId);
        } else {
          setError(result.error || 'Betaling mislukt');
        }
      } else if (paymentMethod === 'saved' && selectedSavedMethod) {
        // Process payment with saved payment method
        const result = await processBookingPayment(
          bookingData.id,
          selectedSavedMethod,
          bookingData.amount
        );

        if (result.success) {
          toast({
            title: 'Betaling geslaagd',
            description: 'Je rit is betaald en bevestigd.',
          });
          onPaymentSuccess(result.paymentId);
        } else {
          setError(result.error || 'Betaling mislukt');
        }
      } else if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          setError('Stripe is niet geladen. Probeer de pagina te vernieuwen.');
          setIsLoading(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          setError('Kaartgegevens niet gevonden');
          setIsLoading(false);
          return;
        }

        // Create payment method and process payment
        const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (pmError) {
          setError(pmError.message || 'Fout bij het verwerken van kaartgegevens');
          setIsLoading(false);
          return;
        }

        const result = await processBookingPayment(
          bookingData.id,
          pm.id,
          bookingData.amount
        );

        if (result.success) {
          toast({
            title: 'Betaling geslaagd',
            description: 'Je rit is betaald en bevestigd.',
          });
          onPaymentSuccess(result.paymentId);
        } else {
          setError(result.error || 'Betaling mislukt');
        }
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

  const canPayWithBalance = userBalance >= bookingData.amount;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Betaling voor je rit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Van:</span>
            <span className="text-sm font-medium">{bookingData.from}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Naar:</span>
            <span className="text-sm font-medium">{bookingData.to}</span>
          </div>
          {bookingData.vehicle && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Voertuig:</span>
              <span className="text-sm font-medium">{bookingData.vehicle}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Totaal:</span>
            <span className="font-bold">€{bookingData.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="font-medium">Kies betaalwijze</h3>
          
          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            {/* Balance Payment */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="balance" 
                id="balance" 
                disabled={!canPayWithBalance}
              />
              <Label 
                htmlFor="balance" 
                className={`flex items-center gap-2 cursor-pointer flex-1 ${
                  !canPayWithBalance ? 'text-muted-foreground' : ''
                }`}
              >
                <Wallet className="w-4 h-4" />
                <div className="flex-1">
                  <div>Wallet saldo</div>
                  <div className="text-xs text-muted-foreground">
                    Beschikbaar: €{userBalance.toFixed(2)}
                    {!canPayWithBalance && ' (onvoldoende saldo)'}
                  </div>
                </div>
              </Label>
            </div>

            {/* Saved Payment Methods */}
            {savedPaymentMethods.length > 0 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saved" id="saved" />
                <Label htmlFor="saved" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-4 h-4" />
                  <div className="flex-1">
                    <div>Opgeslagen kaart</div>
                    <select
                      value={selectedSavedMethod}
                      onChange={(e) => setSelectedSavedMethod(e.target.value)}
                      className="text-xs bg-transparent"
                      disabled={paymentMethod !== 'saved'}
                    >
                      {savedPaymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                        </option>
                      ))}
                    </select>
                  </div>
                </Label>
              </div>
            )}

            {/* New Card */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="w-4 h-4" />
                Nieuwe kaart
              </Label>
            </div>
          </RadioGroup>

          {/* Card Element for new card */}
          {paymentMethod === 'card' && (
            <div className="p-4 border border-border rounded-lg">
              <CardElement options={cardElementOptions} />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handlePayment}
            disabled={isLoading || !stripe}
            className="flex-1"
          >
            {isLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
            €{bookingData.amount.toFixed(2)} betalen
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuleren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};