-- Add additional tax profile fields to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS tax_category TEXT CHECK (tax_category IN ('individual', 'sole_proprietorship', 'bv', 'nv', 'vof', 'other')),
ADD COLUMN IF NOT EXISTS fiscal_year TEXT,
ADD COLUMN IF NOT EXISTS accounting_method TEXT CHECK (accounting_method IN ('cash', 'accrual')),
ADD COLUMN IF NOT EXISTS tax_notes TEXT;

-- Add indexes for business lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tax_category ON public.profiles(tax_category) WHERE tax_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_fiscal_year ON public.profiles(fiscal_year) WHERE fiscal_year IS NOT NULL;

-- Update the updated_at trigger to include new fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();