# Vurk Architecture

## Core Tech Stack
* **Framework:** Next.js 15 (App Router)
* **Frontend:** React, TypeScript, TailwindCSS, Shadcn UI, Framer Motion
* **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
* **Data Fetching & State:** React Query, Server Actions
* **Validation:** Zod, React Hook Form

## System Design
Vurk is a multi-tenant, event-driven SaaS platform. The architecture is broken into 3 phases:

1. **Core (P0):** Roadmap tracking, task scheduling, AI verification hooks, XP/Streak gamification.
2. **Growth (P1):** Friends, leaderboards, certificates, basic analytics.
3. **Scale (P2):** Workspaces (multi-tenancy), plugin system (Calendar, AI, Storage), feature flags, public profiles.

### Plugin Integration Layer
To prevent vendor lock-in, Vurk uses abstracted interfaces located in `src/lib/plugins/`:
* `AIProvider` (e.g., Gemini, OpenAI)
* `StorageProvider` (e.g., Supabase, AWS S3)
* `NotificationProvider` (e.g., Email, Push, In-App)
* `CalendarProvider` (e.g., Google Calendar, Outlook)

All integrations MUST implement these interfaces.
