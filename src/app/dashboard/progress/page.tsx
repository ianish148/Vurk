import { Activity, Construction } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deep dive into your learning analytics and statistics.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card shadow-sm mt-12 min-h-[400px]">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Under Construction</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're currently building advanced analytics and charting for your progress. Check back soon for detailed insights on your XP, task completion rates, and learning streaks!
        </p>
      </div>
    </div>
  )
}
