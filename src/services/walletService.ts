import { supabase } from "@/integrations/supabase/client";

export interface WalletBalance {
  balance: number;
  currency: string;
  last_updated: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit' | 'refund' | 'bonus';
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TopUpRequest {
  amount: number;
  payment_method_id: string;
  currency?: string;
}

/**
 * Get current wallet balance for the authenticated user
 */
export const getWalletBalance = async (): Promise<{ data: WalletBalance | null; error: string | null }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // For now, return demo data since we don't have wallet tables yet
    // TODO: Replace with actual database query when wallet tables are created
    const demoBalance: WalletBalance = {
      balance: 127.50,
      currency: 'EUR',
      last_updated: new Date().toISOString()
    };

    return { data: demoBalance, error: null };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get transaction history for the authenticated user
 */
export const getWalletTransactions = async (limit = 50, offset = 0): Promise<{ data: WalletTransaction[] | null; error: string | null }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Demo transaction data
    const demoTransactions: WalletTransaction[] = [
      {
        id: "tx-001",
        user_id: user.id,
        amount: 50.00,
        currency: "EUR",
        type: "credit",
        description: "Wallet top-up via iDEAL",
        reference: "topup-001",
        status: "completed",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "tx-002", 
        user_id: user.id,
        amount: -25.50,
        currency: "EUR",
        type: "debit",
        description: "Taxi ride - Brussels to Airport",
        reference: "ride-002",
        status: "completed",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: "tx-003",
        user_id: user.id,
        amount: 100.00,
        currency: "EUR", 
        type: "credit",
        description: "Wallet top-up via Credit Card",
        reference: "topup-002",
        status: "completed",
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updated_at: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: "tx-004",
        user_id: user.id,
        amount: -18.75,
        currency: "EUR",
        type: "debit", 
        description: "Hourly booking - 2 hours",
        reference: "ride-003",
        status: "completed",
        created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        updated_at: new Date(Date.now() - 345600000).toISOString()
      },
      {
        id: "tx-005",
        user_id: user.id,
        amount: 25.00,
        currency: "EUR",
        type: "bonus",
        description: "Welcome bonus",
        reference: "bonus-001",
        status: "completed",
        created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 432000000).toISOString()
      }
    ];

    return { data: demoTransactions.slice(offset, offset + limit), error: null };
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Top up wallet with specified amount
 */
export const topUpWallet = async (request: TopUpRequest): Promise<{ data: WalletTransaction | null; error: string | null }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Validate amount
    if (request.amount <= 0) {
      return { data: null, error: "Amount must be greater than 0" };
    }

    if (request.amount > 500) {
      return { data: null, error: "Maximum top-up amount is €500" };
    }

    // TODO: Integrate with actual payment processing (Stripe)
    // For now, return a mock successful transaction
    const mockTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      amount: request.amount,
      currency: request.currency || 'EUR',
      type: 'credit',
      description: `Wallet top-up via payment method`,
      reference: `topup-${Date.now()}`,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { data: mockTransaction, error: null };
  } catch (error) {
    console.error('Error topping up wallet:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Process a wallet payment (debit from wallet)
 */
export const processWalletPayment = async (
  amount: number, 
  description: string, 
  reference?: string
): Promise<{ data: WalletTransaction | null; error: string | null }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get current balance
    const { data: balanceData, error: balanceError } = await getWalletBalance();
    if (balanceError || !balanceData) {
      return { data: null, error: "Could not retrieve wallet balance" };
    }

    // Check if sufficient balance
    if (balanceData.balance < amount) {
      return { data: null, error: "Insufficient wallet balance" };
    }

    // TODO: Process actual payment and update database
    // For now, return a mock transaction
    const mockTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      amount: -amount, // Negative for debit
      currency: 'EUR',
      type: 'debit',
      description,
      reference,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { data: mockTransaction, error: null };
  } catch (error) {
    console.error('Error processing wallet payment:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Get transaction type display info
 */
export const getTransactionTypeInfo = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'credit':
      return { color: 'text-green-600', icon: '↗', label: 'Incoming' };
    case 'debit':
      return { color: 'text-red-600', icon: '↙', label: 'Outgoing' };
    case 'refund':
      return { color: 'text-blue-600', icon: '↩', label: 'Refund' };
    case 'bonus':
      return { color: 'text-purple-600', icon: '🎁', label: 'Bonus' };
    default:
      return { color: 'text-gray-600', icon: '•', label: 'Transaction' };
  }
};