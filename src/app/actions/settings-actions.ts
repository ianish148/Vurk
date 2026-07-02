"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePreferences(userId: string, data: { 
  gemini_api_key?: string, 
  username?: string, 
  name?: string,
  age?: number,
  year_of_study?: string,
  college?: string, 
  branch?: string 
}) {
  const supabase = await createClient()

  // Update preferences table
  const { error: prefError } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, gemini_api_key: data.gemini_api_key }, { onConflict: 'user_id' })

  if (prefError) throw new Error(prefError.message)

  // Update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      username: data.username,
      full_name: data.name,
      age: data.age,
      year_of_study: data.year_of_study,
      college: data.college,
      branch: data.branch
    })
    .eq('id', userId)

  if (profileError) {
    if (profileError.code === '23505') {
      throw new Error('Username is already taken')
    }
    throw new Error(profileError.message)
  }

  revalidatePath('/', 'layout')
}

export async function resetMyProgress(userId: string) {
  const supabase = await createClient()

  // Delete all user_tasks for the user
  const { error: tasksError } = await supabase
    .from('user_tasks')
    .delete()
    .eq('user_id', userId)

  if (tasksError) throw new Error(tasksError.message)

  // Delete all subscriptions (user_roadmaps) for the user
  const { error: subsError } = await supabase
    .from('user_roadmaps')
    .delete()
    .eq('user_id', userId)

  if (subsError) throw new Error(subsError.message)

  // Reset XP
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ total_xp: 0 })
    .eq('id', userId)

  if (profileError) throw new Error(profileError.message)

  revalidatePath('/', 'layout')
}
