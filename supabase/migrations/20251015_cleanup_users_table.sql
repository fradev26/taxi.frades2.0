-- Cleanup: Remove legacy users table, triggers, functions, and policies

-- Remove triggers related to users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Remove functions related to users table
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Remove policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Remove the users table itself
DROP TABLE IF EXISTS users CASCADE;

-- Only profiles table and its triggers/policies remain
-- If you want to clean up any other legacy user-related objects, add them below

-- End of cleanup
