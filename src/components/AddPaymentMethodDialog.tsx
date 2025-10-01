import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPaymentMethodDialog({ open, onOpenChange }: AddPaymentMethodDialogProps) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof getStripe> | null>(null);
  const { toast } = useToast();
  const stripeConfigured = isStripeConfigured();

  useEffect(() => {
    if (stripeConfigured) {
      setStripePromise(getStripe());
    }
  }, [stripeConfigured]);

  const handleAddCard = () => {
    if (!stripeConfigured) {
      toast({
        title: 'Stripe niet geconfigureerd',
        description: 'Contacteer de beheerder om betalingen in te schakelen.',
        variant: 'destructive',
      });
      return;
    }

    // This would open the Stripe payment method form
    toast({
      title: 'Functie in ontwikkeling',
      description: 'Verbind deze functie met uw backend API om betaalmethoden toe te voegen.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Betaalmethode toevoegen
          </DialogTitle>
          <DialogDescription>
            Voeg een nieuwe betaalmethode toe aan je wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!stripeConfigured ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stripe niet geconfigureerd</AlertTitle>
              <AlertDescription>
                De Stripe API key is niet ingesteld. Voeg VITE_STRIPE_PUBLISHABLE_KEY toe aan je .env bestand
                om betalingsfuncties in te schakelen.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Backend vereist</AlertTitle>
              <AlertDescription>
                Deze functie vereist een backend API voor het veilig verwerken van betalingen.
                Implementeer eerst de backend endpoints voor payment intents en setup intents.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={handleAddCard}
              disabled={!stripeConfigured}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => {
                toast({
                  title: 'Functie in ontwikkeling',
                  description: 'Bancontact integratie komt binnenkort.',
                });
              }}
              disabled={!stripeConfigured}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Bancontact</p>
                  <p className="text-sm text-muted-foreground">Belgian payment method</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
