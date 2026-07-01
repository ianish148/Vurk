'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendChatMessage, createChatSession } from '@/app/actions/chat-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

type Message = { role: 'user' | 'assistant', content: string }

const WELCOME = 'Hello! I am your AI Assistant. How can I help you with your roadmap today?'

export function ChatUI({ 
  userId,
  sessionId: initialSessionId,
  initialMessages 
}: { 
  userId: string,
  sessionId: string | null,
  initialMessages: Message[]
}) {
  const router = useRouter()

  // Keep sessionId in state so we can update it after creating a new session
  // without causing a re-render of the parent component mid-request
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId)

  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : [{ role: 'assistant', content: WELCOME }]
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // When the user clicks a different session in the sidebar, the server re-renders
  // and passes new props — sync them into local state
  useEffect(() => {
    setActiveSessionId(initialSessionId)
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    } else {
      setMessages([{ role: 'assistant', content: WELCOME }])
    }
  }, [initialSessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')

    const newHistory: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newHistory)
    setIsLoading(true)

    try {
      // Step 1: Ensure we have a session ID
      // Store in a local variable — do NOT touch the URL or state mid-flight
      let currentSessionId = activeSessionId
      let isFirstMessage = false

      if (!currentSessionId) {
        const newSession = await createChatSession(userId)
        currentSessionId = newSession.id
        isFirstMessage = true
        // Update state AFTER we have the id, before sending the message
        setActiveSessionId(currentSessionId)
      }

      // Step 2: Send message and get AI response
      const res = await sendChatMessage(currentSessionId!, userId, newHistory, isFirstMessage)

      if (res.success && res.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.text as string }])
        // Update URL silently so the page link is shareable, but DON'T trigger re-render
        if (isFirstMessage) {
          window.history.replaceState(null, '', `/dashboard/assistant?session=${currentSessionId}`)
        }
      } else {
        toast.error(res.error || 'Failed to get a response from AI')
        setMessages(newHistory.slice(0, -1)) // remove failed user message
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred')
      setMessages(messages)
    } finally {
      setIsLoading(false)
      // Refresh sidebar so new session / updated title appears
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col h-full w-full border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted/50 rounded-bl-none text-foreground'
            }`}>
              {msg.role === 'user' ? (
                 <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50 rounded-bl-none">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
