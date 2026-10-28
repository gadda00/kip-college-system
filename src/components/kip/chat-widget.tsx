'use client'

import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { MessageCircle, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { post } from '@/components/kip/lib/api'
import { cn } from '@/lib/utils'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SUGGESTED_PROMPTS = [
  'What courses do you offer?',
  'How much is CPA tuition?',
  'How do I apply?',
  'Where are your campuses?',
]

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'Hello and welcome to **KIP College**. I am the KIP Assistant — ask me about our courses, fees, campuses, intakes or how to apply.',
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // autoscroll to the newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending, open])

  // focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || pending) return

    setError(null)
    setInput('')
    const history = [...messages, { role: 'user' as const, content }]
    setMessages(history)
    setPending(true)

    try {
      const { reply } = await post<{ reply: string }>('/api/assistant', { messages: history })
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'The assistant is unavailable right now.'
      setError(message)
      toast.error('KIP Assistant', { description: 'Could not send your message — please try again.' })
    } finally {
      setPending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      {/* floating trigger */}
      <button
        type="button"
        aria-label={open ? 'Close KIP Assistant chat' : 'Chat with KIP Assistant'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-[#f2efe6] shadow-xl outline-2 outline-offset-2 outline-gold-400/40 transition-transform hover:scale-105 hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          !open && 'animate-pulse-ring',
        )}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>

      {/* chat panel */}
      {open && (
        <section
          aria-label="KIP Assistant chat panel"
          className="fixed bottom-24 right-5 z-50 flex h-[560px] max-h-[75vh] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
        >
          {/* header */}
          <div className="bg-brand-band kip-pattern relative flex items-center gap-3 border-b border-white/10 px-4 py-3 text-[#f2efe6]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-gold-400/30">
              <KipCrest className="h-7 w-7 text-[#f2efe6]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold leading-tight">
                KIP Assistant
              </p>
              <p className="flex items-center gap-1.5 text-xs text-[#f2efe6]/70">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                Typically replies instantly
              </p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10 hover:text-gold-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {/* gold baseline */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent"
            />
          </div>

          {/* messages */}
          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3.5 overflow-y-auto bg-muted/40 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn('flex items-end gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary dark:bg-brand-100">
                    <KipCrest className="h-5 w-5" />
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-700 text-[#f2efe6]'
                      : 'rounded-bl-sm bg-muted text-primary',
                  )}
                >
                  {m.role === 'assistant' ? (
                    <div className="chat-markdown">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  )}
                </div>
              </div>
            ))}

            {pending && (
              <div className="flex items-end gap-2" aria-live="polite">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary dark:bg-brand-100">
                  <KipCrest className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-gold-500"
                      style={{ animationDelay: `${dot * 0.15}s` }}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="sr-only">Assistant is typing</span>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error} — you can also reach us on 0703 710 879 or info@kipskitui.com.
              </p>
            )}

            {/* suggested prompts on empty conversation */}
            {messages.length <= 1 && !pending && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="min-h-9 rounded-full border border-gold-500/30 bg-gold-400/10 px-3.5 py-1.5 text-xs font-medium text-gold-700 transition-colors hover:bg-gold-400/20 dark:text-gold-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            className="flex items-center gap-2 border-t bg-card p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <label htmlFor="kip-chat-input" className="sr-only">
              Type your message
            </label>
            <input
              id="kip-chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, fees, admissions…"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={pending || !input.trim()}
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </section>
      )}
    </>
  )
}
