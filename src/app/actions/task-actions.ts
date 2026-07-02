'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTodaysTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get tasks for today
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('user_tasks')
    .select(`
      *,
      roadmap_tasks (*)
    `)
    .eq('user_id', user.id)
    .lte('due_date', today)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getUpcomingTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('user_tasks')
    .select(`
      *,
      roadmap_tasks (*)
    `)
    .eq('user_id', user.id)
    .gt('due_date', today)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })
    .limit(20)

  if (error) throw new Error(error.message)
  return data
}

export async function submitTask(userTaskId: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Get the task details
  const { data: userTask, error: fetchErr } = await supabase
    .from('user_tasks')
    .select('*, roadmap_tasks(requires_ai_verification, xp_reward, coin_reward)')
    .eq('id', userTaskId)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !userTask) throw new Error('Task not found')

  // 2. Determine next status
  const requiresAi = userTask.roadmap_tasks?.requires_ai_verification
  const nextStatus = requiresAi ? 'pending_verification' : 'completed'

  if (nextStatus === 'completed') {
    // 3. Use Atomic RPC to verify task, award XP/Coins, and log activity
    const xpReward = userTask.roadmap_tasks?.xp_reward ?? userTask.custom_xp ?? 0
    const coinReward = userTask.roadmap_tasks?.coin_reward ?? 0
    
    const { error: rpcErr } = await supabase.rpc('complete_task_transaction', {
      p_user_task_id: userTaskId,
      p_user_id: user.id,
      p_submitted_text: payload.text || null,
      p_submitted_files: payload.files || [],
      p_xp_reward: xpReward,
      p_coin_reward: coinReward
    })

    if (rpcErr) throw new Error(rpcErr.message)
  } else {
    // 3b. Just update the task to pending_verification (Phase 3 will handle the rest)
    const { error: updateErr } = await supabase
      .from('user_tasks')
      .update({
        status: nextStatus,
        submitted_content: payload.text || null,
        submitted_files: payload.files || []
      })
      .eq('id', userTaskId)

    if (updateErr) throw new Error(updateErr.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/tasks/${userTaskId}`)
  return { status: nextStatus }
}

export async function getDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get active roadmaps
  const { data: activeRoadmapsData } = await supabase
    .from('user_roadmaps')
    .select('*, roadmap_templates(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)

  const activeRoadmaps = []
  if (activeRoadmapsData) {
    for (const r of activeRoadmapsData) {
      // Get completed tasks for this specific user roadmap
      const { count: completedCount } = await supabase
        .from('user_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_roadmap_id', r.id)
        .in('status', ['completed', 'verified'])
        .is('deleted_at', null)

      // Calculate total tasks from the roadmap templates
      // Since inner joins across 4 tables might be tricky with Supabase JS in one query, 
      // we can do a simplified count if possible, but for now we'll just use a fallback or the template's phases.
      // A more robust way is to fetch the phases and count tasks.
      const { data: templateData } = await supabase
        .from('roadmap_templates')
        .select(`
          roadmap_phases (
            roadmap_milestones (
              roadmap_modules (
                roadmap_tasks ( id )
              )
            )
          )
        `)
        .eq('id', r.template_id)
        .single()
        
      let totalCount = 0
      templateData?.roadmap_phases?.forEach((p: any) => {
        p.roadmap_milestones?.forEach((m: any) => {
          m.roadmap_modules?.forEach((mod: any) => {
            totalCount += mod.roadmap_tasks?.length || 0
          })
        })
      })

      activeRoadmaps.push({
        ...r,
        progress: {
          completed: completedCount || 0,
          total: totalCount
        }
      })
    }
  }

  // Get today's tasks
  const todaysTasks = await getTodaysTasks()
  
  // Get upcoming
  const upcomingTasks = await getUpcomingTasks()
  
  // Get stats from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get mini leaderboard
  const { data: leaderboard } = await supabase
    .from('profiles')
    .select('id, username, total_xp')
    .order('total_xp', { ascending: false })
    .limit(5)

  const { count: completedTasksCount } = await supabase
    .from('user_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .is('deleted_at', null);

  const { count: totalTasksCount } = await supabase
    .from('user_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null);

  return {
    profile: profile || {},
    leaderboard: leaderboard || [],
    activeRoadmaps: activeRoadmaps || [],
    todaysTasks: todaysTasks || [],
    upcomingTasks: upcomingTasks || [],
    stats: {
      xp: profile?.total_xp || 0,
      coins: profile?.coins || 0,
      streak: profile?.current_streak || 0,
      completedTasksCount: completedTasksCount || 0,
      totalTasksCount: totalTasksCount || 0
    }
  }
}

export async function repairStreak(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) throw new Error('Unauthorized')

  const { error } = await supabase.rpc('repair_user_streak', {
    p_user_id: user.id
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function createCustomTask(title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('user_tasks')
    .insert({
      user_id: user.id,
      status: 'available',
      assigned_date: today,
      due_date: today,
      custom_title: title,
      custom_xp: 5
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true, task: data }
}
