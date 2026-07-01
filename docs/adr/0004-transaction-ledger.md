# ADR 0004: Double-Entry Transaction Ledger

## Status
Accepted

## Context
Vurk gamifies the learning process by awarding XP and Coins when users complete tasks, maintain streaks, or finish roadmaps. Initially, these rewards were granted by directly updating `total_xp` and `coins` columns on the `profiles` table. As the system scales, directly updating aggregate columns creates several risks: race conditions, lack of auditability, inability to reverse incorrect awards, and difficulty diagnosing bugs (e.g., "Why does this user have 5000 XP?").

## Options Considered
1. **Direct Profile Updates:** Simple and fast. No historical tracking. Fails under scrutiny if users dispute rewards or if bugs duplicate task submissions.
2. **Event Sourcing:** Store every action as an event and derive the entire application state (including balances) by replaying events. Highly robust, but introduces significant architectural complexity and read performance challenges.
3. **Double-Entry Transaction Ledger + Cached Totals:** Treat XP and Coins like a financial system. Every change is an immutable row in a transaction table (`xp_transactions`, `coin_transactions`). The `profiles` table maintains a cached total updated strictly via database triggers.

## Decision
We chose the **Double-Entry Transaction Ledger + Cached Totals**. We implemented idempotent constraints (`UNIQUE(user_id, idempotency_key)`) to absolutely prevent duplicate reward distribution. We also wrapped task completion inside an atomic PostgreSQL RPC (`complete_task_transaction`) to guarantee that tasks and transactions succeed or fail together.

## Consequences
- **Positive:** Complete auditability. Easy to build features like XP history, refunds, penalties, and admin adjustments. Impossible to duplicate rewards due to race conditions or network retries.
- **Negative:** Increased database storage (two new rows per task completion). Slightly increased write latency (managed efficiently within a single Postgres transaction).
