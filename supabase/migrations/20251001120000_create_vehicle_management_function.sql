/*
  # Create Vehicle Management Function

  1. RPC Function
    - Create get_vehicles_with_stats() function for optimized vehicle loading
    - Includes booking count and usage statistics

  2. Performance Optimization
    - Single query instead of multiple database roundtrips
    - Better performance for admin panel vehicle management
*/

-- Function to get vehicles with booking statistics in a single query
CREATE OR REPLACE FUNCTION get_vehicles_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  capacity integer,
  hourly_rate numeric,
  per_km_rate numeric,
  available boolean,
  current_location text,
  current_lat numeric,
  current_lng numeric,
  created_at timestamptz,
  updated_at timestamptz,
  total_bookings bigint,
  active_bookings bigint,
  completed_bookings bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    v.id,
    v.name,
    v.type,
    v.capacity,
    v.hourly_rate,
    v.per_km_rate,
    v.available,
    v.current_location,
    v.current_lat,
    v.current_lng,
    v.created_at,
    v.updated_at,
    COUNT(b.id) as total_bookings,
    COUNT(CASE WHEN b.status IN ('pending', 'confirmed', 'in_progress') THEN 1 END) as active_bookings,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings
  FROM vehicles v
  LEFT JOIN bookings b ON v.id = b.vehicle_id
  GROUP BY v.id, v.name, v.type, v.capacity, v.hourly_rate, v.per_km_rate, 
           v.available, v.current_location, v.current_lat, v.current_lng, 
           v.created_at, v.updated_at
  ORDER BY v.created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_vehicles_with_stats() TO authenticated;
