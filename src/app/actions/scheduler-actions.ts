'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Smart Scheduler Engine
 * Generates user_tasks for a given user's active roadmaps.
 * Currently, generates tasks for the next 7 days based on daily study targets.
 */
export async function generateTasks(userId?: string) {
  const supabase = await createClient()
  
  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    targetUserId = user.id
  }

  // 1. Get user preferences (for daily target)
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('daily_study_target_minutes')
    .eq('user_id', targetUserId)
    .single()
    
  const dailyTarget = prefs?.daily_study_target_minutes || 60

  // 2. Get active user roadmaps
  const { data: roadmaps } = await supabase
    .from('user_roadmaps')
    .select('id, template_id')
    .eq('user_id', targetUserId)
    .eq('status', 'active')
    .is('deleted_at', null)

  if (!roadmaps || roadmaps.length === 0) return { success: true, message: 'No active roadmaps.' }

  let totalGenerated = 0

  // 3. For each roadmap, generate up to 7 days
  for (const roadmap of roadmaps) {
    // Get all tasks for this template that haven't been assigned to the user yet
    // To do this properly, we need to join through phase -> milestone -> module -> task
    // But since we just need the flat list of roadmap_tasks, we can query them directly if we know they belong to the template.
    // Wait, roadmap_tasks only has module_id. Let's do a nested query to get all tasks for this template.
    const { data: templateData } = await supabase
      .from('roadmap_templates')
      .select(`
        roadmap_phases (
          roadmap_milestones (
            roadmap_modules (
              roadmap_tasks (
                id, estimated_time_minutes, order_index, difficulty
              )
            )
          )
        )
      `)
      .eq('id', roadmap.template_id)
      .single()

    if (!templateData) continue

    // Flatten all tasks
    const allTasks: any[] = []
    templateData.roadmap_phases?.forEach((p: any) => {
      p.roadmap_milestones?.forEach((m: any) => {
        m.roadmap_modules?.forEach((mod: any) => {
          mod.roadmap_tasks?.forEach((t: any) => {
            allTasks.push(t)
          })
        })
      })
    })

    // Sort by order_index (proxy for dependencies/chronology)
    allTasks.sort((a, b) => a.order_index - b.order_index)

    // Get currently assigned tasks for this roadmap
    const { data: existingUserTasks } = await supabase
      .from('user_tasks')
      .select('task_id')
      .eq('user_id', targetUserId)
      .eq('user_roadmap_id', roadmap.id)
      .is('deleted_at', null)

    const existingTaskIds = new Set(existingUserTasks?.map(ut => ut.task_id) || [])

    // Filter out already assigned tasks
    const unassignedTasks = allTasks.filter(t => !existingTaskIds.has(t.id))

    if (unassignedTasks.length === 0) continue

    // Scheduler constraints: generate tasks for next 7 days, up to dailyTarget minutes per day
    const tasksToInsert = []
    const today = new Date()
    
    let currentDayOffset = 0
    let currentDayMinutes = 0

    for (const task of unassignedTasks) {
      if (currentDayOffset > 7) break // Only look ahead 7 days

      if (currentDayMinutes + task.estimated_time_minutes > dailyTarget) {
        // Move to next day
        currentDayOffset++
        currentDayMinutes = 0
        
        if (currentDayOffset > 7) break
      }

      const dueDate = new Date(today)
      dueDate.setDate(today.getDate() + currentDayOffset)

      tasksToInsert.push({
        user_id: targetUserId,
        user_roadmap_id: roadmap.id,
        task_id: task.id,
        status: 'available',
        assigned_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0]
      })

      currentDayMinutes += task.estimated_time_minutes
    }

    if (tasksToInsert.length > 0) {
      const { error } = await supabase.from('user_tasks').insert(tasksToInsert)
      if (error) console.error('Failed to generate tasks:', error.message)
      else totalGenerated += tasksToInsert.length
    }
  }

  revalidatePath('/dashboard')
  return { success: true, message: `Generated ${totalGenerated} tasks for the upcoming week.` }
}
