'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveManualReview(
  reviewId: string,
  userTaskId: string,
  decision: 'approved' | 'rejected',
  userId?: string,
  xpReward?: number,
  coinReward?: number
) {
  const supabase = await createClient()

  // 1. Update review status
  await supabase
    .from('manual_reviews')
    .update({ 
      status: decision, 
      resolved_at: new Date().toISOString() 
    })
    .eq('id', reviewId)

  if (decision === 'approved' && userId && xpReward !== undefined && coinReward !== undefined) {
    // We can't just update the status; we need to use the RPC to give XP and log it securely
    // BUT, the RPC expects submitted_content and submitted_files.
    // Let's just fetch them first.
    const { data: ut } = await supabase
      .from('user_tasks')
      .select('submitted_content, submitted_files')
      .eq('id', userTaskId)
      .single()
      
    if (ut) {
      const { error: rpcErr } = await supabase.rpc('complete_task_transaction', {
        p_user_task_id: userTaskId,
        p_user_id: userId,
        p_submitted_text: ut.submitted_content,
        p_submitted_files: ut.submitted_files,
        p_xp_reward: xpReward,
        p_coin_reward: coinReward
      })
      if (rpcErr) throw new Error(rpcErr.message)
    }
  } else {
    // 2b. Rejected -> send task back to 'rejected'
    await supabase
      .from('user_tasks')
      .update({
        status: 'rejected',
        feedback_notes: 'Your submission was manually reviewed and rejected. Please try again.'
      })
      .eq('id', userTaskId)
  }

  revalidatePath('/dashboard/admin/verification')
}
