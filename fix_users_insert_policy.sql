-- Add missing INSERT policy for users table
-- This allows authenticated users to create their own user record

-- Add INSERT policy for users to create their own record
CREATE POLICY "Users can insert their own record" ON public.users
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT INSERT ON public.users TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;