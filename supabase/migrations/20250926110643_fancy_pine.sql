/*
  # Fix Admin Panel Database Issues

  1. Foreign Key Relationships
    - Add missing foreign key constraint between bookings.user_id and users.id
    - Ensure proper relationships exist for admin queries

  2. Row Level Security Updates
    - Update users table policies to allow admin access
    - Ensure admins can read user data for management purposes

  3. Database Consistency
    - Verify all foreign key constraints are properly set up
    - Add any missing indexes for performance
*/

-- Add foreign key constraint between bookings and users if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'bookings_user_id_fkey' 
      AND table_name = 'bookings'
    ) THEN
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Update RLS policy for users table to allow admin access
DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
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

-- Ensure the users table has proper RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add index on user_id in bookings table for better performance
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id_performance 
    ON bookings(user_id) WHERE user_id IS NOT NULL;
  END IF;
END $$;