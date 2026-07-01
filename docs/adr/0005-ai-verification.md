# ADR 0005: AI Verification Pipeline

## Status
Accepted (Pre-Phase 3)

## Context
A core differentiator of Vurk is "AI Verification"—proving that a user actually completed a task (e.g., uploading a photo of a handwritten Japanese essay) rather than just clicking a checkbox. We need an architecture that handles potentially slow AI processing, handles uncertain AI results gracefully, and keeps the user informed.

## Options Considered
1. **Synchronous AI Processing:** User clicks "Submit", the server calls Gemini, waits 5-10 seconds, and returns the result. 
   - *Drawback:* Poor UX, prone to timeouts, blocks the client.
2. **Binary AI Decisions:** The AI strictly returns PASS or FAIL. 
   - *Drawback:* Generative AI is non-deterministic. A binary system will inevitably reject valid submissions (false negatives), leading to user frustration, or accept garbage (false positives).
3. **Asynchronous Verification Queue with Confidence Thresholds:** User submission creates an `ai_verification_jobs` entry. A background process runs the AI validation and assigns a `confidence_score` (0-100%). Based on the score, the system routes the decision: Auto-Approve (≥90%), Manual Review (70-89%), or Reject (<70%).

## Decision
We chose the **Asynchronous Verification Queue with Confidence Thresholds**. The state machine for a task becomes: `submitted -> pending_verification -> [completed | manual_review | rejected]`.

## Consequences
- **Positive:** Excellent UX (instant submission, background processing). Fair to users (edge cases are flagged for human review rather than instantly rejected). Highly extensible (we can adjust thresholds dynamically based on roadmap difficulty).
- **Negative:** Requires background workers or Edge Functions to process the queue. Requires building a Manual Review UI for users or admins to adjudicate borderline submissions. Increases architectural complexity significantly in Phase 3.
