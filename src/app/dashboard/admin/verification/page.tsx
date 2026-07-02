export const runtime = 'edge';

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { resolveManualReview } from '@/app/actions/verification-actions'

export default async function ManualReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ideally, verify user is an admin here.
  // For MVP, we'll just allow it if they can access the page.

  const { data: reviews, error } = await supabase
    .from('manual_reviews')
    .select(`
      *,
      user_tasks (
        id,
        user_id,
        submitted_content,
        roadmap_tasks (
          title,
          description,
          xp_reward,
          coin_reward
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) return <div>Error loading reviews: {error.message}</div>

  return (
    <div className="flex-1 p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Manual Verification Queue</h1>
      <p className="text-muted-foreground">
        Tasks flagged by the AI for human review (Borderline confidence scores between 70% and 89%).
      </p>

      {reviews.length === 0 ? (
        <div className="bg-muted p-12 text-center rounded-lg border">
          <p className="text-muted-foreground">Queue is empty! All clear.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle>Task: {review.user_tasks.roadmap_tasks.title}</CardTitle>
                <CardDescription>User ID: {review.user_tasks.user_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Task Description</h3>
                  <p className="text-sm mt-1">{review.user_tasks.roadmap_tasks.description}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">User Submission</h3>
                  <p className="mt-2">{review.user_tasks.submitted_content || "No text provided (Check attached files)"}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-900/50">
                  <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-500 uppercase tracking-wide">AI Notes</h3>
                  <pre className="mt-2 text-sm whitespace-pre-wrap font-sans">{review.reviewer_notes}</pre>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <form action={async () => {
                  'use server'
                  await resolveManualReview(review.id, review.user_task_id, 'rejected')
                }}>
                  <Button variant="destructive" type="submit">Reject Task</Button>
                </form>
                <form action={async () => {
                  'use server'
                  await resolveManualReview(review.id, review.user_task_id, 'approved', review.user_tasks.user_id, review.user_tasks.roadmap_tasks.xp_reward, review.user_tasks.roadmap_tasks.coin_reward)
                }}>
                  <Button variant="default" className="bg-green-600 hover:bg-green-700" type="submit">Approve & Award XP</Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
