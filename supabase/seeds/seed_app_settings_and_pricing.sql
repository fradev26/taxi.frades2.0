-- Seed and setup for app_settings and pricing_overrides
-- Paste this entire file into the Supabase SQL editor and run it (or run with psql using a service-role connection).
-- It will:
-- 1) Create `app_settings` table if missing
-- 2) Create `update_updated_at_column()` helper if missing
-- 3) Enable RLS and create safe policies for app_settings
-- 4) Insert default pricing keys and a `pricing_overrides` JSON blob

BEGIN;

-- 1) Create table if not exists
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Create or ensure update_updated_at_column() exists (used by triggers)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END$$;

-- Attach trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_app_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_app_settings_updated_at
      BEFORE UPDATE ON public.app_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 3) Enable RLS and create policies (idempotent-ish)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (safe to re-run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'authenticated_users_can_read_public_app_settings') THEN
    EXECUTE 'DROP POLICY "Authenticated users can read public app settings" ON public.app_settings';
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END$$;

-- Create policies
-- Allow authenticated users to read public (non-admin) settings
CREATE POLICY "Authenticated users can read public app settings"
  ON public.app_settings
  FOR SELECT USING (
    (category IS NULL) OR (category <> 'admin') OR (coalesce((value::jsonb ->> 'public')::boolean, true))
  );

-- Allow authenticated users to update own settings when owner is present in JSON
CREATE POLICY "Authenticated users can update own settings"
  ON public.app_settings
  FOR UPDATE USING (
    (CASE WHEN (value IS NOT NULL AND trim(value) <> '') THEN
      ( (value::jsonb ->> 'owner') = auth.uid() )
     ELSE false END)
  );

-- Admins (profiles.role = 'admin' or 'super_admin') can manage all settings
-- Note: this policy assumes you have a public.profiles table with role column
CREATE POLICY "Admins can manage app settings"
  ON public.app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'super_admin')
    )
  );

GRANT SELECT ON public.app_settings TO authenticated;

-- 4) Insert default pricing keys
-- Keep values as text for compatibility with existing code
INSERT INTO public.app_settings (key, value, description, category)
VALUES
  ('base_fare', '5.00', 'Base fare for all rides in EUR', 'pricing'),
  ('price_per_km', '2.50', 'Price per kilometer in EUR', 'pricing'),
  ('night_surcharge', '1.25', 'Night surcharge multiplier', 'pricing')
ON CONFLICT (key) DO NOTHING;

-- 5) Insert a pricing_overrides JSON blob derived from PRICING_CONFIG
-- This JSON contains: baseRates, surcharges and settings (currency, taxRate, roundingPrecision, minimumBookingTime)
INSERT INTO public.app_settings (key, value, description, category)
VALUES (
  'pricing_overrides',
  $$
  {
    "baseRates": {
      "standard": {"base": 5.50, "perKm": 1.85, "perMinute": 0.35, "minimum": 12.50},
      "luxury": {"base": 8.50, "perKm": 2.75, "perMinute": 0.55, "minimum": 18.00},
      "minibus": {"base": 12.00, "perKm": 2.25, "perMinute": 0.45, "minimum": 25.00},
      "suv": {"base": 7.00, "perKm": 2.15, "perMinute": 0.45, "minimum": 15.00}
    },
    "surcharges": {
      "nightTime": {"factor": 1.25, "hours": [22,6], "description": "Nachttarief (22:00 - 06:00)"},
      "weekend": {"factor": 1.15, "days": [0,6], "description": "Weekend toeslag"},
      "holiday": {"factor": 1.35, "description": "Feestdag toeslag"},
      "rushHour": {"factor": 1.20, "timeRanges": [[7,9],[17,19]], "days": [1,2,3,4,5], "description": "Spitsuur toeslag (07:00-09:00, 17:00-19:00)"},
      "airportPickup": {"factor": 1.10, "description": "Luchthaven ophaalservice"},
      "shortDistance": {"factor": 1.50, "description": "Korte afstand toeslag (< 3km)"}
    },
    "settings": {"currency": "EUR", "taxRate": 0.21, "roundingPrecision": 2, "minimumBookingTime": 120}
  }
  $$,
  'Serialized pricing overrides (JSON)',
  'pricing'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

COMMIT;

-- Notes:
-- - If you rely on a different admin policy (for example an email-domain based policy), adjust the "Admins can manage app settings" policy accordingly.
-- - If you already have a profiles table and admin rows, the policies above will enable admin access. If not, create or update a profile row for your admin account.
-- - After running this, test reading/writing from your app as an admin user and as a normal authenticated user.
