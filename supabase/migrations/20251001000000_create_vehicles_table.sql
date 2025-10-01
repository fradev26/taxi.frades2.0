/*
  # Create vehicles table

  1. New Tables
    - `vehicles`
      - `id` (uuid, primary key)
      - `name` (text) - Vehicle name/identifier
      - `type` (text) - Vehicle type (sedan, suv, van, etc.)
      - `capacity` (integer) - Number of passengers
      - `hourly_rate` (numeric) - Hourly rental rate in EUR
      - `per_km_rate` (numeric) - Per kilometer rate in EUR
      - `available` (boolean) - Vehicle availability status
      - `current_location` (text) - Current location description
      - `current_lat` (numeric) - Current latitude
      - `current_lng` (numeric) - Current longitude
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `vehicles` table
    - Add policy for authenticated users to read available vehicles
    - Add policy for admins to manage all vehicles

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create the vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  type text,
  capacity integer,
  hourly_rate numeric(10,2),
  per_km_rate numeric(10,2),
  available boolean DEFAULT true,
  current_location text,
  current_lat numeric(10,8),
  current_lng numeric(10,8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read available vehicles
CREATE POLICY "Authenticated users can read available vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (available = true);

-- Admins can manage all vehicles
CREATE POLICY "Admins can manage all vehicles"
  ON vehicles
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample vehicles
INSERT INTO vehicles (name, type, capacity, hourly_rate, per_km_rate, available, current_location) VALUES
  ('BMW 5 Series', 'sedan', 4, 45.00, 2.50, true, 'Frades Hoofdkantoor'),
  ('Mercedes Vito', 'van', 8, 65.00, 3.00, true, 'Frades Hoofdkantoor'),
  ('Toyota Prius', 'eco', 4, 35.00, 2.00, true, 'Frades Hoofdkantoor'),
  ('Audi Q7', 'suv', 7, 75.00, 3.50, true, 'Frades Hoofdkantoor'),
  ('Mercedes S-Class', 'luxury', 4, 95.00, 4.00, true, 'Frades Hoofdkantoor')
ON CONFLICT (id) DO NOTHING;