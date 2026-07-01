-- ============================================================
-- Certificates Migration — run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    issuer text,
    issue_date date,
    file_url text NOT NULL,
    file_path text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Users can manage their own certificates." ON public.certificates;
DROP POLICY IF EXISTS "Certificates are publicly viewable." ON public.certificates;

-- 4. Create policies
CREATE POLICY "Users can manage their own certificates."
    ON public.certificates FOR ALL
    USING ( auth.uid() = user_id )
    WITH CHECK ( auth.uid() = user_id );

-- 5. Storage bucket (create manually in Dashboard OR run this)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies — drop first so it's idempotent
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Certificates are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own certificates" ON storage.objects;

CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Certificates are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'certificates');

CREATE POLICY "Users can delete their own certificates"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'certificates');
