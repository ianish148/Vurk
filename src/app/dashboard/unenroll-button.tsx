'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { unenrollRoadmap } from '@/app/actions/roadmap-actions'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'

export default function UnenrollButton({ userRoadmapId }: { userRoadmapId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUnenroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to unenroll from this roadmap? This will permanently delete your progress.')) {
      return
    }

    setLoading(true)
    try {
      await unenrollRoadmap(userRoadmapId)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-red-500" 
      onClick={handleUnenroll} 
      disabled={loading}
      title="Unenroll"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
