/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `vehicle_id` (uuid, references vehicles)
      - `pickup_address` (text) - Pickup location address
      - `destination_address` (text) - Destination address
      - `pickup_lat` (numeric) - Pickup latitude
      - `pickup_lng` (numeric) - Pickup longitude
      - `destination_lat` (numeric) - Destination latitude
      - `destination_lng` (numeric) - Destination longitude
      - `scheduled_time` (timestamp) - When the ride is scheduled
      - `status` (text) - Booking status (pending, confirmed, in_progress, completed, cancelled)
      - `price` (numeric) - Total price in EUR
      - `payment_method` (text) - Payment method used
      - `vehicle_type` (text) - Type of vehicle requested
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bookings` table
    - Add policy for users to read their own bookings
    - Add policy for users to create bookings
    - Add policy for admins to manage all bookings

  3. Foreign Keys
    - Link bookings to users and vehicles tables
*/

-- Create the bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  pickup_address text,
  destination_address text,
  pickup_lat numeric(10,8),
  pickup_lng numeric(10,8),
  destination_lat numeric(10,8),
  destination_lng numeric(10,8),
  scheduled_time timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  price numeric(10,2),
  payment_method text,
  vehicle_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (for cancellation, etc.)
CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON bookings
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

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_time ON bookings(scheduled_time);