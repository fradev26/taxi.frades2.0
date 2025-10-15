-- Migration: maak een aparte chauffeurs-tabel aan
CREATE TABLE IF NOT EXISTS chauffeurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  phone text,
  company_name text,
  btw_number text,
  address text,
  created_at timestamptz DEFAULT now()
);
