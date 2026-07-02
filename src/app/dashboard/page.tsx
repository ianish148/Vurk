export const runtime = 'edge';

import { getDashboard } from '@/app/actions/task-actions'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Flame, Coins, CheckCircle2, UserCircle2, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import UnenrollButton from './unenroll-button'

export default async function DashboardPage() {
  const data = await getDashboard()
  const { profile, leaderboard, stats, todaysTasks, activeRoadmaps } = data

  const todaysTotalTasks = todaysTasks.length
  const todaysCompletedTasks = todaysTasks.filter((t: any) => t.status === 'completed' || t.status === 'verified').length
  const completionPercentage = todaysTotalTasks === 0 ? 0 : Math.round((todaysCompletedTasks / todaysTotalTasks) * 100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Main Content Area ── */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile.username || 'friend'}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Keep pushing forward. Your future self is proud.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs font-semibold text-primary mb-1">XP Points</p>
                <div className="text-2xl font-bold">{stats.xp.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-500 mt-2 font-medium">
                <TrendingUp className="h-3 w-3" /> Keep going!
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs font-semibold text-yellow-500 mb-1">Coins</p>
                <div className="text-2xl font-bold">{stats.coins.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-yellow-500 mt-2 font-medium">
                <Coins className="h-3 w-3" /> Earn more by completing tasks
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs font-semibold text-green-500 mb-1">Current Streak</p>
                <div className="text-2xl font-bold">{stats.streak} days</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                <Flame className="h-3 w-3 text-orange-500" /> Best: {stats.streak} days
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 relative overflow-hidden">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs font-semibold text-blue-400 mb-1">Tasks Done</p>
                <div className="text-2xl font-bold">{todaysCompletedTasks} / {todaysTotalTasks}</div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                {completionPercentage}% today
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-column lists */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">Today's Tasks <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{todaysTasks.length}</span></h2>
              <Link href="/dashboard/tasks" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            
            <div className="space-y-3">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-xl bg-card/30">
                  <p className="text-xs text-muted-foreground">No tasks scheduled for today.</p>
                </div>
              ) : (
                <>
                  {todaysCompletedTasks === todaysTotalTasks && todaysTotalTasks > 0 && (
                    <div className="text-center py-4 mb-2 border border-dashed border-green-500/30 rounded-xl bg-green-500/5">
                      <CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">All caught up for today!</p>
                    </div>
                  )}
                  {[...todaysTasks].sort((a, b) => {
                    const aComp = (a.status === 'completed' || a.status === 'verified') ? 1 : 0;
                    const bComp = (b.status === 'completed' || b.status === 'verified') ? 1 : 0;
                    return aComp - bComp;
                  }).map((t: any) => {
                    const isCompleted = t.status === 'completed' || t.status === 'verified';
                    return (
                      <Link key={t.id} href={`/dashboard/tasks/${t.id}`} className="block">
                        <Card className={`hover:bg-muted/30 transition-colors ${isCompleted ? 'opacity-60' : ''}`}>
                          <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 truncate">
                              {isCompleted ? (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-500/10 shrink-0">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5 shrink-0">
                                  <span className="text-primary text-[10px] font-bold">T</span>
                                </div>
                              )}
                              <div className="truncate">
                                <p className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{t.roadmap_tasks?.title || t.custom_title}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{t.roadmap_tasks?.estimated_time_minutes || 0} mins</p>
                              </div>
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap ml-2 ${isCompleted ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
                              +{t.roadmap_tasks?.xp_reward || t.custom_xp || 5} XP
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Active Roadmaps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">Active Roadmaps</h2>
              <Link href="/dashboard/roadmaps" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            
            <div className="space-y-3">
              {activeRoadmaps.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-xl bg-card/30">
                  <p className="text-xs text-muted-foreground">No active roadmaps</p>
                </div>
              ) : (
                activeRoadmaps.map((r: any) => {
                  const rmpCompleted = r.progress?.completed || 0;
                  const rmpTotal = r.progress?.total || 1;
                  const rmpPercent = Math.round((rmpCompleted / rmpTotal) * 100);
                  
                  return (
                  <Link href="/dashboard/tasks" key={r.id} className="block">
                    <Card className="hover:bg-muted/30 transition-colors border-primary/10 hover:border-primary/40">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 truncate">
                            <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            </div>
                            <p className="font-semibold text-sm truncate">{r.roadmap_templates.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground">{rmpPercent}%</span>
                            <UnenrollButton userRoadmapId={r.id} />
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: `${rmpPercent}%` }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Right Sidebar ── */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <Card className="bg-card/50 border-primary/10 overflow-hidden">
          <div className="h-16 bg-primary/5 relative">
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className="h-16 w-16 rounded-full bg-background border-4 border-card flex items-center justify-center shadow-sm">
                <UserCircle2 className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
          </div>
          <CardContent className="pt-10 pb-6 text-center">
            <h3 className="font-bold text-lg leading-tight">{profile.full_name || 'User'}</h3>
            <p className="text-xs text-muted-foreground mt-1">@{profile.username || 'anonymous'}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6 text-left mb-6">
              <div>
                <p className="text-[10px] text-primary font-medium">Age</p>
                <p className="text-xs font-semibold text-foreground">{profile.age || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary font-medium">Course</p>
                <p className="text-xs font-semibold text-foreground">{profile.branch || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary font-medium">College</p>
                <p className="text-xs font-semibold text-foreground truncate">{profile.college || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary font-medium">Year</p>
                <p className="text-xs font-semibold text-foreground">{profile.year_of_study || '-'}</p>
              </div>
            </div>
            
            <Link href="/dashboard/settings" className="w-full block">
              <Button variant="secondary" className="w-full h-8 text-xs font-medium">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mini Leaderboard */}
        <Card className="bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">Leaderboard (This Week)</h2>
              <Link href="/dashboard/leaderboard" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            
            <div className="space-y-3">
              {leaderboard.map((u: any, i: number) => {
                const isMe = u.id === profile.id
                return (
                  <div key={u.id} className={`flex items-center justify-between p-2 rounded-lg ${isMe ? 'bg-primary/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        i === 1 ? 'bg-gray-400/20 text-gray-400' :
                        i === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className={`text-xs font-semibold ${isMe ? 'text-primary' : ''}`}>
                        {u.username || 'anon'} {isMe && '(You)'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{u.total_xp} XP</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
