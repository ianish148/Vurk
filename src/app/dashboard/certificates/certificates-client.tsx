'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { saveCertificate, deleteCertificate } from '@/app/actions/certificate-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Upload,
  X,
  FileImage,
  Loader2,
  Award,
  Trash2,
  ExternalLink,
  Calendar,
  Building2,
} from 'lucide-react'

type Certificate = {
  id: string
  title: string
  issuer: string | null
  issue_date: string | null
  file_url: string
  file_path: string
  created_at: string
}

export function CertificatesClient({
  userId,
  initialCerts,
}: {
  userId: string
  initialCerts: Certificate[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [certs, setCerts] = useState<Certificate[]>(initialCerts)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [preview, setPreview] = useState<Certificate | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [issuer, setIssuer] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/') && f.type !== 'application/pdf') {
      toast.error('Only images (PNG, JPG, WEBP) or PDF files are allowed')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setFile(f)
    setFilePreviewUrl(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  const clearFile = () => {
    setFile(null)
    setFilePreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    setUploading(true)
    try {
      // Step 1: Upload file to Supabase Storage (client-side, fine for storage)
      const ext = file.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, { upsert: false })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath)

      // Step 2: Save metadata via server action (avoids RLS issues)
      const cert = await saveCertificate({
        userId,
        title: title.trim(),
        issuer: issuer.trim() || null,
        issueDate: issueDate || null,
        fileUrl: urlData.publicUrl,
        filePath,
      })

      setCerts(prev => [cert, ...prev])
      setTitle('')
      setIssuer('')
      setIssueDate('')
      clearFile()
      toast.success('Certificate uploaded!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (cert: Certificate) => {
    setDeleting(cert.id)
    try {
      await deleteCertificate(cert.id, cert.file_path)
      setCerts(prev => prev.filter(c => c.id !== cert.id))
      if (preview?.id === cert.id) setPreview(null)
      toast.success('Certificate deleted')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Certificate
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              file
                ? 'border-primary/60 bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {filePreviewUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreviewUrl}
                  alt="preview"
                  className="max-h-40 rounded-lg object-contain mx-auto shadow-md"
                />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); clearFile() }}
                  className="absolute -top-2 -right-2 rounded-full bg-background border p-0.5 shadow hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <FileImage className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); clearFile() }}
                  className="text-xs text-destructive hover:underline"
                >Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-9 w-9" />
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs">PNG, JPG, WEBP or PDF — max 5MB</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Certificate title *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Issuer (e.g. Google, Coursera)"
              value={issuer}
              onChange={e => setIssuer(e.target.value)}
            />
            <Input
              type="date"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={uploading || !file || !title.trim()} className="w-full sm:w-auto">
            {uploading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</>
              : <><Upload className="h-4 w-4 mr-2" />Upload Certificate</>
            }
          </Button>
        </form>
      </div>

      {/* Gallery */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          My Certificates
          <span className="text-sm font-normal text-muted-foreground ml-1">({certs.length})</span>
        </h2>

        {certs.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-16 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No certificates yet</p>
            <p className="text-sm mt-1">Upload your first certificate above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {certs.map(cert => (
              <div
                key={cert.id}
                className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
                onClick={() => setPreview(cert)}
              >
                <div className="relative h-44 bg-gradient-to-br from-primary/10 via-muted/30 to-secondary/20 flex items-center justify-center overflow-hidden">
                  {cert.file_url.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cert.file_url}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary/60">
                      <FileImage className="h-14 w-14" />
                      <span className="text-xs font-medium uppercase tracking-wider">PDF</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <p className="font-semibold text-sm leading-tight truncate">{cert.title}</p>
                  {cert.issuer && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                      <Building2 className="h-3 w-3 shrink-0" />{cert.issuer}
                    </p>
                  )}
                  {cert.issue_date && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <button
                  onClick={e => { e.stopPropagation(); handleDelete(cert) }}
                  disabled={deleting === cert.id}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shadow-sm"
                  title="Delete"
                >
                  {deleting === cert.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-lg leading-tight">{preview.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {preview.issuer && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />{preview.issuer}
                    </span>
                  )}
                  {preview.issue_date && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(preview.issue_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={preview.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="h-3.5 w-3.5" />Open
                </a>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[70vh] bg-muted/20 flex items-center justify-center p-4">
              {preview.file_url.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.file_url} alt={preview.title} className="max-w-full max-h-full rounded-lg object-contain shadow-lg" />
              ) : (
                <iframe src={preview.file_url} title={preview.title} className="w-full h-[60vh] rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
