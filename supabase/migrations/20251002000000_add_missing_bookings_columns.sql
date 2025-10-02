/*
  # Add Missing Columns to Bookings Table

  1. Schema Updates
    - Add waypoints (jsonb) - For storing stopover/waypoint data
    - Add estimated_duration (integer) - Trip duration in seconds
    - Add estimated_distance (integer) - Trip distance in meters
    - Add estimated_cost (numeric) - Estimated price
    - Add final_cost (numeric) - Final price after trip completion
    - Add payment_status (text) - Payment status tracking
    - Add payment_id (text) - External payment provider ID
    - Add confirmation_sent (boolean) - Whether confirmation email was sent
    - Add company_id (uuid) - For corporate bookings

  2. Foreign Keys
    - Add foreign key for company_id to companies table

  3. Indexes
    - Add indexes for better query performance
*/

-- Add missing columns to bookings table
DO $$ 
BEGIN
  -- Add waypoints column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'waypoints'
  ) THEN
    ALTER TABLE bookings ADD COLUMN waypoints jsonb;
  END IF;

  -- Add estimated_duration column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'estimated_duration'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_duration integer;
  END IF;

  -- Add estimated_distance column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'estimated_distance'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_distance integer;
  END IF;

  -- Add estimated_cost column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'estimated_cost'
  ) THEN
    ALTER TABLE bookings ADD COLUMN estimated_cost numeric(10,2);
  END IF;

  -- Add final_cost column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'final_cost'
  ) THEN
    ALTER TABLE bookings ADD COLUMN final_cost numeric(10,2);
  END IF;

  -- Add payment_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  -- Add payment_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_id text;
  END IF;

  -- Add confirmation_sent column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'confirmation_sent'
  ) THEN
    ALTER TABLE bookings ADD COLUMN confirmation_sent boolean DEFAULT false;
  END IF;

  -- Add company_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN company_id uuid;
  END IF;
END $$;

-- Add foreign key for company_id if companies table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'bookings_company_id_fkey' 
      AND table_name = 'bookings'
    ) THEN
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON bookings(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation_sent ON bookings(confirmation_sent) WHERE confirmation_sent = false;

-- Add comment to table
COMMENT ON TABLE bookings IS 'Stores all taxi booking requests and their details';
COMMENT ON COLUMN bookings.waypoints IS 'JSON array of stopover/waypoint locations with coordinates';
COMMENT ON COLUMN bookings.estimated_duration IS 'Estimated trip duration in seconds';
COMMENT ON COLUMN bookings.estimated_distance IS 'Estimated trip distance in meters';
COMMENT ON COLUMN bookings.estimated_cost IS 'Estimated price calculated at booking time';
COMMENT ON COLUMN bookings.final_cost IS 'Final price after trip completion';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN bookings.payment_id IS 'External payment provider transaction ID';
COMMENT ON COLUMN bookings.confirmation_sent IS 'Whether confirmation email/SMS was sent to customer';
COMMENT ON COLUMN bookings.company_id IS 'Reference to company for corporate bookings';
