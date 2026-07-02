import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Page Not Found | Vurk',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="flex flex-col items-center max-w-md">
        <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Oops! It looks like you've wandered off the roadmap. The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/">
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Footer is omitted here for a cleaner 404 experience, but branding remains intact */}
      <div className="absolute bottom-10">
        <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
          <img src="/logo.png" alt="Vurk Logo" className="h-5 w-auto object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="Vurk Logo" className="h-5 w-auto object-contain hidden dark:block" />
          <span className="font-semibold tracking-tight text-foreground">Vurk</span>
        </Link>
      </div>
    </div>
  )
}
