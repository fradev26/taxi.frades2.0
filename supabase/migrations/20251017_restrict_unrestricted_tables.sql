-- Migration: Restrict currently unrestricted tables
-- Purpose: enable row level security and add policies for profiles, chauffeurs, and admin_settings
-- Run via supabase CLI, psql, or the provided GitHub Actions workflow

BEGIN;

-- Helper: only run if table exists
-- === profiles ===
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

    -- Remove existing similarly-named policies (safe to re-run)
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'authenticated_can_select_profiles') THEN
      EXECUTE 'DROP POLICY authenticated_can_select_profiles ON public.profiles';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'profiles_can_update_own') THEN
      EXECUTE 'DROP POLICY profiles_can_update_own ON public.profiles';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_can_manage_profiles') THEN
      EXECUTE 'DROP POLICY admins_can_manage_profiles ON public.profiles';
    END IF;

    -- Allow authenticated users to SELECT profiles (non-public access)
    EXECUTE $q$
      CREATE POLICY authenticated_can_select_profiles
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (true);
    $q$;

    -- Allow users to update their own profile row
    EXECUTE $q$
      CREATE POLICY profiles_can_update_own
        ON public.profiles
        FOR UPDATE
        USING (id = auth.uid());
    $q$;

    -- Allow admins to manage all profiles (assumes profiles.role exists)
    EXECUTE $q$
      CREATE POLICY admins_can_manage_profiles
        ON public.profiles
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'super_admin')
          )
        );
    $q$;

    -- Grant select to authenticated role (keeps console access consistent)
    EXECUTE 'GRANT SELECT ON public.profiles TO authenticated';
  END IF;
END$$;

-- === chauffeurs ===
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chauffeurs') THEN
    EXECUTE 'ALTER TABLE public.chauffeurs ENABLE ROW LEVEL SECURITY';

    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'authenticated_can_select_chauffeurs') THEN
      EXECUTE 'DROP POLICY authenticated_can_select_chauffeurs ON public.chauffeurs';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'chauffeurs_can_update_own') THEN
      EXECUTE 'DROP POLICY chauffeurs_can_update_own ON public.chauffeurs';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_can_manage_chauffeurs') THEN
      EXECUTE 'DROP POLICY admins_can_manage_chauffeurs ON public.chauffeurs';
    END IF;

    -- Allow authenticated users to read chauffeurs (for public UI lists)
    EXECUTE $q$
      CREATE POLICY authenticated_can_select_chauffeurs
        ON public.chauffeurs
        FOR SELECT
        TO authenticated
        USING (true);
    $q$;

    -- If chauffeurs rows include an 'owner' or 'user_id' column, allow owner to update their own row
    -- This policy uses 'user_id' as a common owner field; adjust if your schema differs.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chauffeurs' AND column_name='user_id') THEN
      EXECUTE $q$
        CREATE POLICY chauffeurs_can_update_own
          ON public.chauffeurs
          FOR UPDATE
          USING ((user_id IS NOT NULL AND user_id = auth.uid()));
      $q$;
    END IF;

    -- Admins can manage chauffeurs
    EXECUTE $q$
      CREATE POLICY admins_can_manage_chauffeurs
        ON public.chauffeurs
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'super_admin')
          )
        );
    $q$;

    EXECUTE 'GRANT SELECT ON public.chauffeurs TO authenticated';
  END IF;
END$$;

-- === admin_settings ===
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_settings') THEN
    EXECUTE 'ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY';

    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_can_manage_admin_settings') THEN
      EXECUTE 'DROP POLICY admins_can_manage_admin_settings ON public.admin_settings';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'authenticated_can_select_admin_settings') THEN
      EXECUTE 'DROP POLICY authenticated_can_select_admin_settings ON public.admin_settings';
    END IF;

    -- Only admins may SELECT/INSERT/UPDATE/DELETE admin_settings
    EXECUTE $q$
      CREATE POLICY admins_can_manage_admin_settings
        ON public.admin_settings
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'super_admin')
          )
        );
    $q$;

    -- Revoke public SELECT if any (ensure only authenticated/admins can read based on policies)
    EXECUTE 'REVOKE SELECT ON public.admin_settings FROM public';
  END IF;
END$$;

COMMIT;
