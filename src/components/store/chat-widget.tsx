'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Best KCSE revision books for Biology?',
  'How much is printing 200 pages B&W?',
  'Do you deliver to Mwingi?',
  'I need Grade 4 CBC book list',
]

export function ChatWidget() {
  const { chatOpen, setChatOpen } = useUIStore()
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: 'Habari! 👋 I\'m Kip, your KIPS Kitui shopping assistant. I can help you find books for any class, estimate printing costs, or check delivery to your area. How can I help?',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || busy) return
    setInput('')
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-10) }),
      })
      const data = await res.json()
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.reply || data.error || 'Sorry, I did not catch that.' },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Network hiccup — please try again in a moment.' },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 size-14 rounded-full shadow-xl hover:scale-105 transition-transform"
          aria-label="Open AI shopping assistant"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b bg-primary/5 py-3">
            <SheetTitle className="flex items-center gap-2.5 px-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot size={19} />
              </div>
              <div>
                <p className="text-base leading-none">Kip — AI Assistant</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Online • KIPS Kitui expert
                </p>
              </div>
              <Sparkles size={15} className="ml-auto text-amber-500" />
            </SheetTitle>
          </SheetHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                    m.role === 'user'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm border bg-card'
                  )}
                  role={m.role === 'assistant' ? 'article' : undefined}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border bg-card px-4 py-3 shadow-sm">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="flex gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about books, prices, delivery…"
              aria-label="Message the AI assistant"
              disabled={busy}
            />
            <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={busy || !input.trim()} aria-label="Send message">
              <Send size={16} />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
