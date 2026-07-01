'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRoadmaps() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('roadmap_templates')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getRoadmap(id: string) {
  const supabase = await createClient()
  // Fetch template and hierarchy
  const { data: template, error } = await supabase
    .from('roadmap_templates')
    .select(`
      *,
      roadmap_phases (
        *,
        roadmap_milestones (
          *,
          roadmap_modules (
            *,
            roadmap_tasks (*)
          )
        )
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw new Error(error.message)
  return template
}

export async function subscribeRoadmap(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('user_roadmaps')
    .select('id')
    .eq('user_id', user.id)
    .eq('template_id', templateId)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing) {
    throw new Error('Already subscribed to this roadmap')
  }

  // Insert subscription
  const { data, error } = await supabase
    .from('user_roadmaps')
    .insert({
      user_id: user.id,
      template_id: templateId,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  // Note: generateTasks should be called immediately after this or via a trigger
  const { generateTasks } = await import('./scheduler-actions')
  await generateTasks(user.id)
  
  revalidatePath('/dashboard/roadmaps')
  revalidatePath('/dashboard')
  return data
}

export async function pauseRoadmap(userRoadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_roadmaps')
    .update({ status: 'paused', paused_at: new Date().toISOString() })
    .eq('id', userRoadmapId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function resumeRoadmap(userRoadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_roadmaps')
    .update({ status: 'active', paused_at: null })
    .eq('id', userRoadmapId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function unenrollRoadmap(userRoadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First delete associated user_tasks
  await supabase
    .from('user_tasks')
    .delete()
    .eq('user_roadmap_id', userRoadmapId)
    .eq('user_id', user.id)

  // Then delete the subscription
  const { error } = await supabase
    .from('user_roadmaps')
    .delete()
    .eq('id', userRoadmapId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/roadmaps')
}
