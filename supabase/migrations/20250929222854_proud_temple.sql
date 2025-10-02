/*
  # Fix admin permissions for users table access

  1. Security Updates
    - Add policy for admin users to read all user data
    - Ensure taxi@frades.be can access users table for booking management
    
  2. Changes
    - Create policy allowing admin users (emails ending with @frades.be) to read all users
    - This enables the BookingManager to load user emails when displaying bookings
*/

-- Create policy for admin users to read all user data
CREATE POLICY "Admins can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@frades.be'
    )
  );