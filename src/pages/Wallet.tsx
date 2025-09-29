import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { EmptyState } from "@/components/EmptyState";
import { 
  CreditCard, 
  Smartphone, 
  Plus, 
  Euro, 
  History, 
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

export default function Wallet() {
  const paymentMethods = [
    {
      id: "1",
      type: "Bancontact",
      last4: "1234",
      icon: CreditCard,
      isDefault: true,
    },
    {
      id: "2", 
      type: "Apple Pay",
      last4: "Apple ID",
      icon: Smartphone,
      isDefault: false,
    },
    {
      id: "3",
      type: "Google Pay", 
      last4: "Google",
      icon: Smartphone,
      isDefault: false,
    },
  ];

  const transactions = [
    // For demo purposes, start with empty transactions to show the empty state
  ];

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
                  <p className="text-3xl font-bold">€ 127,50</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-primary-foreground border-white/20 hover:bg-white/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Opwaarderen
                </Button>
              </div>
            </CardContent>
          </Card>

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
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{method.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.last4}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-accent-green text-accent-green-foreground px-2 py-1 rounded-full">
                        Standaard
                      </span>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="taxi-outline"
                  className="w-full gap-2"
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
                <Button variant="taxi-outline" className="h-16 flex-col gap-2">
                  <Euro className="w-6 h-6" />
                  <span>Krediet opwaarderen</span>
                </Button>
                <Button variant="taxi-outline" className="h-16 flex-col gap-2">
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