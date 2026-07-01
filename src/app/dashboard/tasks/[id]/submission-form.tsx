'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitTask } from '@/app/actions/task-actions'
import { Loader2, UploadCloud, X, File } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function SubmissionForm({ 
  userTaskId, 
  requirementType,
  requiresAi
}: { 
  userTaskId: string, 
  requirementType: string,
  requiresAi: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      // Basic validation
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFile(selected)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (requirementType === 'text' && !text.trim()) {
      setError('Please provide the required text submission.')
      return
    }

    if ((requirementType === 'photo' || requirementType === 'pdf') && !file) {
      setError('Please select a file to upload.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      let uploadedFilePaths: string[] = []

      // Handle File Upload to Supabase Storage
      if (file) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('submissions')
          .upload(filePath, file)

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
        
        if (data?.path) {
          uploadedFilePaths.push(data.path)
        }
      }

      // Submit to database via server action
      await submitTask(userTaskId, { text, files: uploadedFilePaths })
      toast.success("Submission received!")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}
      
      {requirementType === 'text' && (
        <Textarea 
          placeholder="Type your submission here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />
      )}

      {(requirementType === 'photo' || requirementType === 'pdf' || requirementType === 'mixed') && (
        <div>
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center"
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Click to select a file</p>
              <p className="text-xs text-muted-foreground mt-1">
                {requirementType === 'photo' ? 'PNG, JPG, WEBP up to 10MB' : 'PDF or Images up to 10MB'}
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden" 
                accept={requirementType === 'photo' ? "image/*" : requirementType === 'pdf' ? ".pdf" : "image/*,.pdf"}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/30">
              <div className="flex items-center space-x-3 overflow-hidden">
                <File className="h-8 w-8 text-blue-500 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={loading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto mt-4">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {requiresAi ? 'Submit for AI Verification' : 'Mark as Complete'}
      </Button>
    </div>
  )
}
