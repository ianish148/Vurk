export const runtime = 'edge';

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding-wizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile is already complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_completed')
    .eq('id', user.id)
    .single()

  if (profile?.profile_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
       <OnboardingWizard userId={user.id} email={user.email || ''} />
    </div>
  )
}
