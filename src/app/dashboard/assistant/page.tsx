import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/app/dashboard/settings/settings-form"
import { Bot, KeyRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatUI } from "@/components/chat-ui"
import { ChatSidebar } from "@/components/chat-sidebar"
import { getChatSessions, getChatMessages } from "@/app/actions/chat-actions"

export default async function AssistantPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams
  const sessionId = typeof searchParams.session === 'string' ? searchParams.session : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const hasApiKey = !!preferences?.gemini_api_key

  let sessions: any[] = []
  let initialMessages: any[] = []

  if (hasApiKey) {
    sessions = await getChatSessions(user.id)
    if (sessionId) {
      initialMessages = await getChatMessages(sessionId)
    }
  }

  return (
    <div className="flex-1 p-6 h-full flex flex-col gap-4 min-h-0">
      <div className="flex items-center gap-3 shrink-0">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
      </div>

      {!hasApiKey ? (
        <div className="max-w-2xl mx-auto mt-12 w-full">
          <Card className="border-primary/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <KeyRound className="w-64 h-64" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl flex items-center gap-2">
                <KeyRound className="h-6 w-6 text-amber-500" />
                API Key Required
              </CardTitle>
              <CardDescription className="text-base mt-2">
                To unlock the AI Assistant, add your Gemini API key from{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary underline">
                  Google AI Studio
                </a>.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="bg-card p-6 rounded-lg border">
                <SettingsForm initialData={preferences || {}} userId={user.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Sidebar */}
          <ChatSidebar sessions={sessions} activeSessionId={sessionId} />

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <ChatUI
              userId={user.id}
              sessionId={sessionId}
              initialMessages={initialMessages}
            />
          </div>
        </div>
      )}
    </div>
  )
}
