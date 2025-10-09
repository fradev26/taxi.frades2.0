import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface WalletSettingsProps {
  onClose?: () => void;
}

export function WalletSettings({ onClose }: WalletSettingsProps) {
  const { 
    balance, 
    isNotificationsEnabled, 
    enableNotifications, 
    disableNotifications,
    lastUpdated,
    refreshBalance
  } = useWallet();
  const { toast } = useToast();
  
  const [showBalance, setShowBalance] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);
  const [transactionNotifications, setTransactionNotifications] = useState(true);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(20);

  const handleNotificationToggle = (enabled: boolean) => {
    if (enabled) {
      enableNotifications();
      toast({
        title: "Notificaties ingeschakeld",
        description: "Je ontvangt nu meldingen voor wallet activiteiten",
      });
    } else {
      disableNotifications();
      toast({
        title: "Notificaties uitgeschakeld", 
        description: "Je ontvangt geen wallet meldingen meer",
      });
    }
  };

  const handleLowBalanceThresholdChange = (value: number) => {
    setLowBalanceThreshold(value);
    localStorage.setItem('wallet-low-balance-threshold', value.toString());
    toast({
      title: "Drempel bijgewerkt",
      description: `Je krijgt een waarschuwing wanneer je saldo onder €${value} komt`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Wallet Instellingen</h2>
            <p className="text-sm text-muted-foreground">
              Beheer je wallet voorkeuren en beveiliging
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Huidige Saldo</p>
              <p className="text-sm text-muted-foreground">
                Laatst bijgewerkt: {lastUpdated?.toLocaleTimeString('nl-NL') || 'Onbekend'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showBalance ? (
                <span className="text-lg font-semibold text-green-600">
                  {balance ? `€${balance.balance.toFixed(2)}` : '€0.00'}
                </span>
              ) : (
                <span className="text-lg font-semibold">••••</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-refresh status</span>
            <Badge variant={autoRefresh ? "default" : "secondary"}>
              {autoRefresh ? "Actief" : "Uitgeschakeld"}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBalance}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nu vernieuwen
          </Button>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificaties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="wallet-notifications">Wallet Notificaties</Label>
              <p className="text-sm text-muted-foreground">
                Ontvang meldingen voor saldo wijzigingen
              </p>
            </div>
            <Switch
              id="wallet-notifications"
              checked={isNotificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="transaction-notifications">Transactie Meldingen</Label>
              <p className="text-sm text-muted-foreground">
                Ontvang meldingen voor nieuwe transacties
              </p>
            </div>
            <Switch
              id="transaction-notifications"
              checked={transactionNotifications}
              onCheckedChange={setTransactionNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="low-balance-alert">Laag Saldo Waarschuwing</Label>
              <p className="text-sm text-muted-foreground">
                Waarschuw wanneer saldo laag is
              </p>
            </div>
            <Switch
              id="low-balance-alert"
              checked={lowBalanceAlert}
              onCheckedChange={setLowBalanceAlert}
            />
          </div>

          {lowBalanceAlert && (
            <div className="ml-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <Label>Waarschuwingsdrempel</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">€</span>
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  value={lowBalanceThreshold}
                  onChange={(e) => handleLowBalanceThresholdChange(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm border border-border rounded"
                />
                <span className="text-sm text-muted-foreground">
                  Waarschuw onder dit bedrag
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Beveiliging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-refresh Interval</Label>
              <p className="text-sm text-muted-foreground">
                Hoe vaak saldo automatisch wordt ververst
              </p>
            </div>
            <select
              value={autoRefresh ? "30" : "0"}
              onChange={(e) => {
                const value = e.target.value;
                setAutoRefresh(value !== "0");
                localStorage.setItem('wallet-auto-refresh', value);
              }}
              className="px-3 py-1 text-sm border border-border rounded bg-background"
            >
              <option value="0">Uitgeschakeld</option>
              <option value="30">Elke 30 seconden</option>
              <option value="60">Elke minuut</option>
              <option value="300">Elke 5 minuten</option>
            </select>
          </div>

          <Separator />

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Automatische Updates
              </span>
            </div>
            <p className="text-xs text-blue-600">
              Je wallet saldo wordt automatisch bijgewerkt wanneer je de app gebruikt. 
              Updates worden gepauzeerd wanneer de app op de achtergrond draait om batterij te sparen.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Transactiegegevens exporteren
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Wallet gegevens downloaden
          </Button>
          <Separator />
          <div className="text-xs text-muted-foreground">
            <p>Je wallet gegevens worden veilig opgeslagen en nooit gedeeld met derden. 
            Alle transacties zijn versleuteld en worden regelmatig geback-upt.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}