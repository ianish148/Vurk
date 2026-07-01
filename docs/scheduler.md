# Smart Scheduler Engine

The Smart Scheduler is responsible for materializing generic `roadmap_tasks` into specific `user_tasks` with assigned dates.

## The Strategy
Instead of blindly dumping 2 years worth of tasks into a user's dashboard (creating millions of DB rows), Vurk uses a **Rolling Generation Strategy**.

1. **Initial Enrollment:** Generates only the first 7-14 days of tasks based on the user's daily study target.
2. **Rolling Update:** As a user completes today's tasks, a background job or server action generates the next chunk of tasks.
3. **Pacing Constraints:** 
   - Never schedule tasks requiring more than `daily_study_target_minutes` in a single day.
   - Spread `hard` and `expert` difficulty tasks across the week.
   - Respect explicit `task_dependencies` (Task B cannot be scheduled on a day before Task A).

## Handling Missed Tasks
Each `roadmap_template` defines a `missed_task_strategy`:
- `carry_forward`: Tasks are simply shifted to tomorrow, pushing the entire schedule back.
- `auto_reschedule`: Tasks are redistributed into the upcoming week's available slots.
- `mark_skipped`: Missed tasks are marked as skipped and the user misses the XP.
- `manual_recovery`: User must manually choose how to handle the backlog before new tasks generate.
