-- Fix the complete_task_transaction RPC by replacing the invalid system_events table reference
-- with the correct tables: events and activity_logs

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
    INSERT INTO events (type, actor_id, payload)
    VALUES (
        'TaskCompleted', 
        p_user_id, 
        jsonb_build_object('entity_type', 'user_tasks', 'entity_id', p_user_task_id, 'xp_awarded', p_xp_reward, 'coins_awarded', p_coin_reward)
    );
    
    INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, metadata)
    VALUES (
        p_user_id, 
        'task_completed', 
        'user_tasks', 
        p_user_task_id, 
        jsonb_build_object('xp_awarded', p_xp_reward, 'coins_awarded', p_coin_reward)
    );
END;
$$;
