-- Fix INSERT policy for profiles table
-- Remove existing INSERT policy if it exists and create a new one

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a simple INSERT policy that allows authenticated users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Also ensure we have a broader policy for profile creation
CREATE POLICY IF NOT EXISTS "Enable profile creation for authenticated users" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;