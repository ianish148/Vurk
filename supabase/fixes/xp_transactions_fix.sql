-- Fix the xp_transactions schema by replacing it with the newer Phase 2 schema
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS coin_transactions CASCADE;

CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason transaction_reason NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID,
    idempotency_key TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(user_id, idempotency_key)
);

CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason transaction_reason NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID,
    idempotency_key TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(user_id, idempotency_key)
);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own xp transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own coin transactions" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);

-- Re-attach the caching triggers
CREATE TRIGGER on_xp_transaction_insert
    AFTER INSERT ON xp_transactions
    FOR EACH ROW EXECUTE FUNCTION update_profile_xp_cache();

CREATE TRIGGER on_coin_transaction_insert
    AFTER INSERT ON coin_transactions
    FOR EACH ROW EXECUTE FUNCTION update_profile_coins_cache();
