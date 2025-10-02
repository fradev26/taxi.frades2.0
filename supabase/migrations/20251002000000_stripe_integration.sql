-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stripe_customers table to store Stripe customer mappings
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Stripe-specific columns to existing payment_methods table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_methods' AND column_name = 'stripe_payment_method_id') THEN
        ALTER TABLE public.payment_methods ADD COLUMN stripe_payment_method_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_methods' AND column_name = 'card_exp_month') THEN
        ALTER TABLE public.payment_methods ADD COLUMN card_exp_month INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_methods' AND column_name = 'card_exp_year') THEN
        ALTER TABLE public.payment_methods ADD COLUMN card_exp_year INTEGER;
    END IF;
    
    -- Rename columns to match Stripe naming if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'payment_methods' AND column_name = 'last4') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'payment_methods' AND column_name = 'card_last4') THEN
        ALTER TABLE public.payment_methods RENAME COLUMN last4 TO card_last4;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'payment_methods' AND column_name = 'brand') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'payment_methods' AND column_name = 'card_brand') THEN
        ALTER TABLE public.payment_methods RENAME COLUMN brand TO card_brand;
    END IF;
END $$;

-- Create transactions table to store payment history
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'eur' NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL, -- 'top_up', 'booking_payment', 'refund'
    description TEXT,
    booking_id UUID, -- References bookings table when implemented
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add wallet_balance to profiles table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'profiles' AND column_name = 'wallet_balance') THEN
            ALTER TABLE public.profiles ADD COLUMN wallet_balance INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON public.payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_id ON public.transactions(stripe_payment_intent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stripe_customers
CREATE POLICY "Users can view their own stripe customers" ON public.stripe_customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stripe customers" ON public.stripe_customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all stripe customers" ON public.stripe_customers
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for payment_methods
CREATE POLICY "Users can view their own payment methods" ON public.payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON public.payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment methods" ON public.payment_methods
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions" ON public.transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update balance for successful top_up transactions
    IF NEW.type = 'top_up' AND NEW.status = 'succeeded' THEN
        UPDATE public.profiles 
        SET wallet_balance = COALESCE(wallet_balance, 0) + NEW.amount
        WHERE id = NEW.user_id;
    END IF;
    
    -- Deduct balance for successful booking payments
    IF NEW.type = 'booking_payment' AND NEW.status = 'succeeded' THEN
        UPDATE public.profiles 
        SET wallet_balance = COALESCE(wallet_balance, 0) - NEW.amount
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update wallet balance
DROP TRIGGER IF EXISTS update_wallet_balance_trigger ON public.transactions;
CREATE TRIGGER update_wallet_balance_trigger
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_balance();

-- Create function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    -- If this payment method is being set as default
    IF NEW.is_default = true THEN
        -- Remove default flag from all other payment methods for this user
        UPDATE public.payment_methods 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to ensure only one default payment method
DROP TRIGGER IF EXISTS ensure_single_default_payment_method_trigger ON public.payment_methods;
CREATE TRIGGER ensure_single_default_payment_method_trigger
    BEFORE INSERT OR UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_default_payment_method();