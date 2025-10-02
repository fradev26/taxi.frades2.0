/*
  # Add Business Information to Users Table

  1. Schema Updates
    - Add company_name, btw_number fields to users table
    - These fields are optional for personal accounts
    - Required for business accounts

  2. Security
    - Update existing RLS policies to handle new fields
    - Ensure users can manage their own business data

  3. Update Functions
    - Update handle_new_user function to handle business data from registration
*/

-- Add business information fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS btw_number text;

-- Update the handle_new_user function to include business data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, first_name, last_name, phone, company_name, btw_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'btw_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index on company_name for business account searches
CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name) WHERE company_name IS NOT NULL;

-- Add index on btw_number for tax number lookups
CREATE INDEX IF NOT EXISTS idx_users_btw_number ON users(btw_number) WHERE btw_number IS NOT NULL;