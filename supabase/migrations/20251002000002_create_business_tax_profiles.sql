-- Create business_tax_profiles table for business clients
CREATE TABLE IF NOT EXISTS business_tax_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  btw_number TEXT NOT NULL,
  kvk_number TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nederland',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  billing_email TEXT,
  payment_terms TEXT DEFAULT '14',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_business_tax_profiles_user_id ON business_tax_profiles(user_id);

-- Enable RLS
ALTER TABLE business_tax_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for business_tax_profiles
-- Users can only view their own business tax profile
CREATE POLICY "Users can view own business tax profile" ON business_tax_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own business tax profile
CREATE POLICY "Users can insert own business tax profile" ON business_tax_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own business tax profile
CREATE POLICY "Users can update own business tax profile" ON business_tax_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own business tax profile
CREATE POLICY "Users can delete own business tax profile" ON business_tax_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all business tax profiles
CREATE POLICY "Admins can view all business tax profiles" ON business_tax_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
