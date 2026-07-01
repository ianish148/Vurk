# ADR 0003: Task Scheduler (Rolling Generation)

## Status
Accepted

## Context
When a user subscribes to a roadmap, they must be assigned tasks. A comprehensive roadmap may contain 1,500+ tasks spanning two years. Generating individual `user_tasks` for the entire roadmap at the moment of subscription would create massive database bloat (e.g., 1,500 rows * 10,000 users = 15 million rows), most of which would remain untouched for months or years.

## Options Considered
1. **Upfront Complete Generation:** Generate all `user_tasks` instantly upon enrollment. Easy to calculate total completion dates, but extremely inefficient and creates millions of dead rows.
2. **On-the-fly Calculation (No static user_tasks):** Calculate the user's daily tasks strictly at query time based on their progress. Highly scalable, but makes it incredibly difficult to track task-specific metadata (submissions, AI feedback, individual due date overrides).
3. **Rolling Task Generation (Smart Scheduler):** Generate a fixed window of upcoming tasks (e.g., next 7-14 days) based on the user's daily time commitment. Run the scheduler daily via a background job or upon login.

## Decision
We chose **Rolling Task Generation (Smart Scheduler)**.

## Consequences
- **Positive:** Massive reduction in database storage requirements. Automatically adapts to the user's actual pace (if they skip days, the scheduler simply assigns the next tasks starting from today, effectively recalculating their schedule automatically).
- **Negative:** Requires a robust scheduler engine (`generateTasks` action) that must reliably trigger (via Cron, Edge Function, or user action) to ensure users never run out of tasks. Due dates for tasks far in the future cannot be statically queried; they must be estimated.
