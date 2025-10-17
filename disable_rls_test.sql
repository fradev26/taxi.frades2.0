-- Tijdelijk RLS uitschakelen om INSERT te testen
-- LET OP: Dit is alleen voor testing - zet RLS daarna weer aan!

-- Schakel RLS tijdelijk uit
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Test INSERT
-- Na de test: zet RLS weer aan met:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;