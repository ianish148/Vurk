import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiClient } from '@/lib/plugins/ai'

export async function GET(request: Request) {
  // Use Service Role to bypass RLS for background processing
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch pending jobs
  const { data: jobs, error: jobsError } = await supabase
    .from('ai_verification_jobs')
    .select(`
      id,
      user_task_id,
      user_tasks (
        id,
        user_id,
        submitted_content,
        submitted_files,
        roadmap_tasks (
          ai_verification_prompt,
          description,
          xp_reward,
          coin_reward
        )
      )
    `)
    .eq('status', 'pending')
    .limit(10)

  if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 })
  if (!jobs || jobs.length === 0) return NextResponse.json({ message: 'No jobs pending' })

  for (const job of jobs) {
    try {
      // Mark as processing
      await supabase.from('ai_verification_jobs').update({ status: 'processing' }).eq('id', job.id)

      const userTask = job.user_tasks
      const roadmapTask = userTask.roadmap_tasks
      
      // Fetch User's Gemini API Key
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('gemini_api_key')
        .eq('user_id', userTask.user_id)
        .single()

      if (!prefs?.gemini_api_key) {
        throw new Error("User has no Gemini API Key configured.")
      }

      // Fetch file if exists (we only handle the first file for MVP)
      let fileBase64: string | undefined
      let mimeType: string | undefined

      if (userTask.submitted_files && userTask.submitted_files.length > 0) {
        const filePath = userTask.submitted_files[0]
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('submissions')
          .download(filePath)
        
        if (downloadError) throw new Error(`Download failed: ${downloadError.message}`)
        
        const arrayBuffer = await fileData.arrayBuffer()
        fileBase64 = Buffer.from(arrayBuffer).toString('base64')
        mimeType = fileData.type
      }

      const systemPrompt = roadmapTask.ai_verification_prompt || "Verify this task submission."

      // Call AI
      const start = Date.now()
      const { score, reasoning } = await aiClient.verifySubmission(
        prefs.gemini_api_key,
        systemPrompt,
        userTask.submitted_content,
        fileBase64,
        mimeType
      )
      const duration = Date.now() - start

      // Decision Engine
      let decision = 'manual_review'
      if (score >= 90) decision = 'auto_approve'
      else if (score < 70) decision = 'reject'

      // Log Result
      await supabase.from('ai_verification_results').insert({
        job_id: job.id,
        confidence_score: score,
        decision,
        feedback_markdown: reasoning
      })

      // Log AI Usage
      await supabase.from('ai_usage_logs').insert({
        user_id: userTask.user_id,
        job_id: job.id,
        model_name: 'gemini-1.5-pro',
        duration_ms: duration
      })

      // Act on Decision
      if (decision === 'auto_approve') {
        const { error: rpcErr } = await supabase.rpc('complete_task_transaction', {
          p_user_task_id: userTask.id,
          p_user_id: userTask.user_id,
          p_submitted_text: userTask.submitted_content,
          p_submitted_files: userTask.submitted_files,
          p_xp_reward: roadmapTask.xp_reward,
          p_coin_reward: roadmapTask.coin_reward
        })
        if (rpcErr) throw rpcErr
      } else if (decision === 'reject') {
        await supabase.from('user_tasks').update({
          status: 'rejected',
          feedback_notes: reasoning
        }).eq('id', userTask.id)
      } else if (decision === 'manual_review') {
        await supabase.from('manual_reviews').insert({
          user_task_id: userTask.id,
          reviewer_notes: `AI Score: ${score}\nReasoning: ${reasoning}`
        })
        // Task stays in pending_verification status
      }

      // Mark job completed
      await supabase.from('ai_verification_jobs').update({ status: 'completed' }).eq('id', job.id)

    } catch (err: any) {
      console.error(`Job ${job.id} failed:`, err)
      await supabase.from('ai_verification_jobs').update({ 
        status: 'failed', 
        attempts: job.attempts + 1 
      }).eq('id', job.id)
    }
  }

  return NextResponse.json({ message: `Processed ${jobs.length} jobs` })
}
