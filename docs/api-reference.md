# API Reference

Vurk primarily uses Next.js Server Actions for mutations and React Query + Supabase JS for fetching.

## Server Actions (`src/app/actions`)

### Authentication
* `signInWithOAuth(provider: string)`: Handles Google/Github sign in.
* `completeOnboarding(data: OnboardingFormData)`: Finalizes profile creation and updates the user's `is_onboarded` flag.

### Roadmaps
* `enrollInRoadmap(templateId: string)`: Subscribes a user to a roadmap and triggers the initial Smart Scheduler run.
* `pauseRoadmap(userRoadmapId: string)`: Pauses task generation and freezes streaks.

### Tasks
* `submitTask(taskId: string, payload: any)`: Submits proof for a task. Triggers AI verification if required, otherwise marks as completed.
* `skipTask(taskId: string)`: Marks a task as skipped and applies the missed task penalty.

## Admin Actions
* `importRoadmapJSON(json: string)`: Validates and inserts a full roadmap hierarchy from JSON.
* `triggerScheduler(userId: string)`: Manually forces the Smart Scheduler to generate the next batch of tasks.
