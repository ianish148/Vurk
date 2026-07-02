import { Home, Settings, Map, LogOut, CheckSquare, FileText, Activity, Trophy, FileEdit, Bot, FileBadge, Flame, ShieldAlert } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { logout } from "@/app/login/actions"
import { Button } from "./ui/button"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

const ADMIN_EMAIL = 'anishff148@gmail.com'

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Roadmaps", url: "/dashboard/roadmaps", icon: Map },
  { title: "Tasks", url: "/dashboard/tasks", icon: CheckSquare },
  { title: "Progress", url: "/dashboard/progress", icon: Activity },
  { title: "Leaderboard", url: "/dashboard/leaderboard", icon: Trophy },
  { title: "Resources", url: "/dashboard/notes", icon: FileEdit },
  { title: "AI Assistant", url: "/dashboard/assistant", icon: Bot },
  { title: "Certificates", url: "/dashboard/certificates", icon: FileBadge },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export async function AppSidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const isAdmin = user?.email === ADMIN_EMAIL

  // Get actual streak from profile
  const currentStreak = profile?.current_streak || 0

  return (
    <Sidebar variant="inset" className="border-r-0 bg-sidebar/50 backdrop-blur-xl">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col px-4 py-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center">
                <img src="/logo.png" alt="Vurk Logo" className="h-full w-auto object-contain dark:hidden" />
                <img src="/logo-dark.png" alt="Vurk Logo" className="h-full w-auto object-contain hidden dark:block" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Vurk</h1>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Plan. Do. Prove. Achieve.</p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} prefetch />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem key="admin">
                  <SidebarMenuButton render={<Link href="/dashboard/admin" prefetch />}>
                    <ShieldAlert />
                    <span>Admin Tools</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-4">
        {/* Streak Widget */}
        <div className="flex flex-col gap-2 rounded-xl bg-card border p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-50">
             <Flame className={`h-10 w-10 blur-xl absolute ${currentStreak > 0 ? 'text-orange-500/50' : 'text-muted'}`} />
             <Flame className={`h-8 w-8 relative z-10 drop-shadow-md ${currentStreak > 0 ? 'text-orange-500' : 'text-muted'}`} />
           </div>
           <div className="flex items-center gap-2">
             <Flame className={`h-4 w-4 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-muted'}`} />
             <span className="text-xs font-semibold text-muted-foreground">Current Streak</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-2xl font-bold">{currentStreak}</span>
             <span className="text-xs text-muted-foreground">Keep it up!</span>
           </div>
           <div className="flex justify-between mt-2">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
               const todayIdx = (new Date().getDay() + 6) % 7;
               const isLit = currentStreak > 0 && i <= todayIdx && i > todayIdx - currentStreak;
               return (
                 <div key={i} className="flex flex-col items-center gap-1">
                   <div className={`h-1.5 w-6 rounded-full ${isLit ? 'bg-orange-500' : 'bg-muted'}`} />
                   <span className={`text-[9px] ${isLit ? 'text-orange-500 font-bold' : 'text-muted-foreground'}`}>{day}</span>
                 </div>
               )
             })}
           </div>
        </div>

        {/* Profile Dropdown / Logout */}
        <div className="rounded-xl border bg-card p-2 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
             {profile?.avatar_url ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center font-bold text-lg text-primary bg-muted">
                  {profile?.full_name?.[0] || profile?.username?.[0] || 'V'}
               </div>
             )}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-semibold truncate">{profile?.full_name || profile?.username || 'User'}</p>
             <p className="text-xs text-muted-foreground truncate">View Profile</p>
          </div>
          <form>
            <Button type="submit" variant="ghost" size="icon" formAction={logout} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
