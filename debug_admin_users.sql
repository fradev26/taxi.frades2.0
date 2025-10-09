-- Temporary SQL script to create a test admin user
-- You can run this in Supabase Studio (http://127.0.0.1:54323) in the SQL Editor

-- First, let's check if we have any users
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Create a test admin user (you'll need to confirm the email in the auth.users table)
-- The password will be 'admin123' and email 'admin@frades.be'

-- Note: In a real environment, you would create this user through the normal signup process
-- This is just for testing purposes

-- For now, let's just show how to check if users exist and what their emails are
SELECT 
  u.email,
  u.created_at,
  p.first_name,
  p.last_name,
  CASE WHEN u.email LIKE '%@frades.be' THEN 'Admin' ELSE 'Regular User' END as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;