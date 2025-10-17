-- Add missing INSERT policy for profiles table
-- This fixes both new user registration and profile creation issues

-- Add INSERT policy for users to create their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Ensure the handle_new_user trigger function can still work
-- by allowing inserts during the auth.users insert process
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The SECURITY DEFINER ensures this function runs with elevated privileges
-- allowing it to bypass RLS policies during user creation