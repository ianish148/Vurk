export const runtime = 'edge';

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Medal, Crown } from 'lucide-react'

export const revalidate = 0 // always fetch fresh leaderboard

export default async function LeaderboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, total_xp, college')
    .order('total_xp', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching leaderboard:', error)
  }

  const users = profiles || []

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Top performers across Vurk. Complete tasks to earn XP and climb the ranks!
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b bg-muted/40 text-sm font-medium text-muted-foreground">
          <div className="w-12 text-center">Rank</div>
          <div>User</div>
          <div className="w-24 text-right pr-4">XP</div>
        </div>

        <div className="divide-y">
          {users.map((profile, index) => {
            const isCurrentUser = profile.id === user.id
            const rank = index + 1
            
            return (
              <div 
                key={profile.id} 
                className={`grid grid-cols-[auto_1fr_auto] gap-4 p-4 items-center transition-colors hover:bg-muted/30 ${
                  isCurrentUser ? 'bg-primary/5' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-12 flex justify-center items-center font-bold">
                  {rank === 1 ? <Crown className="h-6 w-6 text-yellow-500 drop-shadow-sm" /> :
                   rank === 2 ? <span className="text-xl font-bold text-gray-400 drop-shadow-sm">2</span> :
                   rank === 3 ? <span className="text-xl font-bold text-amber-700 drop-shadow-sm">3</span> :
                   <span className="text-muted-foreground">{rank}</span>}
                </div>

                {/* User Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                      @{profile.username || 'anonymous'}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                        You
                      </span>
                    )}
                  </div>
                  {profile.college && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {profile.college}
                    </span>
                  )}
                </div>

                {/* XP */}
                <div className="w-24 text-right pr-4">
                  <span className="font-mono font-bold text-lg text-primary">{profile.total_xp}</span>
                  <span className="text-xs text-muted-foreground ml-1">XP</span>
                </div>
              </div>
            )
          })}
          
          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No users found on the leaderboard yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
