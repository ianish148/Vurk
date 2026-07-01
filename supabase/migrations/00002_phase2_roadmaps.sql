-- ====================================================================================
-- VURK - Phase 2 Schema: Roadmaps & Task Engine
-- Features: Roadmap Versioning, Hierarchy, Rich Task Types, Dynamic Generation
-- ====================================================================================

-- 1. CLEANUP (For iterative dev only)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS user_roadmaps CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS roadmap_tasks CASCADE;
DROP TABLE IF EXISTS roadmap_modules CASCADE;
DROP TABLE IF EXISTS roadmap_milestones CASCADE;
DROP TABLE IF EXISTS roadmap_phases CASCADE;
DROP TABLE IF EXISTS roadmap_templates CASCADE;

DROP TYPE IF EXISTS roadmap_difficulty CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS user_roadmap_status CASCADE;

-- 2. ENUMS
CREATE TYPE roadmap_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE task_type AS ENUM ('reading', 'coding', 'assignment', 'pdf_upload', 'image_upload', 'quiz', 'research', 'github', 'website', 'video', 'custom');
CREATE TYPE task_status AS ENUM ('locked', 'open', 'pending_verification', 'verified', 'rejected');
CREATE TYPE user_roadmap_status AS ENUM ('active', 'completed', 'abandoned', 'paused');

-- 3. ROADMAP TEMPLATES (Versioning Supported)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER set_roadmap_templates_updated_at BEFORE UPDATE ON roadmap_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. ROADMAP HIERARCHY: PHASES -> MILESTONES -> MODULES -> TASKS

CREATE TABLE roadmap_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE roadmap_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES roadmap_phases(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE roadmap_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID REFERENCES roadmap_milestones(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES roadmap_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type task_type DEFAULT 'reading'::task_type NOT NULL,
    difficulty roadmap_difficulty DEFAULT 'easy'::roadmap_difficulty NOT NULL,
    estimated_time_minutes INTEGER DEFAULT 15 NOT NULL,
    xp_reward INTEGER DEFAULT 10 NOT NULL,
    coin_reward INTEGER DEFAULT 0 NOT NULL,
    objectives TEXT[] DEFAULT '{}',
    resources JSONB DEFAULT '[]'::jsonb, -- e.g., [{"title": "Link", "url": "..."}]
    submission_requirements TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TASK DEPENDENCIES
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    depends_on_task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(task_id, depends_on_task_id)
);

-- 6. USER SUBSCRIPTIONS (USER_ROADMAPS)
CREATE TABLE user_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    status user_roadmap_status DEFAULT 'active'::user_roadmap_status NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, template_id) -- User can only subscribe to a specific version once
);
CREATE TRIGGER set_user_roadmaps_updated_at BEFORE UPDATE ON user_roadmaps FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. USER TASKS (Rolling Generation)
CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user_roadmap_id UUID REFERENCES user_roadmaps(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    status task_status DEFAULT 'locked'::task_status NOT NULL,
    assigned_date DATE, -- The date this task is assigned to the user
    due_date DATE, -- The date it is due
    submitted_content TEXT, -- Markdown, URL, etc.
    submitted_files TEXT[], -- URLs to storage
    feedback_notes TEXT, -- Admin/AI feedback
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, task_id)
);

-- 8. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'task_due', 'milestone_unlocked', 'verification_approved'
    is_read BOOLEAN DEFAULT false NOT NULL,
    action_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. INDEXES
CREATE INDEX idx_rt_is_latest ON roadmap_templates(is_latest, status);
CREATE INDEX idx_rp_template ON roadmap_phases(template_id);
CREATE INDEX idx_rm_phase ON roadmap_milestones(phase_id);
CREATE INDEX idx_rmod_milestone ON roadmap_modules(milestone_id);
CREATE INDEX idx_rtask_module ON roadmap_tasks(module_id);
CREATE INDEX idx_ur_user ON user_roadmaps(user_id);
CREATE INDEX idx_ut_user ON user_tasks(user_id, status);
CREATE INDEX idx_ut_user_roadmap ON user_tasks(user_roadmap_id);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);

-- 10. ROW LEVEL SECURITY (RLS)

ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public can read all template data
CREATE POLICY "Roadmaps are viewable by everyone" ON roadmap_templates FOR SELECT USING (true);
CREATE POLICY "Phases are viewable by everyone" ON roadmap_phases FOR SELECT USING (true);
CREATE POLICY "Milestones are viewable by everyone" ON roadmap_milestones FOR SELECT USING (true);
CREATE POLICY "Modules are viewable by everyone" ON roadmap_modules FOR SELECT USING (true);
CREATE POLICY "Tasks are viewable by everyone" ON roadmap_tasks FOR SELECT USING (true);
CREATE POLICY "Task Dependencies are viewable by everyone" ON task_dependencies FOR SELECT USING (true);

-- User specific data
CREATE POLICY "Users can view own roadmaps" ON user_roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON user_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON user_roadmaps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON user_tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- System/Admin (Service Role) can bypass RLS for inserts/updates across the board.
