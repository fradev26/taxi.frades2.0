import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { EmptyState } from "@/components/EmptyState";
import { Elements } from '@stripe/react-stripe-js';
import { AddPaymentMethod } from "@/components/stripe/AddPaymentMethod";
import { TopUpCredit } from "@/components/stripe/TopUpCredit";
import { getStripe, getPaymentMethods, deletePaymentMethod } from "@/services/stripeService";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Smartphone, 
  Plus, 
  Euro, 
  History, 
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  X
} from "lucide-react";

export default function Wallet() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(127.50);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showTopUpCredit, setShowTopUpCredit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const stripePromise = getStripe();

  // Load payment methods on component mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods.data || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      // Keep demo data if API fails
      setPaymentMethods([
        {
          id: "demo-1",
          type: "card",
          card: { brand: "bancontact", last4: "1234" },
          isDefault: true,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await deletePaymentMethod(paymentMethodId);
      await loadPaymentMethods();
      toast({
        title: "Betaalmethode verwijderd",
        description: "De betaalmethode is succesvol verwijderd.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon de betaalmethode niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethodAdded = () => {
    setShowAddPaymentMethod(false);
    loadPaymentMethods();
  };

  const handleCreditTopUp = (amount: number) => {
    setBalance(prev => prev + amount);
    setShowTopUpCredit(false);
    
    // Add transaction to history
    const newTransaction = {
      id: Date.now().toString(),
      type: "credit",
      description: "Krediet opwaardering",
      amount: amount,
      date: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'apple':
      case 'google':
        return Smartphone;
      default:
        return CreditCard;
    }
  };

  const formatCardBrand = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'bancontact':
        return 'Bancontact';
      case 'apple':
        return 'Apple Pay';
      case 'google':
        return 'Google Pay';
      default:
        return brand?.charAt(0).toUpperCase() + brand?.slice(1) || 'Card';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">
              Beheer je betaalmethoden en krediet
            </p>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-primary-foreground/80 text-sm">
                    Beschikbaar krediet
                  </p>
                  <p className="text-3xl font-bold">€ {balance.toFixed(2)}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-primary-foreground border-white/20 hover:bg-white/30"
                  onClick={() => setShowTopUpCredit(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Opwaarderen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Modals */}
          {showAddPaymentMethod && stripePromise && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <Elements stripe={stripePromise}>
                  <AddPaymentMethod
                    onSuccess={handlePaymentMethodAdded}
                    onCancel={() => setShowAddPaymentMethod(false)}
                  />
                </Elements>
              </div>
            </div>
          )}

          {showTopUpCredit && stripePromise && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <Elements stripe={stripePromise}>
                  <TopUpCredit
                    currentBalance={balance}
                    onSuccess={handleCreditTopUp}
                    onCancel={() => setShowTopUpCredit(false)}
                  />
                </Elements>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Betaalmethoden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Laden...</p>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => {
                    const IconComponent = getCardIcon(method.card?.brand || method.type);
                    return (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card-hover transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatCardBrand(method.card?.brand || method.type)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              •••• {method.card?.last4 || method.last4}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <span className="text-xs bg-accent-green text-accent-green-foreground px-2 py-1 rounded-full">
                              Standaard
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    type="wallet"
                    title="Geen betaalmethoden"
                    description="Voeg een betaalmethode toe om eenvoudig te kunnen betalen."
                    actionLabel="Betaalmethode toevoegen"
                    onAction={() => setShowAddPaymentMethod(true)}
                  />
                )}
                
                <Button
                  variant="taxi-outline"
                  className="w-full gap-2"
                  onClick={() => setShowAddPaymentMethod(true)}
                >
                  <Plus className="w-4 h-4" />
                  Betaalmethode toevoegen
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Recente transacties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "credit" 
                          ? "bg-accent-green/20" 
                          : "bg-muted"
                      }`}>
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5 text-accent-green" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 
                          ? "text-accent-green" 
                          : "text-foreground"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}€ {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <EmptyState
                    type="wallet"
                    title="Geen transacties"
                    description="Je transactiegeschiedenis verschijnt hier na je eerste betaling of opwaardering."
                    actionLabel="Krediet opwaarderen"
                    onAction={() => {
                      // Handle credit top-up
                    }}
                  />
                )}
                
                {transactions.length > 0 && (
                  <Button
                    variant="taxi-ghost"
                    className="w-full"
                  >
                    Alle transacties bekijken
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button 
                  variant="taxi-outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => setShowTopUpCredit(true)}
                >
                  <Euro className="w-6 h-6" />
                  <span>Krediet opwaarderen</span>
                </Button>
                <Button 
                  variant="taxi-outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => setShowAddPaymentMethod(true)}
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Kaart toevoegen</span>
                </Button>
                <Button variant="taxi-outline" className="h-16 flex-col gap-2">
                  <History className="w-6 h-6" />
                  <span>Transactiehistorie</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}