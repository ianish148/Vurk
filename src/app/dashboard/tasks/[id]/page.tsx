import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Coins, Clock, Sparkles } from 'lucide-react'
import { redirect } from 'next/navigation'
import SubmissionForm from './submission-form'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ut, error } = await supabase
    .from('user_tasks')
    .select(`
      *,
      roadmap_tasks (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !ut) {
    return <div>Task not found</div>
  }

  const task = ut.roadmap_tasks

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge className="capitalize">{ut.status.replace('_', ' ')}</Badge>
          <Badge variant="outline">{task.difficulty}</Badge>
          {task.requires_ai_verification && (
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Verification
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{task.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center"><Clock className="h-4 w-4 mr-1"/> {task.estimated_time_minutes} min</span>
          <span className="flex items-center text-yellow-500"><Trophy className="h-4 w-4 mr-1"/> {task.xp_reward} XP</span>
          {task.coin_reward > 0 && (
            <span className="flex items-center text-blue-500"><Coins className="h-4 w-4 mr-1"/> {task.coin_reward} Coins</span>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {task.description.split('\n').map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {(ut.status === 'available' || ut.status === 'in_progress' || ut.status === 'rejected') && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Submit Proof</CardTitle>
            <CardDescription>
              {task.submission_req === 'none' 
                ? "This task doesn't require evidence. Just mark it complete when you're done!"
                : `This task requires a ${task.submission_req} submission.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionForm 
              userTaskId={ut.id} 
              requirementType={task.submission_req} 
              requiresAi={task.requires_ai_verification} 
            />
          </CardContent>
        </Card>
      )}

      {(ut.status === 'submitted' || ut.status === 'pending_verification') && (
        <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-700 dark:text-indigo-300">Pending AI Verification</CardTitle>
            <CardDescription>
              Your submission is being reviewed by the AI. This usually takes a few seconds.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {ut.status === 'completed' && (
        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">Task Completed!</CardTitle>
            <CardDescription>
              You've earned {task.xp_reward} XP. Great job!
            </CardDescription>
          </CardHeader>
          {ut.feedback_notes && (
            <CardContent>
              <div className="p-4 bg-white dark:bg-background rounded-md border text-sm">
                <strong>Feedback:</strong> {ut.feedback_notes}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
