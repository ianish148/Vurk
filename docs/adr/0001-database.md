# ADR 0001: Database Architecture and Supabase Integration

## Status
Accepted

## Context
Vurk requires a scalable, secure, and performant backend to handle complex relational data (users, roadmaps, tasks, submissions) and potentially heavy AI usage. The platform is intended to scale to thousands of users, teams, and organizations.

## Options Considered
1. **Custom Node.js/Express Backend + PostgreSQL:** Maximum flexibility, but requires significant boilerplate for auth, storage, and real-time features.
2. **Firebase/Firestore:** Excellent for real-time and rapid prototyping, but NoSQL is poorly suited for the deeply relational nature of Vurk (e.g., Roadmaps -> Phases -> Milestones -> Modules -> Tasks).
3. **Supabase (PostgreSQL):** Provides a managed Postgres database, out-of-the-box Auth, Storage, and Edge Functions, along with Row Level Security (RLS) and real-time capabilities.

## Decision
We chose **Supabase** as the primary database and backend-as-a-service (BaaS).

## Consequences
- **Positive:** We leverage raw PostgreSQL power for complex relational queries and constraints. RLS handles multi-tenant data security seamlessly. Rapid development using Supabase SDKs.
- **Negative:** Vendor lock-in to Supabase-specific features (Auth, Storage), though the underlying Postgres database mitigates this risk significantly compared to proprietary NoSQL solutions. We must rely heavily on PostgreSQL migrations and triggers, which shifts some business logic to the database layer (e.g., cached totals).
