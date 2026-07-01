'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react'

export function ImportRoadmapForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.endsWith('.json')) {
        toast.error('Please select a valid JSON file')
        return
      }
      setFile(selected)
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setResult(null)

    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const response = await fetch('/api/admin/import-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Roadmap imported successfully!' })
        toast.success('Roadmap imported successfully!')
        setFile(null)
      } else {
        setResult({ success: false, message: data.error || 'Import failed' })
        toast.error(data.error || 'Import failed')
      }
    } catch (err: any) {
      const msg = err.message?.includes('JSON') ? 'Invalid JSON file' : err.message
      setResult({ success: false, message: msg })
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById('roadmap-file-input')?.click()}
      >
        <input
          id="roadmap-file-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-3">
          {file ? (
            <>
              <FileJson className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Click to upload roadmap JSON</p>
                <p className="text-sm text-muted-foreground">Only .json files are accepted</p>
              </div>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-lg text-sm ${
          result.success ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
        }`}>
          {result.success
            ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          }
          <span>{result.message}</span>
        </div>
      )}

      <Button type="submit" disabled={!file || isLoading} className="w-full">
        {isLoading ? 'Importing...' : 'Import Roadmap'}
      </Button>
    </form>
  )
}
