'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CalendarDays, Megaphone, Pin, PinOff, Plus, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api, del, patch, post } from '@/components/kip/lib/api'
import { fmtDateTime } from '@/components/kip/lib/format'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import type { AdminAnnouncement, ExportStats } from '@/components/kip/admin/types'
import { cn } from '@/lib/utils'

const AUDIENCES = ['ALL', 'STUDENTS', 'STAFF'] as const

function audienceLabel(audience: string): string {
  return audience === 'ALL' ? 'Everyone' : audience === 'STUDENTS' ? 'Students' : 'Staff'
}

function audienceTone(audience: string): string {
  switch (audience) {
    case 'STUDENTS':
      return 'border-transparent bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
    case 'STAFF':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    default:
      return 'border-transparent bg-teal-600/10 text-teal-700 dark:text-teal-400'
  }
}

export function AnnouncementsView() {
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminAnnouncement | null>(null)

  const { data, status, error, refetch } = useQuery<AdminAnnouncement[]>({
    queryKey: ['admin-announcements'],
    queryFn: () => api<AdminAnnouncement[]>('/api/admin/announcements'),
  })

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Announcements"
        description="Notices shown in the student and lecturer portals."
        actions={
          <Button className="min-h-11" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Announcement
          </Button>
        }
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<RowsSkeleton rows={4} />}
      >
        {data && data.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            hint="Publish notices to keep students and staff informed."
            className="py-16"
          />
        ) : (
          <ul className="space-y-4">
            {(data ?? []).map((a, i) => (
              <li key={a.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <AnnouncementCard announcement={a} onDelete={() => setDeleting(a)} />
                </motion.div>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>

      <AnnouncementDialog
        key={`announcement-${addOpen}`}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      {deleting && (
        <DeleteAnnouncementDialog announcement={deleting} onClose={() => setDeleting(null)} />
      )}
    </div>
  )
}

function AnnouncementCard({
  announcement,
  onDelete,
}: {
  announcement: AdminAnnouncement
  onDelete: () => void
}) {
  const queryClient = useQueryClient()

  const toggleActive = useMutation({
    mutationFn: () =>
      patch<AdminAnnouncement>(`/api/admin/announcements/${announcement.id}`, {
        active: !announcement.active,
      }),
    onSuccess: (updated) => {
      toast.success(updated.active ? 'Announcement activated' : 'Announcement hidden', {
        description: updated.title,
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
    onError: (err) => {
      toast.error('Could not update announcement', {
        description: err instanceof Error ? err.message : undefined,
      })
    },
  })

  return (
    <Card className={cn(announcement.pinned && 'border-l-2 border-l-gold-400/80')}>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{announcement.title}</p>
              {announcement.pinned && (
                <Badge className="border-transparent bg-gold-400/15 text-[10px] text-gold-700 dark:text-gold-300">
                  <Pin className="mr-1 h-3 w-3" aria-hidden="true" />
                  Pinned
                </Badge>
              )}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {announcement.authorName}
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300"
              >
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {fmtDateTime(announcement.createdAt)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-[10px] ${audienceTone(announcement.audience)}`}>
              {announcement.audience}
            </Badge>
            <Badge
              variant={announcement.active ? 'default' : 'secondary'}
              className="text-[10px]"
            >
              {announcement.active ? 'Active' : 'Hidden'}
            </Badge>
          </div>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{announcement.body}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            disabled={toggleActive.isPending}
            onClick={() => toggleActive.mutate()}
          >
            {announcement.active ? 'Hide' : 'Activate'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Delete announcement</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// New announcement dialog
// ---------------------------------------------------------------------------

function AnnouncementDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<string>('ALL')
  const [pinned, setPinned] = useState(false)
  const [active, setActive] = useState(true)
  const [notifyChannels, setNotifyChannels] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Task 8-c: live recipient counts for the audience preview
  const { data: stats } = useQuery<ExportStats>({
    queryKey: ['admin-export-stats', '', ''],
    queryFn: () => api<ExportStats>('/api/admin/export/stats'),
    staleTime: 60_000,
  })
  const recipientCount =
    audience === 'STUDENTS'
      ? stats?.audienceStudents
      : audience === 'STAFF'
        ? stats?.audienceStaff
        : stats?.audienceAll
  const recipientPhrase =
    recipientCount === undefined
      ? null
      : audience === 'STUDENTS'
        ? `${recipientCount} student${recipientCount === 1 ? '' : 's'}`
        : audience === 'STAFF'
          ? `${recipientCount} staff member${recipientCount === 1 ? '' : 's'}`
          : `${recipientCount} students & staff`

  const create = useMutation({
    mutationFn: () =>
      post<AdminAnnouncement>('/api/admin/announcements', {
        title: title.trim(),
        body: body.trim(),
        audience,
        pinned,
        active,
      }),
    onSuccess: (a) => {
      toast.success('Announcement published', {
        description: `${a.title} — ${a.audience.toLowerCase()} audience${a.pinned ? ', pinned' : ''}.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not publish the announcement.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setFormError('Title and body are required.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle>New announcement</DialogTitle>
          <DialogDescription>
            Active announcements appear instantly in the relevant portals.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="an-title" label="Title" required>
                <Input
                  id="an-title"
                  className="h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. January 2027 intake now open"
                  required
                />
              </Field>
              <Field id="an-body" label="Body" required>
                <Textarea
                  id="an-body"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Full notice text…"
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="an-audience" label="Audience" required>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger id="an-audience" className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map((a) => (
                        <SelectItem key={a} value={a}>
                          {audienceLabel(a)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {pinned ? (
                        <Pin className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                      ) : (
                        <PinOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                      <div>
                        <p className="text-sm font-medium">Pinned</p>
                        <p className="text-xs text-muted-foreground">Shows first.</p>
                      </div>
                    </div>
                    <Switch id="an-pinned" checked={pinned} onCheckedChange={setPinned} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Visible immediately.</p>
                    </div>
                    <Switch id="an-active" checked={active} onCheckedChange={setActive} />
                  </div>
                </div>
              </FieldGrid>

              {/* Task 8-c: audience badge preview + optional SMS/email dispatch note */}
              <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Delivery preview:</span>
                  <Badge className={`text-[10px] ${audienceTone(audience)}`}>
                    {audience === 'ALL' ? 'EVERYONE' : audience}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {recipientPhrase === null ? (
                      'Counting recipients…'
                    ) : (
                      <>
                        Appears for{' '}
                        <span className="font-semibold text-foreground">{recipientPhrase}</span>{' '}
                        on sign-in.
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="an-notify"
                    checked={notifyChannels}
                    onCheckedChange={(checked) => setNotifyChannels(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor="an-notify" className="text-sm font-medium leading-none">
                      Also notify via SMS / email
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Queue this notice for the college messaging gateway.
                    </p>
                    {notifyChannels && (
                      <p
                        role="note"
                        className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground"
                      >
                        <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                        <span>
                          SMS/email notifications will be dispatched to{' '}
                          <span className="font-semibold">
                            {audienceLabel(audience).toLowerCase()} recipients
                          </span>
                          {recipientCount !== undefined && (
                            <>
                              {' '}
                              (<span className="font-semibold">{recipientCount}</span>)
                            </>
                          )}
                          . Dispatch is handled by the communications office — no extra data is
                          stored with this announcement.
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {formError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {formError}
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => onOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <SubmitButton pending={create.isPending}>Publish announcement</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete confirm
// ---------------------------------------------------------------------------

function DeleteAnnouncementDialog({
  announcement,
  onClose,
}: {
  announcement: AdminAnnouncement
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => del<{ deleted: boolean }>(`/api/admin/announcements/${announcement.id}`),
    onSuccess: () => {
      toast.success('Announcement deleted', { description: announcement.title })
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
    onError: (err) => {
      toast.error('Could not delete announcement', {
        description: err instanceof Error ? err.message : undefined,
      })
      onClose()
    },
  })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{announcement.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The announcement is removed from every portal immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11" disabled={remove.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11 bg-destructive text-white hover:bg-destructive/90"
            disabled={remove.isPending}
            onClick={(e) => {
              e.preventDefault()
              remove.mutate()
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {remove.isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
