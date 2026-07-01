'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Models ---
export type RoadmapTemplate = {
  id: string
  name: string
  description: string
  cover_image_url: string
  version: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  category: string
  tags: string[]
  total_xp_available: number
  estimated_duration_weeks: number
  required_skills: string[]
}

// Fetch all published, latest roadmaps for the marketplace
export async function getMarketplaceRoadmaps(): Promise<RoadmapTemplate[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('roadmap_templates')
    .select('*')
    .eq('status', 'published')
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching marketplace roadmaps:', error)
    return []
  }

  return data as RoadmapTemplate[]
}

// Fetch a single roadmap details (including its hierarchy count if needed)
export async function getRoadmapDetails(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('roadmap_templates')
    .select('*, roadmap_phases(*, roadmap_milestones(*, roadmap_modules(*, roadmap_tasks(*))))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching roadmap details:', error)
    return null
  }

  return data
}

// Subscribe user to a roadmap and generate the first 7 days of tasks
export async function subscribeToRoadmap(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // 1. Create user_roadmap entry
  const { data: userRoadmap, error: urError } = await supabase
    .from('user_roadmaps')
    .insert({
      user_id: user.id,
      template_id: templateId,
      status: 'active'
    })
    .select()
    .single()

  if (urError) {
    console.error('Error subscribing to roadmap:', urError)
    throw new Error('Failed to subscribe to roadmap')
  }

  // 2. Fetch the first batch of tasks for this roadmap
  // We will fetch tasks ordered by phase, milestone, module, task order.
  // We'll limit to a reasonable number to represent 7-14 days (e.g. 10 tasks)
  
  // To do this simply, we fetch all tasks for the template ordered correctly, then slice the first 10.
  // In a real production app with huge roadmaps, we'd do a more targeted query or stored procedure.
  const { data: tasksData, error: tasksError } = await supabase
    .from('roadmap_tasks')
    .select(`
      id,
      order_index,
      roadmap_modules!inner (
        order_index,
        roadmap_milestones!inner (
          order_index,
          roadmap_phases!inner (
            template_id,
            order_index
          )
        )
      )
    `)
    .eq('roadmap_modules.roadmap_milestones.roadmap_phases.template_id', templateId)
    // Supabase JS client doesn't support ordering across joined tables easily in one flat query,
    // so we might have to fetch and sort in JS, or create a view.
    // For now, let's create a database view or use a simpler query.

  if (tasksError) {
     console.error('Error fetching tasks:', tasksError)
     throw new Error('Failed to fetch tasks for generation')
  }

  // Sort tasks in memory based on the hierarchy order
  const sortedTasks = tasksData.sort((a: any, b: any) => {
    const pA = a.roadmap_modules.roadmap_milestones.roadmap_phases.order_index
    const pB = b.roadmap_modules.roadmap_milestones.roadmap_phases.order_index
    if (pA !== pB) return pA - pB
    
    const miA = a.roadmap_modules.roadmap_milestones.order_index
    const miB = b.roadmap_modules.roadmap_milestones.order_index
    if (miA !== miB) return miA - miB

    const moA = a.roadmap_modules.order_index
    const moB = b.roadmap_modules.order_index
    if (moA !== moB) return moA - moB

    return a.order_index - b.order_index
  })

  // Take the first 10 tasks (approx 7-10 days worth)
  const initialTasks = sortedTasks.slice(0, 10)

  // 3. Create user_tasks
  const userTasksToInsert = initialTasks.map((t, index) => {
    // Assign due dates incrementally (e.g., 1 task per day for simplicity)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + index)

    return {
      user_id: user.id,
      user_roadmap_id: userRoadmap.id,
      task_id: t.id,
      status: index === 0 ? 'open' : 'locked', // First task is open, rest locked initially
      assigned_date: new Date().toISOString(),
      due_date: dueDate.toISOString()
    }
  })

  if (userTasksToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('user_tasks')
      .insert(userTasksToInsert)

    if (insertError) {
       console.error('Error generating user tasks:', insertError)
       throw new Error('Failed to generate initial tasks')
    }
  }

  // 4. Log Activity
  await supabase.from('activity_logs').insert({
     user_id: user.id,
     action_type: 'roadmap_started',
     entity_type: 'roadmap_template',
     entity_id: templateId,
     metadata: { roadmap_id: userRoadmap.id }
  })

  revalidatePath('/dashboard/roadmaps')
  revalidatePath('/dashboard/tasks')
  
  return userRoadmap
}
