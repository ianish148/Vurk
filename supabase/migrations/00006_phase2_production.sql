-- ====================================================================================
-- VURK - Phase 2 Schema: Production Architecture
-- Features: Core Engine + Growth/Scale Prep (Soft Deletes, Multi-Tenancy, Events)
-- ====================================================================================

-- 1. CLEANUP (For iterative dev only)
DROP TABLE IF EXISTS ai_usage_logs CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS roadmap_reviews CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS background_jobs CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_notes CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS user_roadmaps CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS roadmap_prerequisites CASCADE;
DROP TABLE IF EXISTS roadmap_tasks CASCADE;
DROP TABLE IF EXISTS roadmap_modules CASCADE;
DROP TABLE IF EXISTS roadmap_milestones CASCADE;
DROP TABLE IF EXISTS roadmap_phases CASCADE;
DROP TABLE IF EXISTS roadmap_templates CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- 2. ENUMS (Reused or Added)
DO $$ BEGIN CREATE TYPE visibility_level AS ENUM ('private', 'friends', 'public'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE workspace_type AS ENUM ('personal', 'team', 'college', 'company'); EXCEPTION WHEN duplicate_object THEN null; END $$;
-- Assuming others exist from 00004, but we should recreate them just in case if this script runs standalone.
-- (Supabase might complain if they exist, so we use IF NOT EXISTS workaround or just assume they exist from 00004. Let's drop them first to be safe).

DROP TYPE IF EXISTS roadmap_difficulty CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS user_roadmap_status CASCADE;
DROP TYPE IF EXISTS missed_task_strategy CASCADE;
DROP TYPE IF EXISTS ai_verification_type CASCADE;
DROP TYPE IF EXISTS submission_requirement_type CASCADE;

CREATE TYPE roadmap_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE task_type AS ENUM ('reading', 'coding', 'assignment', 'pdf_upload', 'image_upload', 'quiz', 'research', 'github', 'website', 'video', 'custom');
CREATE TYPE task_status AS ENUM ('locked', 'available', 'in_progress', 'submitted', 'pending_verification', 'verified', 'completed', 'rejected');
CREATE TYPE user_roadmap_status AS ENUM ('active', 'completed', 'abandoned', 'paused');
CREATE TYPE missed_task_strategy AS ENUM ('carry_forward', 'auto_reschedule', 'mark_skipped', 'manual_recovery');
CREATE TYPE ai_verification_type AS ENUM ('ocr', 'code_review', 'essay', 'image_analysis', 'research_summary', 'quiz_evaluation');
CREATE TYPE submission_requirement_type AS ENUM ('none', 'text', 'photo', 'multiple_photos', 'pdf', 'github', 'website', 'video', 'voice', 'mixed');

-- 3. SCALE PREP: MULTI-TENANCY & PREFERENCES
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type workspace_type DEFAULT 'personal'::workspace_type NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    daily_study_target_minutes INTEGER DEFAULT 60,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    weekend_scheduling BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SCALE PREP: EVENT-DRIVEN ARCHITECTURE & FLAGS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- e.g., 'TaskCompleted', 'RoadmapStarted'
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT false NOT NULL,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CORE: ROADMAP TEMPLATES (with Full-Text Search)
CREATE TABLE roadmap_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    version INTEGER DEFAULT 1 NOT NULL,
    is_latest BOOLEAN DEFAULT true NOT NULL,
    difficulty roadmap_difficulty DEFAULT 'medium'::roadmap_difficulty,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    total_xp_available INTEGER DEFAULT 0,
    estimated_duration_weeks INTEGER DEFAULT 0,
    required_skills TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    missed_strategy missed_task_strategy DEFAULT 'carry_forward'::missed_task_strategy NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, coalesce(name, '') || ' ' || coalesce(description, ''))) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE roadmap_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    requires_roadmap_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(roadmap_id, requires_roadmap_id)
);

-- 6. CORE: ROADMAP HIERARCHY (with Soft Deletes)
CREATE TABLE roadmap_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE roadmap_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES roadmap_phases(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE roadmap_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES roadmap_milestones(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES roadmap_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type task_type DEFAULT 'reading'::task_type NOT NULL,
    difficulty roadmap_difficulty DEFAULT 'easy'::roadmap_difficulty NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    estimated_time_minutes INTEGER DEFAULT 15 NOT NULL,
    xp_reward INTEGER DEFAULT 10 NOT NULL,
    coin_reward INTEGER DEFAULT 0 NOT NULL,
    objectives TEXT[] DEFAULT '{}',
    resources JSONB DEFAULT '[]'::jsonb,
    
    submission_req submission_requirement_type DEFAULT 'none'::submission_requirement_type NOT NULL,
    requires_ai_verification BOOLEAN DEFAULT false NOT NULL,
    ai_verification_type ai_verification_type,
    ai_verification_prompt TEXT,

    order_index INTEGER NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(description, ''))) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    depends_on_task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(task_id, depends_on_task_id)
);

-- 7. CORE: USER ENGINE
CREATE TABLE user_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    template_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    status user_roadmap_status DEFAULT 'active'::user_roadmap_status NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    paused_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, template_id)
);

CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user_roadmap_id UUID REFERENCES user_roadmaps(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    status task_status DEFAULT 'locked'::task_status NOT NULL,
    assigned_date DATE,
    due_date DATE,
    
    submitted_content TEXT,
    submitted_files TEXT[],
    feedback_notes TEXT,
    ai_verification_score INTEGER,
    ai_verification_reasoning TEXT,
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, task_id)
);

-- 8. SCALE PREP: MEDIA METADATA & AI LOGS
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256_hash TEXT,
    original_filename TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. SCALE PREP: COMMUNITY & GAMIFICATION
CREATE TABLE roadmap_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(roadmap_id, user_id)
);

-- Ensure RLS is enabled on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_reviews ENABLE ROW LEVEL SECURITY;

-- 10. INDEXES
CREATE INDEX idx_search_roadmap ON roadmap_templates USING GIN (search_vector);
CREATE INDEX idx_search_tasks ON roadmap_tasks USING GIN (search_vector);
CREATE INDEX idx_events_created ON events(created_at DESC);
CREATE INDEX idx_user_tasks_due ON user_tasks(due_date);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- System/Admin (Service Role) bypasses RLS inherently.
-- User standard policies:
CREATE POLICY "Roadmaps are viewable" ON roadmap_templates FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Tasks are viewable" ON roadmap_tasks FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users own roadmaps" ON user_roadmaps FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users own user_tasks" ON user_tasks FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
