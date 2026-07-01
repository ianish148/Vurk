# ADR 0002: Roadmap Engine Architecture

## Status
Accepted

## Context
Vurk is centered around highly structured learning paths called "Roadmaps" (e.g., passing a Japanese certification, preparing for an internship). These roadmaps can contain hundreds or thousands of individual tasks. We needed a way to structure this data allowing for dependencies, modularity, and easy marketplace distribution.

## Options Considered
1. **Flat Task List:** A single table of tasks per roadmap with an `order_index`. Simple, but fails to capture the semantic structure of long-term goals (phases, modules).
2. **Deep Relational Hierarchy:** `Roadmap -> Phase -> Milestone -> Module -> Task`. Represents the true structure of complex goals.
3. **JSON Blobs:** Store the entire roadmap structure as a single JSON document in the database. Fast to read, but impossible to query efficiently or track granular progress (e.g., "how many users completed Task X?").

## Decision
We chose the **Deep Relational Hierarchy**. We built a rigid 5-level relational structure in PostgreSQL. Roadmaps are defined via versioned JSON files that are validated and parsed by an Admin Importer (`/dashboard/admin`) into distinct relational rows.

## Consequences
- **Positive:** Extremely queryable. We can easily aggregate progress at the module, milestone, or phase level. We can enforce dependencies cleanly.
- **Negative:** Deep hierarchies require complex `SELECT` queries with multiple `JOIN`s, which can impact performance. We mitigate this using materialized views or optimized Supabase nested selects where appropriate.
