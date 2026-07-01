'use server'

import { createClient } from '@/utils/supabase/server'

export async function saveCertificate(data: {
  userId: string
  title: string
  issuer: string | null
  issueDate: string | null
  fileUrl: string
  filePath: string
}) {
  const supabase = await createClient()

  const { data: cert, error } = await supabase
    .from('certificates')
    .insert({
      user_id: data.userId,
      title: data.title,
      issuer: data.issuer || null,
      issue_date: data.issueDate || null,
      file_url: data.fileUrl,
      file_path: data.filePath,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return cert
}

export async function deleteCertificate(certId: string, filePath: string) {
  const supabase = await createClient()

  // Remove from storage
  await supabase.storage.from('certificates').remove([filePath])

  // Remove from DB
  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', certId)

  if (error) throw new Error(error.message)
}
