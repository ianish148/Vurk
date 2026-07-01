-- 1. Add Streak and Daily tracking columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date date;

-- 2. Update complete_task_transaction RPC to handle streaks and daily bonuses
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
    v_last_active_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_today DATE := current_date;
    v_yesterday DATE := current_date - interval '1 day';
    v_is_first_task_today BOOLEAN := false;
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

    -- Fetch current streak info
    SELECT last_active_date, current_streak, longest_streak 
    INTO v_last_active_date, v_current_streak, v_longest_streak
    FROM profiles WHERE id = p_user_id;

    -- 2. Streak Logic & Daily Bonus
    IF v_last_active_date IS NULL OR v_last_active_date < v_today THEN
        v_is_first_task_today := true;
        
        -- If active yesterday, increment streak. Otherwise, reset to 1.
        IF v_last_active_date = v_yesterday THEN
            v_current_streak := COALESCE(v_current_streak, 0) + 1;
        ELSE
            v_current_streak := 1;
        END IF;

        IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
            v_longest_streak := v_current_streak;
        END IF;

        UPDATE profiles
        SET last_active_date = v_today,
            current_streak = v_current_streak,
            longest_streak = v_longest_streak
        WHERE id = p_user_id;
    END IF;

    -- 3. Insert XP Transaction
    IF p_xp_reward > 0 THEN
        INSERT INTO xp_transactions (user_id, amount, reason, source_type, source_id, idempotency_key, created_by)
        VALUES (p_user_id, p_xp_reward, 'TASK_COMPLETION', 'user_tasks', p_user_task_id, v_idempotency_key, p_user_id);
    END IF;

    -- 4. Insert Coin Transaction
    IF p_coin_reward > 0 THEN
        INSERT INTO coin_transactions (user_id, amount, reason, source_type, source_id, idempotency_key, created_by)
        VALUES (p_user_id, p_coin_reward, 'TASK_COMPLETION', 'user_tasks', p_user_task_id, v_idempotency_key, p_user_id);
    END IF;

    -- 5. Insert Daily Bonus Transaction (15 coins) if first task today
    IF v_is_first_task_today THEN
        INSERT INTO coin_transactions (user_id, amount, reason, source_type, source_id, idempotency_key, created_by)
        VALUES (p_user_id, 15, 'STREAK_BONUS', 'user_tasks', p_user_task_id, v_idempotency_key || '_bonus', p_user_id);
    END IF;

    -- 6. Create Activity Log & Event
    INSERT INTO events (type, actor_id, payload)
    VALUES (
        'TaskCompleted', 
        p_user_id, 
        jsonb_build_object('entity_type', 'user_tasks', 'entity_id', p_user_task_id, 'xp_awarded', p_xp_reward, 'coins_awarded', p_coin_reward, 'streak_bonus_awarded', v_is_first_task_today)
    );
    
    INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, metadata)
    VALUES (
        p_user_id, 
        'task_completed', 
        'user_tasks', 
        p_user_task_id, 
        jsonb_build_object('xp_awarded', p_xp_reward, 'coins_awarded', p_coin_reward, 'streak_bonus_awarded', v_is_first_task_today)
    );
END;
$$;
