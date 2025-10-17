import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for wallet operations
interface WalletBalance {
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description?: string;
  booking_id?: string;
  created_at: string;
}

// Fetch user wallet balance
const fetchWalletBalance = async (): Promise<WalletBalance> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return {
    balance: data.wallet_balance || 0,
    currency: 'EUR'
  };
};

// Fetch user transactions
const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Add money to wallet (top-up)
const addToWallet = async (amount: number): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First, create a transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{
      user_id: user.id,
      amount: amount,
      currency: 'eur',
      status: 'completed',
      type: 'top_up',
      description: `Wallet top-up of €${amount.toFixed(2)}`
    }]);

  if (transactionError) throw transactionError;

  // Then update the wallet balance
  const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
    user_id: user.id,
    amount: amount
  });

  if (balanceError) throw balanceError;
};

// Hooks
export const useWallet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: fetchWalletBalance,
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  // Add to wallet mutation
  const addToWalletMutation = useMutation({
    mutationFn: addToWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Wallet bijgevuld!",
        description: "Het bedrag is toegevoegd aan uw wallet.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout bij bijvullen wallet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    balance: balance?.balance || 0,
    currency: balance?.currency || 'EUR',
    transactions: transactions || [],
    isLoading: balanceLoading || transactionsLoading,
    addToWallet: addToWalletMutation.mutate,
    isAddingToWallet: addToWalletMutation.isPending,
  };
};