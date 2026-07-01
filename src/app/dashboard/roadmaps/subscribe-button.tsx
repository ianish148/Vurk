'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeRoadmap } from '@/app/actions/roadmap-actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SubscribeButton({ templateId }: { templateId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    try {
      await subscribeRoadmap(templateId)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button 
        className="w-full" 
        onClick={handleSubscribe} 
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Enrolling...' : 'Start Learning'}
      </Button>
    </div>
  )
}
