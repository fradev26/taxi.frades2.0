/*
  # Create app settings table

  1. New Tables
    - `app_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting identifier (e.g., 'base_fare', 'price_per_km')
      - `value` (text) - Setting value as JSON string
      - `description` (text) - Human readable description
      - `category` (text) - Setting category (e.g., 'pricing', 'general')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `app_settings` table
    - Add policy for admins to manage all settings
    - Add policy for authenticated users to read settings

  3. Initial Data
    - Insert default pricing settings
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all settings
CREATE POLICY "Admins can manage app settings"
  ON app_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  );

-- Authenticated users can read settings
CREATE POLICY "Authenticated users can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default pricing settings
INSERT INTO app_settings (key, value, description, category) VALUES
  ('base_fare', '5.00', 'Base fare for all rides in EUR', 'pricing'),
  ('price_per_km', '2.50', 'Price per kilometer in EUR', 'pricing'),
  ('night_surcharge', '1.25', 'Night surcharge multiplier', 'pricing')
ON CONFLICT (key) DO NOTHING;