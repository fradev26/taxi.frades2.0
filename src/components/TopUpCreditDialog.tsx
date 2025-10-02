import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isStripeConfigured } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Euro } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TopUpCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const presetAmounts = [10, 25, 50, 100];

export function TopUpCreditDialog({ open, onOpenChange }: TopUpCreditDialogProps) {
  const [amount, setAmount] = useState<string>('25');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const stripeConfigured = isStripeConfigured();

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleTopUp = async () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Ongeldig bedrag',
        description: 'Voer een geldig bedrag in.',
        variant: 'destructive',
      });
      return;
    }

    if (!stripeConfigured) {
      toast({
        title: 'Stripe niet geconfigureerd',
        description: 'Contacteer de beheerder om betalingen in te schakelen.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // This would create a payment intent and open Stripe checkout
      // For now, just show a message
      toast({
        title: 'Functie in ontwikkeling',
        description: `Verbind deze functie met uw backend API om €${numAmount.toFixed(2)} op te waarderen.`,
      });
      
      // In production, you would:
      // 1. Call your backend to create a payment intent
      // 2. Redirect to Stripe Checkout or use Stripe Elements
      // 3. Handle the payment confirmation
      // 4. Update the user's balance
      
    } catch (error) {
      toast({
        title: 'Fout bij opwaarderen',
        description: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Krediet opwaarderen
          </DialogTitle>
          <DialogDescription>
            Voeg krediet toe aan je wallet om ritten te betalen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!stripeConfigured && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stripe niet geconfigureerd</AlertTitle>
              <AlertDescription>
                De Stripe API key is niet ingesteld. Voeg VITE_STRIPE_PUBLISHABLE_KEY toe aan je .env bestand
                om betalingsfuncties in te schakelen.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Bedrag</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Snelle keuzes</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset.toString() ? 'default' : 'outline'}
                  onClick={() => handlePresetAmount(preset)}
                  className="h-12"
                >
                  €{preset}
                </Button>
              ))}
            </div>
          </div>

          {stripeConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Backend vereist</AlertTitle>
              <AlertDescription>
                Deze functie vereist een backend API voor het veilig verwerken van betalingen.
                Implementeer eerst de backend endpoints voor payment intents.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={!stripeConfigured || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Verwerken...' : `Opwaarderen`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
