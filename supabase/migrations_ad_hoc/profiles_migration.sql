-- ============================================================
-- Profiles Table Migration — run this in Supabase SQL Editor
-- ============================================================

-- 1. Add the username column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- 2. Make sure RLS is still correct (should be fine, but just in case)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );
