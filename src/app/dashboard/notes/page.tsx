export const runtime = 'edge';

import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { FileEdit, BookOpen, ExternalLink, Inbox, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Resources & Notes | Vurk',
  description: 'Your personal notes and study resources.',
}

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notes } = await supabase
    .from('task_notes')
    .select('*, roadmap_tasks(title)')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resources & Notes</h1>
        <p className="text-muted-foreground mt-2">
          Access your saved study materials and personal task notes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border-indigo-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              Study Materials
            </CardTitle>
            <CardDescription>Official resources to help you succeed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/Genki1N5.pdf" target="_blank" className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-md text-green-400 group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Genki I - N5 Vocabulary</p>
                  <p className="text-xs text-muted-foreground">Japanese language study material (PDF).</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            My Task Notes
          </h2>
          
          {!notes || notes.length === 0 ? (
            <Card className="border-dashed bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No notes yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  When you add personal notes or insights to your tasks, they will appear here for easy review.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/tasks">Go to Tasks</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {notes.map((note: any) => (
                <Card key={note.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader className="py-4">
                    <CardDescription className="flex items-center gap-2">
                      <span className="truncate">{note.roadmap_tasks?.title}</span>
                      <span className="text-xs ml-auto border px-2 py-0.5 rounded-full">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm pb-4">
                    {note.note_content}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
