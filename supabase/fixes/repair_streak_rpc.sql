-- Create RPC function to repair a streak for 150 coins
CREATE OR REPLACE FUNCTION repair_user_streak(p_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_last_active_date DATE;
    v_today DATE := current_date;
    v_yesterday DATE := current_date - interval '1 day';
    v_current_coins INTEGER;
    v_current_streak INTEGER;
BEGIN
    -- Get user stats
    SELECT last_active_date, coins, current_streak
    INTO v_last_active_date, v_current_coins, v_current_streak
    FROM profiles 
    WHERE id = p_user_id;

    -- If streak is already intact (active today or yesterday)
    IF v_last_active_date >= v_yesterday THEN
        RAISE EXCEPTION 'Streak is already intact.';
    END IF;

    -- Ensure they actually had a streak to repair (optional logic, but makes sense)
    IF COALESCE(v_current_streak, 0) = 0 THEN
        RAISE EXCEPTION 'No active streak to repair.';
    END IF;

    -- If user doesn't have enough coins
    IF COALESCE(v_current_coins, 0) < 150 THEN
        RAISE EXCEPTION 'Not enough coins. You need 150 coins to repair your streak.';
    END IF;

    -- Deduct coins
    INSERT INTO coin_transactions (user_id, amount, reason, source_type, idempotency_key, created_by)
    VALUES (p_user_id, -150, 'STORE_PURCHASE', 'streak_repair', 'streak_repair_' || extract(epoch from now())::text, p_user_id);

    -- Update last_active_date to yesterday so next task completed increments it
    UPDATE profiles
    SET last_active_date = v_yesterday
    WHERE id = p_user_id;
END;
$$;
