import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile is completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.profile_completed) {
    redirect('/onboarding')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
            {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
