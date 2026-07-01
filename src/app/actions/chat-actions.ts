'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import * as fs from 'fs'

function parseGeminiError(err: any): string {
  const msg: string = err?.message || String(err)
  if (msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota')) {
    const retryMatch = msg.match(/retry(?:Delay)?[":\s]+"?(\d+)s/i)
    const seconds = retryMatch ? retryMatch[1] : '60'
    return `Rate limit reached. Please wait ${seconds} seconds and try again.`
  }
  if (msg.includes('403') || msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
    return 'Invalid API key. Please check your Gemini API key in Settings.'
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return 'AI model not available. Please try again or check your API key.'
  }
  if (msg.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }
  return 'AI request failed. Please try again.'
}

function log(msg: string) {
  try {
    fs.appendFileSync('C:/Vurk/action.log', new Date().toISOString() + ': ' + msg + '\n')
  } catch(e) {}
}

export async function getChatSessions(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getChatMessages(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createChatSession(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ user_id: userId, title: 'New Chat' }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function renameSession(sessionId: string, title: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title: title.trim() || 'New Chat' })
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient()
  // Delete messages first (foreign key), then the session
  await supabase.from('chat_messages').delete().eq('session_id', sessionId)
  const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId)
  if (error) throw new Error(error.message)
}

export async function sendChatMessage(
  sessionId: string, 
  userId: string, 
  messages: { role: string, content: string }[], 
  isFirstMessage: boolean
) {
  log(`sendChatMessage start: sessionId=${sessionId}, isFirstMessage=${isFirstMessage}`)
  try {
    const supabase = await createClient()

    // Always fetch the API key fresh from the DB — never trust the client-side prop
    const { data: prefs, error: prefsErr } = await supabase
      .from('user_preferences')
      .select('gemini_api_key')
      .eq('user_id', userId)
      .single()
    
    if (prefsErr || !prefs?.gemini_api_key) {
      throw new Error('No Gemini API key found. Please add one in Settings.')
    }
    const apiKey = prefs.gemini_api_key
    log(`Using apiKey prefix: ${apiKey.slice(0, 8)}`)

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // gemini-2.0-flash: supported on v1beta (SDK 0.24.x default)
    // gemini-pro and gemini-1.5-flash are deprecated — DO NOT use them
    const targetModel = 'gemini-2.0-flash'
    const model = genAI.getGenerativeModel({ model: targetModel })

    const latestMessage = messages[messages.length - 1].content

    // Build history — Gemini requires history to start with a 'user' turn
    const rawHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
    const firstUserIndex = rawHistory.findIndex(m => m.role === 'user')
    const history = firstUserIndex >= 0 ? rawHistory.slice(firstUserIndex) : []

    log(`Saving user message to DB...`)
    const { error: insertUserErr } = await supabase.from('chat_messages').insert([{
      session_id: sessionId,
      role: 'user',
      content: latestMessage
    }])
    if (insertUserErr) throw new Error('Failed to save user message: ' + insertUserErr.message)

    log(`Starting chat with Gemini model: ${targetModel}`)
    const chat = model.startChat({ history })
    
    log(`Sending message to Gemini...`)
    const result = await Promise.race([
      chat.sendMessage(latestMessage),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout (15s)')), 15000))
    ])
    
    const text = result.response.text()
    log(`Got response, length: ${text.length}`)

    log(`Saving AI response to DB...`)
    const { error: insertAiErr } = await supabase.from('chat_messages').insert([{
      session_id: sessionId,
      role: 'assistant',
      content: text
    }])
    if (insertAiErr) throw new Error('Failed to save AI response: ' + insertAiErr.message)

    // Generate a title for the first message (best-effort, non-blocking)
    if (isFirstMessage) {
      log(`Generating title...`)
      try {
        const titleModel = genAI.getGenerativeModel({ model: targetModel })
        const titlePrompt = `Summarize this prompt in 3-5 words to use as a chat title. Only output the title, no quotes: "${latestMessage}"`
        const titleRes = await Promise.race([
          titleModel.generateContent(titlePrompt),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Title timeout')), 10000))
        ])
        const generatedTitle = titleRes.response.text().trim().replace(/^[\"']|[\"']$/g, '')
        log(`Updating title to: ${generatedTitle}`)
        await supabase
          .from('chat_sessions')
          .update({ title: generatedTitle })
          .eq('id', sessionId)
      } catch (titleErr: any) {
        log(`Title generation failed (non-fatal): ${titleErr.message}`)
      }
    }

    // IMPORTANT: Do NOT call revalidatePath() here.
    // It causes "Error in input stream" in React 19 when the action also returns a value.
    // The client (chat-ui.tsx) handles refresh via router.refresh() instead.
    log(`Returning success`)
    return { success: true, text }
  } catch (error: any) {
    log(`Chat Action Error: ${error.message}`)
    return { success: false, error: parseGeminiError(error) }
  }
}
