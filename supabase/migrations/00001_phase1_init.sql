-- ====================================================================================
-- VURK - Phase 1 Initial Schema
-- Features: Profiles, XP & Coins Transactons, Activity & Audit Logs, Friends, Base Enums
-- ====================================================================================

-- 0. CLEANUP EXISTING TABLES (To prevent 'already exists' errors)
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS daily_completion_logs CASCADE;
DROP TABLE IF EXISTS coin_transactions CASCADE;
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS friend_status CASCADE;

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'super_admin');
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'blocked', 'rejected', 'canceled');

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    avatar_url TEXT,
    profile_completed BOOLEAN DEFAULT false NOT NULL,
    
    -- Onboarding Data
    age INTEGER,
    country TEXT,
    timezone TEXT,
    college TEXT,
    branch TEXT,
    semester INTEGER,
    graduation_year INTEGER,
    current_cgpa NUMERIC(4,2),
    target_cgpa NUMERIC(4,2),
    career_goal TEXT,
    interests TEXT[],
    japanese_level TEXT,
    programming_languages TEXT[],
    github_username TEXT,
    linkedin TEXT,
    goals TEXT[],
    
    -- Encrypted AI Key (encrypted via server backend)
    encrypted_ai_key TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for profiles
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. XP TRANSACTIONS
-- Current XP is SUM(amount) WHERE user_id = ?
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source TEXT, -- e.g., 'task_123'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COIN TRANSACTIONS
-- Current Coins is SUM(amount) WHERE user_id = ?
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. DAILY COMPLETION LOGS (For Streak System)
-- Streaks are calculated by analyzing continuous dates where streak_maintained is true
CREATE TABLE daily_completion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0 NOT NULL,
    streak_maintained BOOLEAN DEFAULT false NOT NULL,
    freeze_used BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, log_date)
);

-- 7. ACTIVITY LOGS
-- Public/Friends feed data (e.g. "Anish completed a task")
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL, -- e.g., 'task_completed', 'roadmap_started'
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. AUDIT LOGS
-- Security and debugging trails
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- User who performed the action
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. FRIENDS
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status friend_status DEFAULT 'pending'::friend_status NOT NULL,
    action_user_id UUID REFERENCES profiles(id) NOT NULL, -- Who performed the last status change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure user cannot friend themselves
    CONSTRAINT no_self_friend CHECK (requester_id != addressee_id)
);

-- Ensure only one relationship row exists per pair regardless of who requested
CREATE UNIQUE INDEX unique_friendship ON friends (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE TRIGGER set_friends_updated_at
BEFORE UPDATE ON friends
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles (needed for friends/leaderboard), but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- XP & Coins: Users can view all (for leaderboards), but ONLY the system (Service Role) can insert/update
CREATE POLICY "XP is viewable by everyone" ON xp_transactions FOR SELECT USING (true);
CREATE POLICY "Coins are viewable by everyone" ON coin_transactions FOR SELECT USING (true);

-- Daily Logs: Users can view their own, System handles inserts/updates
CREATE POLICY "Users can view own daily logs" ON daily_completion_logs FOR SELECT USING (auth.uid() = user_id);

-- Activity Logs: Users can view all (for feeds), System or Trigger handles inserts
CREATE POLICY "Activity logs are viewable by everyone" ON activity_logs FOR SELECT USING (true);

-- Audit Logs: Only Super Admins / Service Role can read or write
-- (Handled automatically since no user policies exist for it)

-- Friends: Users can view their own friendships, insert/update where they are involved
CREATE POLICY "Users can view their friendships" ON friends FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can insert friendships" ON friends FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their friendships" ON friends FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_xp_user_id ON xp_transactions(user_id);
CREATE INDEX idx_coins_user_id ON coin_transactions(user_id);
CREATE INDEX idx_daily_logs_user ON daily_completion_logs(user_id, log_date);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_friends_requester ON friends(requester_id);
CREATE INDEX idx_friends_addressee ON friends(addressee_id);

-- 12. STORAGE BUCKETS (Executed as superuser, or via dashboard)
-- Note: You may need to create these manually via the Supabase UI if running this script fails due to permissions.
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('research', 'research', false) ON CONFLICT DO NOTHING;

-- Avatars Bucket Policy (Public read, authenticated own uploads)
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Anyone can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);
