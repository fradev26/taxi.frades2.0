/*
  # Create Booking Management Functions

  1. RPC Functions
    - Create get_bookings_with_details() function for optimized booking loading
    - Create get_profiles_with_emails() function for optimized driver loading

  2. Performance Optimization
    - Single query instead of multiple database roundtrips
    - Better performance for admin panel components
*/

-- Function to get bookings with all related details in a single query
CREATE OR REPLACE FUNCTION get_bookings_with_details()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  company_id uuid,
  vehicle_id uuid,
  pickup_address text,
  pickup_lat numeric,
  pickup_lng numeric,
  destination_address text,
  destination_lat numeric,
  destination_lng numeric,
  waypoints jsonb,
  scheduled_time timestamptz,
  estimated_duration integer,
  estimated_distance integer,
  estimated_cost numeric,
  final_cost numeric,
  status text,
  payment_status text,
  payment_method text,
  payment_id text,
  confirmation_sent boolean,
  created_at timestamptz,
  updated_at timestamptz,
  vehicle_name text,
  user_email text,
  company_name text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    b.id,
    b.user_id,
    b.company_id,
    b.vehicle_id,
    b.pickup_address,
    b.pickup_lat,
    b.pickup_lng,
    b.destination_address,
    b.destination_lat,
    b.destination_lng,
    b.waypoints,
    b.scheduled_time,
    b.estimated_duration,
    b.estimated_distance,
    b.estimated_cost,
    b.final_cost,
    b.status,
    b.payment_status,
    b.payment_method,
    b.payment_id,
    b.confirmation_sent,
    b.created_at,
    b.updated_at,
    v.name as vehicle_name,
    u.email as user_email,
    c.name as company_name
  FROM bookings b
  LEFT JOIN vehicles v ON b.vehicle_id = v.id
  LEFT JOIN users u ON b.user_id = u.id
  LEFT JOIN companies c ON b.company_id = c.id
  ORDER BY b.scheduled_time DESC;
$$;

-- Function to get profiles with user emails in a single query
CREATE OR REPLACE FUNCTION get_profiles_with_emails()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  phone text,
  company_name text,
  btw_number text,
  address text,
  created_at timestamptz,
  updated_at timestamptz,
  email text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.phone,
    p.company_name,
    p.btw_number,
    p.address,
    p.created_at,
    p.updated_at,
    u.email
  FROM profiles p
  LEFT JOIN users u ON p.user_id = u.id
  ORDER BY p.created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_bookings_with_details() TO authenticated;
GRANT EXECUTE ON FUNCTION get_profiles_with_emails() TO authenticated;