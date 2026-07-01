'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { renameSession, deleteSession } from '@/app/actions/chat-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react'

type Session = { id: string; title: string; created_at: string }

export function ChatSidebar({
  sessions: initialSessions,
  activeSessionId,
}: {
  sessions: Session[]
  activeSessionId: string | null
}) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Sync when server re-renders with new sessions
  useEffect(() => {
    setSessions(initialSessions)
  }, [initialSessions])

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  const startRename = (session: Session, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setRenamingId(session.id)
    setRenameValue(session.title)
  }

  const confirmRename = async (sessionId: string) => {
    const newTitle = renameValue.trim() || 'New Chat'
    // Optimistic update
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s))
    setRenamingId(null)
    try {
      await renameSession(sessionId, newTitle)
      router.refresh()
    } catch {
      toast.error('Failed to rename chat')
      router.refresh() // revert via server state
    }
  }

  const cancelRename = () => {
    setRenamingId(null)
    setRenameValue('')
  }

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeletingId(sessionId)
    // Optimistic removal
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    try {
      await deleteSession(sessionId)
      // If we deleted the active session, go to new chat
      if (activeSessionId === sessionId) {
        router.push('/dashboard/assistant')
      } else {
        router.refresh()
      }
      toast.success('Chat deleted')
    } catch {
      toast.error('Failed to delete chat')
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-64 flex flex-col gap-3 border rounded-xl bg-card p-3 min-h-0">
      {/* New Chat button */}
      <Button asChild className="w-full justify-start gap-2 shrink-0" variant="default">
        <Link href="/dashboard/assistant">
          <Plus className="h-4 w-4" />
          New Chat
        </Link>
      </Button>

      {/* Session list — scrollable */}
      <div className="flex flex-col gap-1 min-h-0 overflow-y-auto flex-1 pr-0.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 shrink-0">
          Recent Chats
        </p>

        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground italic px-2 py-1">No past chats.</p>
        )}

        {sessions.map((session) => {
          const isActive = activeSessionId === session.id
          const isRenaming = renamingId === session.id

          return (
            <div
              key={session.id}
              className={`group relative flex items-center rounded-lg transition-colors ${
                isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
              }`}
            >
              {isRenaming ? (
                /* Rename mode */
                <div className="flex items-center gap-1 w-full px-2 py-1">
                  <Input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') confirmRename(session.id)
                      if (e.key === 'Escape') cancelRename()
                    }}
                    className="h-7 text-sm px-2 flex-1"
                  />
                  <button
                    onClick={() => confirmRename(session.id)}
                    className="p-1 rounded hover:text-green-500 transition-colors shrink-0"
                    title="Save"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={cancelRename}
                    className="p-1 rounded hover:text-red-500 transition-colors shrink-0"
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                /* Normal mode */
                <>
                  <Link
                    href={`/dashboard/assistant?session=${session.id}`}
                    title={session.title}
                    className="flex items-center gap-2 flex-1 px-2 py-2 min-w-0 text-sm"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{session.title}</span>
                  </Link>

                  {/* Action buttons — show on hover */}
                  <div className="flex items-center gap-0.5 pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={e => startRename(session, e)}
                      className="p-1.5 rounded hover:bg-background/80 hover:text-primary transition-colors"
                      title="Rename"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={e => handleDelete(session.id, e)}
                      disabled={deletingId === session.id}
                      className="p-1.5 rounded hover:bg-background/80 hover:text-destructive transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
