-- Quick fix for profiles INSERT policy
-- Execute this SQL directly in Supabase dashboard

-- Add INSERT policy for users to create their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Show current policies for verification
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';