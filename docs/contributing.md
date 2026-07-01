# Contributing to Vurk

## Principles
1. **Never mock data.** Everything must be wired to the Supabase database.
2. **Maintain clean architecture.** Do not tightly couple integrations (use the `lib/plugins` layer).
3. **No orphaned states.** Always handle loading, error, and empty states gracefully.
4. **Prioritize the Core.** Do not build complex UI for Phase 4 scale items (like multi-tenancy or teams) until the core P0 product is perfect.

## Development Workflow
1. Use `npm run dev` to start the Next.js server.
2. If modifying the database schema, write a new SQL migration in `supabase/migrations/` and apply it to the remote database. Do not manually edit tables in the Supabase UI.
3. Test your changes locally before committing.

## Architecture Documentation
Always keep `docs/` synchronized with the codebase. If you add a major new system, document it here.
