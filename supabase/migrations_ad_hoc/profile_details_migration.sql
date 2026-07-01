-- ============================================================
-- Add Missing Columns to Profiles
-- ============================================================

-- Add 'name' just in case it was missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;

-- Add 'age' and 'year_of_study'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year_of_study text;
