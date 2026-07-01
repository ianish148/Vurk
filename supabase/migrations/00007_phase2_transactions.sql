-- Phase 2.5: Transaction Architecture & Phase 3 Preparation

-- 1. Create Enums for Transaction Reasons
DO $$ BEGIN
    CREATE TYPE transaction_reason AS ENUM (
        'TASK_COMPLETION',
        'STREAK_BONUS',
        'ROADMAP_COMPLETION',
        'ADMIN_ADJUSTMENT',
        'AI_VERIFICATION',
        'REFUND',
        'PENALTY',
        'STORE_PURCHASE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create XP Transactions Table
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Can be positive or negative
    reason transaction_reason NOT NULL,
    source_type TEXT NOT NULL, -- e.g., 'user_tasks'
    source_id UUID, -- ID of the related entity
    idempotency_key TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin or System who triggered it
    
    UNIQUE(user_id, idempotency_key) -- Idempotency / Prevent duplicates
);

-- 3. Create Coin Transactions Table
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Can be positive or negative
    reason transaction_reason NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID,
    idempotency_key TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    UNIQUE(user_id, idempotency_key)
);

-- 4. Enable RLS
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view their own xp transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view their own coin transactions" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
-- Inserts/Updates are handled by Server Actions (Service Role) or RPC, no direct client insert allowed.

-- 5. Triggers to maintain cached totals on profiles
CREATE OR REPLACE FUNCTION update_profile_xp_cache()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE profiles
    SET total_xp = COALESCE(total_xp, 0) + NEW.amount
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_xp_transaction_insert ON xp_transactions;
CREATE TRIGGER on_xp_transaction_insert
    AFTER INSERT ON xp_transactions
    FOR EACH ROW EXECUTE FUNCTION update_profile_xp_cache();

CREATE OR REPLACE FUNCTION update_profile_coins_cache()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE profiles
    SET coins = COALESCE(coins, 0) + NEW.amount
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_coin_transaction_insert ON coin_transactions;
CREATE TRIGGER on_coin_transaction_insert
    AFTER INSERT ON coin_transactions
    FOR EACH ROW EXECUTE FUNCTION update_profile_coins_cache();

-- 6. Atomic Task Verification RPC
-- This ensures that updating task status and awarding XP/Coins happens in a single atomic transaction.
CREATE OR REPLACE FUNCTION complete_task_transaction(
    p_user_task_id UUID,
    p_user_id UUID,
    p_submitted_text TEXT,
    p_submitted_files TEXT[],
    p_xp_reward INTEGER,
    p_coin_reward INTEGER
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_idempotency_key TEXT;
BEGIN
    -- Set Idempotency Key based on user_task_id
    v_idempotency_key := 'task_completion_' || p_user_task_id::text;

    -- 1. Update Task Status
    UPDATE user_tasks
    SET 
        status = 'completed',
        submitted_content = p_submitted_text,
        submitted_files = p_submitted_files,
        completed_at = now()
    WHERE id = p_user_task_id AND user_id = p_user_id AND status != 'completed';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found or already completed';
    END IF;

    -- 2. Insert XP Transaction
    IF p_xp_reward > 0 THEN
        INSERT INTO xp_transactions (user_id, amount, reason, source_type, source_id, idempotency_key, created_by)
        VALUES (p_user_id, p_xp_reward, 'TASK_COMPLETION', 'user_tasks', p_user_task_id, v_idempotency_key, p_user_id);
    END IF;

    -- 3. Insert Coin Transaction
    IF p_coin_reward > 0 THEN
        INSERT INTO coin_transactions (user_id, amount, reason, source_type, source_id, idempotency_key, created_by)
        VALUES (p_user_id, p_coin_reward, 'TASK_COMPLETION', 'user_tasks', p_user_task_id, v_idempotency_key, p_user_id);
    END IF;

    -- 4. Create Activity Log & Event
    INSERT INTO system_events (type, user_id, entity_type, entity_id, payload)
    VALUES (
        'TaskCompleted', 
        p_user_id, 
        'user_tasks', 
        p_user_task_id, 
        jsonb_build_object('xp_awarded', p_xp_reward, 'coins_awarded', p_coin_reward)
    );
    
    -- If any of the above fails, Postgres automatically rolls back the entire transaction.
END;
$$;

-- 7. Phase 3 Preparation (AI Verification Tables)
CREATE TABLE IF NOT EXISTS ai_verification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES ai_verification_jobs(id) ON DELETE CASCADE,
    confidence_score NUMERIC(5,2) NOT NULL, -- e.g., 95.50
    decision TEXT NOT NULL CHECK (decision IN ('auto_approve', 'manual_review', 'reject')),
    feedback_markdown TEXT,
    raw_ai_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS manual_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);
