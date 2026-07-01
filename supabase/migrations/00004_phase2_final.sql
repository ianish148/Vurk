-- ====================================================================================
-- VURK - Phase 2 Schema: Final Architecture
-- Features: Roadmap Versioning, AI Hooks, Rich Task States, Deep Hierarchy,
--           Gamification Hooks, Smart Scheduling, Background Jobs
-- ====================================================================================

-- 1. CLEANUP (For iterative dev only)
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

DROP TYPE IF EXISTS roadmap_difficulty CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS user_roadmap_status CASCADE;
DROP TYPE IF EXISTS missed_task_strategy CASCADE;
DROP TYPE IF EXISTS ai_verification_type CASCADE;
DROP TYPE IF EXISTS submission_requirement_type CASCADE;

-- 2. ENUMS
CREATE TYPE roadmap_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE task_type AS ENUM ('reading', 'coding', 'assignment', 'pdf_upload', 'image_upload', 'quiz', 'research', 'github', 'website', 'video', 'custom');
CREATE TYPE task_status AS ENUM ('locked', 'available', 'in_progress', 'submitted', 'pending_verification', 'verified', 'completed', 'rejected');
CREATE TYPE user_roadmap_status AS ENUM ('active', 'completed', 'abandoned', 'paused');
CREATE TYPE missed_task_strategy AS ENUM ('carry_forward', 'auto_reschedule', 'mark_skipped', 'manual_recovery');
CREATE TYPE ai_verification_type AS ENUM ('ocr', 'code_review', 'essay', 'image_analysis', 'research_summary', 'quiz_evaluation');
CREATE TYPE submission_requirement_type AS ENUM ('none', 'text', 'photo', 'multiple_photos', 'pdf', 'github', 'website', 'video', 'voice', 'mixed');


-- 3. BACKGROUND JOBS (Architecture for future scalable queue)
CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL, -- e.g., 'generate_daily_tasks', 'calculate_streaks', 'leaderboard_refresh'
    payload JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROADMAP TEMPLATES
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER set_roadmap_templates_updated_at BEFORE UPDATE ON roadmap_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. ROADMAP PREREQUISITES
CREATE TABLE roadmap_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    requires_roadmap_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(roadmap_id, requires_roadmap_id)
);

-- 6. ROADMAP HIERARCHY
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
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    estimated_time_minutes INTEGER DEFAULT 15 NOT NULL,
    xp_reward INTEGER DEFAULT 10 NOT NULL,
    coin_reward INTEGER DEFAULT 0 NOT NULL,
    objectives TEXT[] DEFAULT '{}',
    resources JSONB DEFAULT '[]'::jsonb, -- e.g. [{type: 'pdf', url: '...'}]
    
    -- Submission Requirements
    submission_req submission_requirement_type DEFAULT 'none'::submission_requirement_type NOT NULL,
    
    -- AI Verification Hooks
    requires_ai_verification BOOLEAN DEFAULT false NOT NULL,
    ai_verification_type ai_verification_type,
    ai_verification_prompt TEXT,

    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TASK DEPENDENCIES
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    depends_on_task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(task_id, depends_on_task_id)
);

-- 8. USER SUBSCRIPTIONS (USER_ROADMAPS)
CREATE TABLE user_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES roadmap_templates(id) ON DELETE CASCADE NOT NULL,
    status user_roadmap_status DEFAULT 'active'::user_roadmap_status NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    paused_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, template_id)
);
CREATE TRIGGER set_user_roadmaps_updated_at BEFORE UPDATE ON user_roadmaps FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9. USER TASKS (Rolling Generation & Smart Scheduler)
CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user_roadmap_id UUID REFERENCES user_roadmaps(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    status task_status DEFAULT 'locked'::task_status NOT NULL,
    assigned_date DATE,
    due_date DATE,
    
    -- Submissions
    submitted_content TEXT,
    submitted_files TEXT[],
    feedback_notes TEXT, -- Admin/AI feedback
    ai_verification_score INTEGER,
    ai_verification_reasoning TEXT,
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, task_id)
);

-- 10. DISCUSSIONS & NOTES
CREATE TABLE task_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    note_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES roadmap_tasks(id) ON DELETE CASCADE NOT NULL,
    comment_content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    action_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. GAMIFICATION HOOKS (For Phase 4)
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    xp_bonus INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT NOT NULL, -- e.g., 'daily', 'weekly', 'monthly'
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    coin_reward INTEGER DEFAULT 0 NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- 13. INDEXES
CREATE INDEX idx_rt_is_latest_final ON roadmap_templates(is_latest, status);
CREATE INDEX idx_rp_template_final ON roadmap_phases(template_id);
CREATE INDEX idx_rm_phase_final ON roadmap_milestones(phase_id);
CREATE INDEX idx_rmod_milestone_final ON roadmap_modules(milestone_id);
CREATE INDEX idx_rtask_module_final ON roadmap_tasks(module_id);
CREATE INDEX idx_ur_user_final ON user_roadmaps(user_id);
CREATE INDEX idx_ut_user_final ON user_tasks(user_id, status);
CREATE INDEX idx_notif_user_final ON notifications(user_id, is_read);
CREATE INDEX idx_jobs_status_final ON background_jobs(status, scheduled_for);

-- 14. ROW LEVEL SECURITY (RLS)
ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Public read for globals
CREATE POLICY "Globals viewable" ON roadmap_templates FOR SELECT USING (true);
CREATE POLICY "Prereqs viewable" ON roadmap_prerequisites FOR SELECT USING (true);
CREATE POLICY "Phases viewable" ON roadmap_phases FOR SELECT USING (true);
CREATE POLICY "Milestones viewable" ON roadmap_milestones FOR SELECT USING (true);
CREATE POLICY "Modules viewable" ON roadmap_modules FOR SELECT USING (true);
CREATE POLICY "Tasks viewable" ON roadmap_tasks FOR SELECT USING (true);
CREATE POLICY "Dependencies viewable" ON task_dependencies FOR SELECT USING (true);
CREATE POLICY "Badges viewable" ON badges FOR SELECT USING (true);
CREATE POLICY "Challenges viewable" ON challenges FOR SELECT USING (true);

-- User specifics
CREATE POLICY "Users own roadmaps" ON user_roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users own roadmaps insert" ON user_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own roadmaps update" ON user_roadmaps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users own tasks" ON user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users own tasks insert" ON user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own tasks update" ON user_tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users own notes" ON task_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own comments" ON task_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);

-- Note: System/Admin (Service Role) can bypass RLS for background jobs and system inserts.
