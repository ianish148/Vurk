-- Vurk MVP Database Schema (Idempotent)

-- Clean up existing tables and triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.verifications CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username text UNIQUE,
    name text,
    college text,
    branch text,
    xp integer DEFAULT 0,
    coins integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Roadmaps Table
CREATE TABLE public.roadmaps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    duration text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own roadmaps."
    ON public.roadmaps FOR ALL
    USING ( auth.uid() = user_id );

-- Tasks Table
CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id uuid REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    task_type text NOT NULL, -- 'daily', 'weekly', 'monthly'
    deadline timestamp with time zone,
    xp_reward integer DEFAULT 10,
    status text DEFAULT 'pending', -- 'pending', 'submitted', 'approved', 'rejected'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks of their roadmaps."
    ON public.tasks FOR ALL
    USING ( 
        EXISTS (
            SELECT 1 FROM public.roadmaps
            WHERE roadmaps.id = tasks.roadmap_id
            AND roadmaps.user_id = auth.uid()
        )
    );

-- Submissions Table
CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content_url text, -- Supabase Storage URL or external link
    notes text,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own submissions."
    ON public.submissions FOR ALL
    USING ( auth.uid() = user_id );

-- Verifications Table (AI Verification results)
CREATE TABLE public.verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    ai_score integer,
    completion_percentage integer,
    feedback text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read verifications for their submissions."
    ON public.verifications FOR SELECT
    USING ( 
        EXISTS (
            SELECT 1 FROM public.submissions
            WHERE submissions.id = verifications.submission_id
            AND submissions.user_id = auth.uid()
        )
    );

-- Insert policy for system/AI (if using Service Role key) or user (if client side AI call)
-- For MVP, since the user provides their own Gemini key and runs it client-side or via a user-authenticated server route:
CREATE POLICY "Users can insert verifications for their submissions."
    ON public.verifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.submissions
            WHERE submissions.id = verifications.submission_id
            AND submissions.user_id = auth.uid()
        )
    );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup Storage Bucket for submissions
-- You should create a bucket named 'submissions' in Supabase Storage and set it to public (or private depending on preference, public is easier for MVP)
