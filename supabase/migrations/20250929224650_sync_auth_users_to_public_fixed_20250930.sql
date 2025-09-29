/*
  # Sync Auth Users to Public Users Table (Fixed)

  1. User Synchronization
    - Create public.users records for existing auth.users
    - This fixes the missing relationship causing loading issues

  2. Sample Data Creation
    - Add sample profiles and bookings for testing
    - Use existing auth users to maintain foreign key integrity
*/

-- Insert missing public.users records for existing auth.users
INSERT INTO users (id, email, first_name, last_name, phone, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'first_name',
  au.raw_user_meta_data->>'last_name',
  au.raw_user_meta_data->>'phone',
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Create sample profiles (drivers/chauffeurs) for testing
INSERT INTO profiles (user_id, display_name, phone, company_name, btw_number, address, created_at, updated_at)
SELECT 
  u.id,
  'Jan de Chauffeur',
  '+32 470 123 456',
  'Brussels Taxi Services BVBA',
  'BE0123456789',
  'Koning Albertlaan 123, 1210 Brussels, Belgium',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'taxi@frades.be'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = u.id);

-- Create another sample profile for variety
INSERT INTO profiles (user_id, display_name, phone, company_name, btw_number, address, created_at, updated_at)
SELECT 
  u.id,
  'Marc Dubois',
  '+32 471 234 567',
  'Elite Chauffeurs SA',
  'BE0987654321',
  'Avenue Louise 456, 1050 Brussels, Belgium',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'jasperdps@gmail.com'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = u.id);

-- Create a sample company for corporate bookings
INSERT INTO companies (user_id, name, email, phone, address, credit_balance, discount_tier, monthly_billing, created_at, updated_at)
SELECT 
  u.id,
  'FRADES Corporate Services',
  'corporate@frades.be',
  '+32 2 123 4567',
  'World Trade Center, Boulevard du Roi Albert II 30, 1000 Brussels',
  2500.00,
  3,
  true,
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'taxi@frades.be'
AND NOT EXISTS (SELECT 1 FROM companies WHERE email = 'corporate@frades.be');

-- Create sample bookings for testing the BookingManager
INSERT INTO bookings (
  user_id, 
  vehicle_id, 
  pickup_address, 
  pickup_lat, 
  pickup_lng,
  destination_address, 
  destination_lat, 
  destination_lng,
  scheduled_time, 
  estimated_duration, 
  estimated_distance, 
  estimated_cost,
  final_cost,
  status, 
  payment_status, 
  payment_method,
  confirmation_sent,
  created_at,
  updated_at
)
SELECT 
  u.id,
  v.id,
  'Brussels Airport (BRU), Leopoldlaan, 1930 Zaventem, Belgium',
  50.8978,
  4.4847,
  'Brussels Central Station, Carrefour de l''Europe 2, 1000 Brussels, Belgium',
  50.8458,
  4.3577,
  NOW() + INTERVAL '4 hours',
  45,
  28,
  42.50,
  42.50,
  'confirmed',
  'paid',
  'card',
  true,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
FROM users u, vehicles v
WHERE u.email = 'jasperdps@gmail.com'
AND v.type = 'comfort'
AND NOT EXISTS (
  SELECT 1 FROM bookings b 
  WHERE b.user_id = u.id 
  AND b.pickup_address LIKE '%Brussels Airport%'
);

-- Create another sample booking
INSERT INTO bookings (
  user_id, 
  vehicle_id, 
  pickup_address, 
  pickup_lat, 
  pickup_lng,
  destination_address, 
  destination_lat, 
  destination_lng,
  scheduled_time, 
  estimated_duration, 
  estimated_distance, 
  estimated_cost,
  status, 
  payment_status, 
  payment_method,
  confirmation_sent,
  created_at,
  updated_at
)
SELECT 
  u.id,
  v.id,
  'European Quarter, Rue de la Loi 175, 1048 Brussels, Belgium',
  50.8437,
  4.3677,
  'Brussels South Station, Avenue Fonsny 47B, 1060 Brussels, Belgium',
  50.8364,
  4.3364,
  NOW() + INTERVAL '1 day',
  35,
  18,
  28.75,
  'pending',
  'pending',
  'bancontact',
  false,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
FROM users u, vehicles v
WHERE u.email = 'taxi@frades.be'
AND v.type = 'economy'
AND NOT EXISTS (
  SELECT 1 FROM bookings b 
  WHERE b.user_id = u.id 
  AND b.pickup_address LIKE '%European Quarter%'
);

-- Create a company booking using the sample company
INSERT INTO bookings (
  company_id, 
  vehicle_id, 
  pickup_address, 
  pickup_lat, 
  pickup_lng,
  destination_address, 
  destination_lat, 
  destination_lng,
  scheduled_time, 
  estimated_duration, 
  estimated_distance, 
  estimated_cost,
  status, 
  payment_status, 
  payment_method,
  confirmation_sent,
  created_at,
  updated_at
)
SELECT 
  c.id,
  v.id,
  'Four Seasons Hotel des Bergues, Quai des Bergues 33, 1201 Geneva, Switzerland',
  46.2059,
  6.1467,
  'Brussels South Charleroi Airport (CRL), Rue des Frères Wright 8, 6041 Charleroi, Belgium',
  50.4598,
  4.4533,
  NOW() + INTERVAL '2 days',
  150,
  220,
  385.00,
  'confirmed',
  'pending',
  'company_account',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
FROM companies c, vehicles v
WHERE c.email = 'corporate@frades.be'
AND v.type = 'luxury'
AND NOT EXISTS (
  SELECT 1 FROM bookings b 
  WHERE b.company_id = c.id 
  AND b.destination_address LIKE '%Charleroi Airport%'
);