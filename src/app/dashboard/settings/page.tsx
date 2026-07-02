export const runtime = 'edge';

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { SettingsClient } from './settings-client'

const ADMIN_EMAIL = 'anishff148@gmail.com'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account, appearance, and integrations
          </p>
        </div>
      </div>

      <SettingsClient
        initialData={preferences || {}}
        userId={user.id}
        profile={profile || {}}
        isAdmin={isAdmin}
      />
    </div>
  )
}
