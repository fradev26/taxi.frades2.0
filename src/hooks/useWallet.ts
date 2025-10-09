import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getWalletBalance, 
  getWalletTransactions, 
  topUpWallet, 
  processWalletPayment,
  formatCurrency,
  WalletBalance, 
  WalletTransaction, 
  TopUpRequest 
} from '@/services/walletService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UseWalletResult {
  // State
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  topUp: (request: TopUpRequest) => Promise<boolean>;
  processPayment: (amount: number, description: string, reference?: string) => Promise<boolean>;
  loadMoreTransactions: () => Promise<void>;
  enableNotifications: () => void;
  disableNotifications: () => void;
  
  // Utilities
  hasBalance: (amount: number) => boolean;
  formatBalance: () => string;
  isNotificationsEnabled: boolean;
}

export function useWallet(): UseWalletResult {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionOffset, setTransactionOffset] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousBalanceRef = useRef<number | null>(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (authLoading || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load balance and transactions in parallel
      const [balanceResult, transactionResult] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(20, 0)
      ]);
      
      if (balanceResult.error) {
        setError(balanceResult.error);
      } else {
        setBalance(balanceResult.data);
      }
      
      if (transactionResult.error) {
        setError(transactionResult.error);
      } else {
        setTransactions(transactionResult.data || []);
        setTransactionOffset(20);
        setHasMoreTransactions((transactionResult.data?.length || 0) === 20);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const result = await getWalletBalance();
      if (result.error) {
        setError(result.error);
        toast({
          title: "Error refreshing balance",
          description: result.error,
          variant: "destructive"
        });
      } else {
        if (result.data) {
          checkBalanceChanges(result.data);
          setBalance(result.data);
          setLastUpdated(new Date());
        }
        setError(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh balance';
      setError(errorMsg);
      toast({
        title: "Error refreshing balance", 
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, toast]);

  // Refresh transactions
  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const result = await getWalletTransactions(20, 0);
      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result.data || []);
        setTransactionOffset(20);
        setHasMoreTransactions((result.data?.length || 0) === 20);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh transactions');
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  // Load more transactions (pagination)
  const loadMoreTransactions = useCallback(async () => {
    if (!user || !hasMoreTransactions || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const result = await getWalletTransactions(20, transactionOffset);
      if (result.error) {
        toast({
          title: "Error loading transactions",
          description: result.error,
          variant: "destructive"
        });
      } else {
        const newTransactions = result.data || [];
        setTransactions(prev => [...prev, ...newTransactions]);
        setTransactionOffset(prev => prev + 20);
        setHasMoreTransactions(newTransactions.length === 20);
      }
    } catch (err) {
      toast({
        title: "Error loading transactions",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, hasMoreTransactions, isRefreshing, transactionOffset, toast]);

  // Top up wallet
  const topUp = useCallback(async (request: TopUpRequest): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to top up your wallet",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = await topUpWallet(request);
      if (result.error) {
        toast({
          title: "Top-up failed",
          description: result.error,
          variant: "destructive"
        });
        return false;
      } else {
        // Add new transaction to the list
        if (result.data) {
          setTransactions(prev => [result.data!, ...prev]);
        }
        
        // Refresh balance
        await refreshBalance();
        
        toast({
          title: "Wallet topped up successfully",
          description: `€${request.amount.toFixed(2)} has been added to your wallet`,
        });
        return true;
      }
    } catch (err) {
      toast({
        title: "Top-up failed",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
      return false;
    }
  }, [user, refreshBalance, toast]);

  // Process payment
  const processPayment = useCallback(async (
    amount: number, 
    description: string, 
    reference?: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to process payment",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = await processWalletPayment(amount, description, reference);
      if (result.error) {
        toast({
          title: "Payment failed",
          description: result.error,
          variant: "destructive"
        });
        return false;
      } else {
        // Add new transaction to the list
        if (result.data) {
          setTransactions(prev => [result.data!, ...prev]);
        }
        
        // Refresh balance
        await refreshBalance();
        
        return true;
      }
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive"
      });
      return false;
    }
  }, [user, refreshBalance, toast]);

  // Utility functions
  const hasBalance = useCallback((amount: number): boolean => {
    return balance ? balance.balance >= amount : false;
  }, [balance]);

  const formatBalance = useCallback((): string => {
    if (!balance) return '€0.00';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: balance.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(balance.balance);
  }, [balance]);

  // Notification functions
  const enableNotifications = useCallback(() => {
    setIsNotificationsEnabled(true);
    localStorage.setItem('wallet-notifications-enabled', 'true');
  }, []);

  const disableNotifications = useCallback(() => {
    setIsNotificationsEnabled(false);
    localStorage.setItem('wallet-notifications-enabled', 'false');
  }, []);

  // Check for balance changes and notify
  const checkBalanceChanges = useCallback((newBalance: WalletBalance) => {
    if (!isNotificationsEnabled) return;
    
    const currentBalance = newBalance.balance;
    const previousBalance = previousBalanceRef.current;
    
    if (previousBalance !== null && previousBalance !== currentBalance) {
      const difference = currentBalance - previousBalance;
      const isIncrease = difference > 0;
      
      toast({
        title: isIncrease ? "Saldo verhoogd" : "Saldo verlaagd",
        description: `Je saldo is ${isIncrease ? 'verhoogd' : 'verlaagd'} met ${formatCurrency(Math.abs(difference))}`,
        variant: isIncrease ? "default" : "destructive",
        duration: 5000,
      });
    }
    
    previousBalanceRef.current = currentBalance;
  }, [isNotificationsEnabled, toast]);

  // Load data when component mounts or user changes
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Enhanced auto-refresh with adaptive intervals
  useEffect(() => {
    if (!user) return;
    
    const startAutoRefresh = () => {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Start with 30 second intervals
      refreshIntervalRef.current = setInterval(() => {
        refreshBalance();
      }, 30000);
    };

    // Start auto-refresh when user is available
    startAutoRefresh();
    
    // Listen for visibility changes to pause/resume refresh
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear interval to save resources
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      } else {
        // Page is visible again, restart auto-refresh and immediately refresh
        refreshBalance();
        startAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshBalance]);

  // Load notification preferences on component mount
  useEffect(() => {
    const notificationsEnabled = localStorage.getItem('wallet-notifications-enabled');
    if (notificationsEnabled !== null) {
      setIsNotificationsEnabled(notificationsEnabled === 'true');
    }
  }, []);

  return {
    // State
    balance,
    transactions,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    
    // Actions
    refreshBalance,
    refreshTransactions,
    topUp,
    processPayment,
    loadMoreTransactions,
    enableNotifications,
    disableNotifications,
    
    // Utilities
    hasBalance,
    formatBalance,
    isNotificationsEnabled
  };
}