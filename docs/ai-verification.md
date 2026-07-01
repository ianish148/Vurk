# AI Verification Engine

Vurk uses AI (Gemini/OpenAI) to verify student submissions (Phase 3). 

## How it works
1. **Submission:** A user uploads a file or text conforming to the task's `submission_req`.
2. **Flag Check:** If the task has `requires_ai_verification = true`, the task enters the `pending_verification` state instead of `verified`.
3. **Prompting:** The `verification_prompt` is sent to the `AIProvider` plugin along with the user's submission.
4. **Scoring:** The AI returns a JSON object containing a `score` (0-100) and `reasoning`.
5. **Outcome:** 
   - If score >= 80, the task is `completed`, XP is awarded, and `reasoning` is saved as feedback.
   - If score < 80, the task is marked `rejected`, and the user must try again using the `reasoning` provided.

## Tracking Costs
To maintain profitability and debugging, every call made by the `AIProvider` MUST log an entry to the `ai_usage_logs` table containing the `tokens_used`, `processing_time_ms`, and the `task_id`.
