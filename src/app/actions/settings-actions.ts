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
