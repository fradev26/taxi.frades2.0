-- Enable Row Level Security and policies for app_settings
-- This migration assumes an existing public.app_settings table with columns: key text primary key, value text, category text, description text, created_at, updated_at

-- Safety: only create policies if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_settings') THEN

        -- Enable RLS
        ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

        -- Allow authenticated users to read non-sensitive settings (category != 'admin' OR explicitly public)
        CREATE POLICY "Authenticated users can read public app settings" ON public.app_settings
            FOR SELECT USING (
                (category IS NULL) OR (category <> 'admin') OR (coalesce((value::jsonb ->> 'public')::boolean, true))
            );

        -- Allow authenticated users to update settings they own (if you use a 'owner' key in value)
        CREATE POLICY "Authenticated users can update own settings" ON public.app_settings
            FOR UPDATE USING (
                -- allow update if the value JSON contains owner equal to auth.uid()
                (CASE WHEN (value IS NOT NULL AND trim(value) <> '') THEN
                    ( (value::jsonb ->> 'owner') = auth.uid() )
                 ELSE false END)
            );

        -- Allow admins (profiles.role = 'admin' or 'super_admin') to manage all settings
        CREATE POLICY "Admins can manage app settings" ON public.app_settings
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'super_admin')
                )
            );

        -- Grant basic permissions to authenticated role where appropriate
        GRANT SELECT ON public.app_settings TO authenticated;

    END IF;
END$$;
