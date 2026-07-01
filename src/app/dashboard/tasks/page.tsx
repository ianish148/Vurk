import { getTodaysTasks, getUpcomingTasks } from '@/app/actions/task-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function TasksPage() {
  const todaysTasks = await getTodaysTasks()
  const upcomingTasks = await getUpcomingTasks()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-2">
          Your scheduled workload across all active roadmaps.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
            <CardDescription>
              Complete these tasks to maintain your streak!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysTasks?.length === 0 && (
              <div className="text-muted-foreground">No tasks scheduled for today.</div>
            )}
            {todaysTasks?.map((ut: any) => (
              <div key={ut.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{ut.roadmap_tasks.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ut.roadmap_tasks.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{ut.roadmap_tasks.difficulty}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{ut.status.replace('_', ' ')}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {ut.roadmap_tasks.estimated_time_minutes} min
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/tasks/${ut.id}`}>
                  <Button size="sm" className="gap-1">
                    <Play className="h-3 w-3" />
                    {ut.status === 'in_progress' ? 'Resume' : 'Start'}
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>
              Tasks scheduled for the next 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks?.length === 0 && (
              <div className="text-muted-foreground">No upcoming tasks scheduled yet.</div>
            )}
            {upcomingTasks?.map((ut: any) => (
              <div key={ut.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                <div>
                  <p className="font-medium">{ut.roadmap_tasks.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{new Date(ut.due_date).toLocaleDateString()}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {ut.roadmap_tasks.estimated_time_minutes} min
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/tasks/${ut.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
