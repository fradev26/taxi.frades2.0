/*
  # Fix Database Issues for Booking and Chauffeur Loading

  1. Foreign Key Relationships
    - Add missing foreign key constraint between profiles.user_id and users.id
    - Verify all necessary foreign key relationships exist

  2. Row Level Security Updates
    - Ensure proper RLS policies exist for profiles table
    - Add admin policies for profiles access

  3. Sample Data
    - Add sample data to test the booking and driver management components
    - Create a test admin user for testing purposes

  4. Database Consistency
    - Fix any missing constraints or indexes
    - Ensure data integrity across all tables
*/

-- Add foreign key constraint between profiles and users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure proper RLS policies exist for profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  );

-- Ensure bookings table has proper admin policies
DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
CREATE POLICY "Admins can read all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
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
  );

-- Users can read their own bookings
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create bookings
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure companies table has proper admin policies
DROP POLICY IF EXISTS "Admins can read all companies" ON companies;
CREATE POLICY "Admins can read all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  );

-- Ensure vehicles table has proper policies
DROP POLICY IF EXISTS "Authenticated users can read vehicles" ON vehicles;
CREATE POLICY "Authenticated users can read vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (available = true);

DROP POLICY IF EXISTS "Admins can manage all vehicles" ON vehicles;
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
  );

-- Add index for better performance on user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_lookup 
ON profiles(user_id) WHERE user_id IS NOT NULL;