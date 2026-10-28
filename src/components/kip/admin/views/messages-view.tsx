'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCheck, Inbox, Mail, MailCheck, Phone, Reply } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api, patch } from '@/components/kip/lib/api'
import { fmtDateTime } from '@/components/kip/lib/format'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import type { AdminMessage } from '@/components/kip/admin/types'
import { cn } from '@/lib/utils'

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'NEW') return 'default'
  if (status === 'REPLIED') return 'secondary'
  return 'outline'
}

function statusTone(status: string): string {
  switch (status) {
    case 'NEW':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    case 'REPLIED':
      return 'border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

export function MessagesView() {
  const [selected, setSelected] = useState<AdminMessage | null>(null)

  const { data, status, error, refetch } = useQuery<AdminMessage[]>({
    queryKey: ['admin-messages'],
    queryFn: () => api<AdminMessage[]>('/api/admin/messages'),
  })

  const newCount = (data ?? []).filter((m) => m.status === 'NEW').length

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Messages"
        description={
          newCount > 0
            ? `${newCount} new message${newCount === 1 ? '' : 's'} from the website contact form.`
            : 'Contact-form enquiries from the public website.'
        }
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<RowsSkeleton rows={3} />}
      >
        {data && data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No messages"
            hint="Enquiries sent through the website contact form land here."
            className="py-16"
          />
        ) : (
          <ul className="space-y-3">
            {(data ?? []).map((m, i) => (
              <li key={m.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(m)}
                    className={cn(
                      'focus-glow w-full rounded-xl border p-4 text-left transition-colors hover:border-brand-600/40 hover:bg-brand-50/60 dark:hover:border-brand-500/40 dark:hover:bg-brand-100/30 sm:p-5',
                      m.status === 'NEW' && 'border-gold-400/50 bg-gold-400/10 hover:border-gold-400/70 hover:bg-gold-400/15 dark:hover:border-gold-400/70 dark:hover:bg-gold-400/15',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {m.status === 'NEW' && (
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full bg-gold-500 ring-4 ring-gold-400/20"
                          />
                        )}
                        <p className="text-sm font-semibold">{m.name}</p>
                        <Badge className={`text-[10px] font-semibold ${statusTone(m.status)}`}>
                          {m.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {fmtDateTime(m.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{m.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.message}</p>
                  </button>
                </motion.div>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>

      {selected && <MessageDialog message={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function MessageDialog({
  message,
  onClose,
}: {
  message: AdminMessage
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      patch<AdminMessage>(`/api/admin/messages/${message.id}`, { status }),
    onSuccess: (updated) => {
      toast.success(
        updated.status === 'READ' ? 'Marked as read' : 'Marked as replied',
        { description: `${updated.name} — ${updated.subject}.` },
      )
      void queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
      onClose()
    },
    onError: (err) => {
      toast.error('Could not update message', {
        description: err instanceof Error ? err.message : undefined,
      })
    },
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            From {message.name} · {fmtDateTime(message.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 rounded-xl border p-4 text-xs text-muted-foreground sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate">{message.email ?? '—'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                {message.phone ?? '—'}
              </p>
              <p className="flex items-center gap-2 sm:col-span-2">
                <Badge variant={statusVariant(message.status)} className="text-[10px]">
                  {message.status}
                </Badge>
              </p>
            </div>
            <p className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed">
              {message.message}
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={updateStatus.isPending || message.status === 'READ'}
            onClick={() => updateStatus.mutate('READ')}
          >
            <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            {message.status === 'READ' ? 'Already read' : 'Mark read'}
          </Button>
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={updateStatus.isPending || message.status === 'REPLIED'}
            onClick={() => updateStatus.mutate('REPLIED')}
          >
            {message.status === 'REPLIED' ? (
              <>
                <MailCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Already replied
              </>
            ) : (
              <>
                <Reply className="mr-2 h-4 w-4" aria-hidden="true" />
                Mark replied
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
