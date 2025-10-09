import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@/services/walletService";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet
} from 'lucide-react';

interface WalletAnalyticsProps {
  period?: 'week' | 'month' | 'year';
}

export function WalletAnalytics({ period = 'month' }: WalletAnalyticsProps) {
  const { transactions, balance } = useWallet();

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodTransactions = transactions.filter(t => 
      new Date(t.created_at) >= periodStart
    );

    const totalIncoming = periodTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutgoing = periodTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netChange = totalIncoming - totalOutgoing;

    const transactionsByType = periodTransactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageTransaction = periodTransactions.length > 0
      ? Math.abs(periodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / periodTransactions.length)
      : 0;

    const largestTransaction = periodTransactions.reduce((max, t) => 
      Math.abs(t.amount) > Math.abs(max) ? t.amount : max, 0
    );

    return {
      totalIncoming,
      totalOutgoing,
      netChange,
      transactionCount: periodTransactions.length,
      transactionsByType,
      averageTransaction,
      largestTransaction,
      periodTransactions
    };
  }, [transactions, period]);

  const getPeriodLabel = () => {
    switch (period) {
      case 'week': return 'Deze week';
      case 'month': return 'Deze maand';
      case 'year': return 'Dit jaar';
      default: return 'Periode';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Wallet Analytics</h3>
          <p className="text-sm text-muted-foreground">{getPeriodLabel()}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Huidig Saldo</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(balance?.balance || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Total Incoming */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Inkomend</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalIncoming)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        {/* Total Outgoing */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Uitgaand</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totalOutgoing)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>

        {/* Net Change */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {analytics.netChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Netto Verschil</span>
            </div>
            <p className={`text-2xl font-bold ${
              analytics.netChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.netChange >= 0 ? '+' : ''}{formatCurrency(analytics.netChange)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Transactie Overzicht
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Totaal Transacties</span>
              <Badge variant="secondary">{analytics.transactionCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Gemiddelde Transactie</span>
              <span className="text-sm font-medium">
                {formatCurrency(analytics.averageTransaction)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Grootste Transactie</span>
              <span className={`text-sm font-medium ${
                analytics.largestTransaction >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.abs(analytics.largestTransaction))}
              </span>
            </div>

            {/* Transaction Types */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Per Type:</span>
              {Object.entries(analytics.transactionsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {type === 'credit' ? 'Inkomend' :
                     type === 'debit' ? 'Uitgaand' :
                     type === 'refund' ? 'Terugbetaling' :
                     type === 'bonus' ? 'Bonus' : type}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Uitgaven Inzichten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.totalOutgoing > 0 ? (
              <>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    💡 Uitgaven Tip
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Je hebt gemiddeld {formatCurrency(analytics.totalOutgoing / (period === 'week' ? 7 : period === 'month' ? 30 : 365))} per dag uitgegeven.
                  </p>
                </div>

                {analytics.netChange < 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 font-medium">
                      ⚠️ Saldo Waarschuwing
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Je saldo is met {formatCurrency(Math.abs(analytics.netChange))} gedaald {getPeriodLabel().toLowerCase()}.
                    </p>
                  </div>
                )}

                {analytics.netChange > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Positieve Balans
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Je saldo is met {formatCurrency(analytics.netChange)} gestegen {getPeriodLabel().toLowerCase()}.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  Geen uitgaven in deze periode
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}