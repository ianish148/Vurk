-- Phase 3: AI and Storage Integrations

-- 1. Update user_preferences to hold the Gemini API Key
-- For a production app this should ideally be encrypted with pgcrypto or Supabase Vault,
-- but for Vurk MVP we store it as text and protect it strictly with RLS.
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;

-- 2. Create the Storage Bucket for Submissions
-- Note: Requires Supabase Storage schema to be available. We use a raw insert to the storage.buckets table.
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage RLS Policies
-- Users can only upload files to their own folder, named after their user ID: 'submissions/{user_id}/...'
-- Note: These policies require the storage extension.

CREATE POLICY "Users can upload their own submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: The server queue worker (using Service Role) bypasses RLS, so it can read files to pass to Gemini.

-- 4. Create AI Usage Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES ai_verification_jobs(id) ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view their own ai usage" ON ai_usage_logs FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
