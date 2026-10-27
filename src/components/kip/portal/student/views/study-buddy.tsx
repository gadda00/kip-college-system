'use client'

import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Bot, ChevronDown, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { post } from '@/components/kip/lib/api'
import { cn } from '@/lib/utils'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SUGGESTED_PROMPTS = [
  'Explain the difference between TCP and UDP',
  'Make me a revision plan for this term',
  'How should I prepare for my final exams?',
]

/**
 * "Ask KIP Study Buddy" — inline AI study assistant card for the My Learning
 * page. Multi-turn history is client-state only; every turn is answered by the
 * auth-guarded POST /api/student/study-assistant endpoint (z-ai SDK, server
 * side only) which embeds the student's course, current units and study
 * materials in the system prompt.
 */
export function StudyBuddy({ unitNames }: { unitNames: string[] }) {
  const [open, setOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const greeting: string =
    unitNames.length > 0
      ? `Karibu! I'm **KIP Study Buddy** — your AI study companion. I already know your current units (${unitNames.slice(0, 4).join(', ')}${unitNames.length > 4 ? ' and others' : ''}). Ask me to explain a concept, quiz you, or plan your revision.`
      : 'Karibu! I\'m **KIP Study Buddy** — your AI study companion. Ask me to explain a concept from your course, quiz you, or plan your revision.'

  // autoscroll to the newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el && open) el.scrollTop = el.scrollHeight
  }, [messages, pending, open])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || pending) return

    setError(null)
    setInput('')
    const history: ChatMessage[] = [
      { role: 'assistant', content: greeting },
      ...messages,
      { role: 'user', content },
    ]
    setMessages(history.slice(1))
    setPending(true)

    try {
      const { reply } = await post<{ reply: string }>('/api/student/study-assistant', {
        messages: history,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'The study buddy is unavailable right now.'
      setError(message)
      toast.error('KIP Study Buddy', {
        description: 'Could not send your message — please try again.',
      })
    } finally {
      setPending(false)
    }
  }

  const visible = [{ role: 'assistant' as const, content: greeting }, ...messages]

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      aria-labelledby="study-buddy"
    >
      <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="study-buddy-panel"
                className="flex w-full items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <CardTitle id="study-buddy" className="flex flex-wrap items-center gap-2 text-base">
                    Ask KIP Study Buddy
                    <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
                      <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                      AI tutor · knows your units
                    </Badge>
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explanations, revision plans and past-paper guidance for your course.
                  </p>
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                    open && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent id="study-buddy-panel">
            <CardContent className="p-4 pt-4 sm:p-5 sm:pt-4">
              {/* messages */}
              <div
                ref={scrollRef}
                className="custom-scrollbar max-h-80 space-y-3 overflow-y-auto rounded-xl border bg-muted/30 p-3"
                aria-live="polite"
              >
                {visible.map((m, i) => (
                  <div
                    key={i}
                    className={cn('flex items-end gap-2', m.role === 'user' && 'justify-end')}
                  >
                    {m.role === 'assistant' && (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <KipCrest className="h-5 w-5" />
                      </span>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm bg-muted text-foreground',
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
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <KipCrest className="h-5 w-5" />
                    </span>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                          style={{ animationDelay: `${dot * 0.15}s` }}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="sr-only">Study Buddy is typing</span>
                    </div>
                  </div>
                )}

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    {error} — please try again.
                  </p>
                )}

                {/* suggested prompts before the first question */}
                {messages.length === 0 && !pending && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => send(prompt)}
                        className="min-h-9 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* input */}
              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  send(input)
                }}
              >
                <label htmlFor="study-buddy-input" className="sr-only">
                  Ask your study question
                </label>
                <input
                  id="study-buddy-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about any unit, concept or exam prep…"
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message to KIP Study Buddy"
                  disabled={pending || !input.trim()}
                  className="h-11 w-11 shrink-0"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Study Buddy is an AI helper — always cross-check with your lecture notes and ask
                your lecturer when unsure.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.section>
  )
}
