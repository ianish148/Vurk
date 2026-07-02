'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(data: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Upsert profile with onboarding data
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: data.username,
      full_name: data.full_name,
      age: data.age,
      country: data.country,
      timezone: data.timezone,
      college: data.college,
      branch: data.branch,
      year_of_study: data.year_of_study,
      semester: data.semester,
      graduation_year: data.graduation_year,
      current_cgpa: data.current_cgpa,
      target_cgpa: data.target_cgpa,
      career_goal: data.career_goal,
      interests: data.interests,
      japanese_level: data.japanese_level,
      programming_languages: data.programming_languages,
      github_username: data.github_username,
      linkedin: data.linkedin,
      goals: data.goals,
      profile_completed: true, // Mark as completed
    })

  if (error) {
    console.error('Onboarding Error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
