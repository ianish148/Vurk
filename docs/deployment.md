# Deployment Guide

Vurk is optimized for deployment on Vercel and Supabase.

## Prerequisites
1. A Vercel Account
2. A Supabase Project
3. API Keys for integrations (Gemini, Google Calendar, etc.)

## Environment Variables
Ensure the following are set in your deployment environment:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Used for Admin bypass

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_VERIFICATION=true
```

## Database Migrations
Migrations are managed via the Supabase CLI.
Do not manually edit the remote schema. Always push migrations:
```bash
npx supabase db push
```

## Background Jobs
Background jobs (e.g., the Rolling Scheduler and Leaderboard updates) are managed via Supabase pg_cron.
Ensure the `background_jobs` table is being polled by the worker function or Edge Functions are scheduled correctly.
