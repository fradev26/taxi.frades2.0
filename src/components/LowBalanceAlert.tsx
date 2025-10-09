import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CreditCard, X } from 'lucide-react';

interface LowBalanceAlertProps {
  threshold?: number;
  showInline?: boolean;
  onTopUp?: () => void;
}

export function LowBalanceAlert({ 
  threshold = 20, 
  showInline = false,
  onTopUp 
}: LowBalanceAlertProps) {
  const { balance, topUp } = useWallet();
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const currentBalance = balance?.balance || 0;
  const isLowBalance = currentBalance > 0 && currentBalance <= threshold;

  // Show toast notification for low balance (only once per session)
  useEffect(() => {
    if (isLowBalance && !hasShownToast && !showInline) {
      toast({
        title: "Laag wallet saldo",
        description: `Je saldo is €${currentBalance.toFixed(2)}. Overweeg om je wallet op te waarderen.`,
        variant: "destructive",
        duration: 8000,
        action: onTopUp ? (
          <Button size="sm" onClick={onTopUp}>
            Opwaarderen
          </Button>
        ) : undefined
      });
      setHasShownToast(true);
    }
  }, [isLowBalance, hasShownToast, currentBalance, toast, onTopUp, showInline]);

  // Reset toast flag when balance increases above threshold
  useEffect(() => {
    if (currentBalance > threshold) {
      setHasShownToast(false);
      setIsDismissed(false);
    }
  }, [currentBalance, threshold]);

  // Don't show inline alert if dismissed or not low balance
  if (!showInline || !isLowBalance || isDismissed) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div>
          <span className="font-medium text-orange-800">
            Laag wallet saldo: €{currentBalance.toFixed(2)}
          </span>
          <p className="text-sm text-orange-600 mt-1">
            Waardeer je wallet op om onderbrekingen te voorkomen
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {onTopUp && (
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={onTopUp}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Opwaarderen
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-orange-600 hover:bg-orange-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Hook for low balance detection
export function useLowBalanceAlert(threshold = 20) {
  const { balance } = useWallet();
  const currentBalance = balance?.balance || 0;
  
  return {
    isLowBalance: currentBalance > 0 && currentBalance <= threshold,
    currentBalance,
    threshold,
    balanceStatus: currentBalance <= 0 ? 'empty' : 
                  currentBalance <= threshold ? 'low' : 
                  currentBalance <= threshold * 2 ? 'medium' : 'high'
  };
}