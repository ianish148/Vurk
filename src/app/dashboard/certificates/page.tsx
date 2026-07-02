export const runtime = 'edge';

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FileBadge } from 'lucide-react'
import { CertificatesClient } from './certificates-client'

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <FileBadge className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload and showcase your achievements
          </p>
        </div>
      </div>

      <CertificatesClient
        userId={user.id}
        initialCerts={certificates ?? []}
      />
    </div>
  )
}
