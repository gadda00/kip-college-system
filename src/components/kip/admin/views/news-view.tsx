'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Eye,
  EyeOff,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/kip/components/empty-state'
import { ListSkeleton, QueryBoundary } from '@/components/kip/components/loading'
import { api, del, patch, post as postApi } from '@/components/kip/lib/api'
import { fmtDate, fmtDateTime } from '@/components/kip/lib/format'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import type { AdminEvent, AdminNewsPost } from '@/components/kip/admin/types'

/** Site image library available for news posts. */
const IMAGE_OPTIONS = [
  '/images/hero-campus.png',
  '/images/about-campus.png',
  '/images/campus-main.png',
  '/images/campus-town.png',
  '/images/campus-mwingi.png',
  '/images/cat-technical.png',
  '/images/cat-business.png',
  '/images/cat-kasneb.png',
  '/images/gallery-computer-lab.png',
  '/images/gallery-library.png',
  '/images/gallery-workshop.png',
  '/images/gallery-graduation.png',
  '/images/gallery-catering.png',
  '/images/gallery-beauty.png',
]

export function NewsView() {
  return (
    <div className="space-y-6">
      <ViewHeading
        title="News & events"
        description="Website stories and the public events calendar."
      />
      <Tabs defaultValue="news">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger
            value="news"
            className="min-h-9 flex-1 gap-2 data-[state=active]:bg-brand-700 dark:data-[state=active]:bg-brand-700 data-[state=active]:text-[#f2efe6] data-[state=active]:shadow-none sm:flex-none"
          >
            <Newspaper className="h-4 w-4" aria-hidden="true" />
            News
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="min-h-9 flex-1 gap-2 data-[state=active]:bg-brand-700 dark:data-[state=active]:bg-brand-700 data-[state=active]:text-[#f2efe6] data-[state=active]:shadow-none sm:flex-none"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Events
          </TabsTrigger>
        </TabsList>
        <TabsContent value="news" className="mt-4">
          <NewsSection />
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          <EventsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

function NewsSection() {
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<AdminNewsPost | null>(null)
  const [deleting, setDeleting] = useState<AdminNewsPost | null>(null)

  const { data, status, error, refetch } = useQuery<AdminNewsPost[]>({
    queryKey: ['admin-news'],
    queryFn: () => api<AdminNewsPost[]>('/api/admin/news'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data?.length ?? 0} post{data?.length === 1 ? '' : 's'} · published ones appear on the
          website.
        </p>
        <Button
          className="min-h-11"
          onClick={() => {
            setEditing(null)
            setEditOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          New Post
        </Button>
      </div>

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<ListSkeleton rows={3} />}
      >
        {data && data.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No news posts"
            hint="Publish stories to keep the website fresh."
            className="py-16"
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {(data ?? []).map((n, i) => (
              <li key={n.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <NewsCard
                    post={n}
                    onEdit={() => {
                      setEditing(n)
                      setEditOpen(true)
                    }}
                    onDelete={() => setDeleting(n)}
                  />
                </motion.div>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>

      <NewsDialog
        key={`news-${editOpen}-${editing?.id ?? 'new'}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        post={editing}
      />
      {deleting && <DeleteNewsDialog post={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}

function NewsCard({
  post,
  onEdit,
  onDelete,
}: {
  post: AdminNewsPost
  onEdit: () => void
  onDelete: () => void
}) {
  const queryClient = useQueryClient()

  const togglePublish = useMutation({
    mutationFn: () =>
      patch<AdminNewsPost>(`/api/admin/news/${post.id}`, { published: !post.published }),
    onSuccess: (updated) => {
      toast.success(updated.published ? 'Post published' : 'Post unpublished', {
        description: updated.title,
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-news'] })
    },
    onError: (err) => {
      toast.error('Could not update post', {
        description: err instanceof Error ? err.message : undefined,
      })
    },
  })

  return (
    <Card className="h-full overflow-hidden">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
        {/* plain <img> — public site asset, remote next/image not needed */}
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute right-2 top-2 flex gap-1.5">
          <Badge
            className={`text-[10px] ${
              post.published
                ? 'border-transparent bg-emerald-700/95 text-white'
                : 'border-transparent bg-muted text-muted-foreground'
            }`}
          >
            {post.published ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </div>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {post.category}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300">
              {fmtDate(post.publishedAt)}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold leading-snug">{post.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">By {post.author}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            disabled={togglePublish.isPending}
            onClick={() => togglePublish.mutate()}
          >
            {post.published ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                Publish
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="min-h-11" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Delete post</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type NewsForm = {
  title: string
  excerpt: string
  body: string
  image: string
  category: string
  author: string
  published: boolean
}

const EMPTY_NEWS: NewsForm = {
  title: '',
  excerpt: '',
  body: '',
  image: IMAGE_OPTIONS[1]!,
  category: 'News',
  author: 'Communications Office',
  published: false,
}

function newsToForm(n: AdminNewsPost): NewsForm {
  return {
    title: n.title,
    excerpt: n.excerpt,
    body: n.body,
    image: n.image,
    category: n.category,
    author: n.author,
    published: n.published,
  }
}

function NewsDialog({
  open,
  onOpenChange,
  post,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: AdminNewsPost | null
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<NewsForm>(() =>
    post ? newsToForm(post) : EMPTY_NEWS,
  )
  const [formError, setFormError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        body: form.body.trim(),
        image: form.image,
        category: form.category.trim() || 'News',
        author: form.author.trim() || 'Communications Office',
        published: form.published,
      }
      return post
        ? patch<AdminNewsPost>(`/api/admin/news/${post.id}`, payload)
        : postApi<AdminNewsPost>('/api/admin/news', payload)
    },
    onSuccess: (saved) => {
      toast.success(post ? 'Post updated' : 'Post created', {
        description: `${saved.title}${saved.published ? ' — published.' : ' — saved as draft.'}`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-news'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not save the post.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.excerpt.trim() || form.body.trim().length < 10) {
      setFormError('Title, excerpt and a body (min 10 characters) are required.')
      return
    }
    setFormError(null)
    save.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle>{post ? 'Edit news post' : 'New news post'}</DialogTitle>
          <DialogDescription>
            Published posts appear on the public News page immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="np-title" label="Title" required>
                <Input
                  id="np-title"
                  className="h-11"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </Field>
              <Field id="np-excerpt" label="Excerpt" required>
                <Textarea
                  id="np-excerpt"
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="One-sentence summary for cards and previews."
                  required
                />
              </Field>
              <Field id="np-body" label="Body" required>
                <Textarea
                  id="np-body"
                  rows={6}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="np-image" label="Image" required>
                  <Select
                    value={form.image}
                    onValueChange={(v) => setForm((f) => ({ ...f, image: v }))}
                  >
                    <SelectTrigger id="np-image" className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {IMAGE_OPTIONS.map((img) => (
                        <SelectItem key={img} value={img}>
                          {img.replace('/images/', '').replace('.png', '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="np-category" label="Category">
                  <Input
                    id="np-category"
                    className="h-11"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="News / Academics / Sports…"
                  />
                </Field>
              </FieldGrid>
              <Field id="np-author" label="Author">
                <Input
                  id="np-author"
                  className="h-11"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                />
              </Field>
              <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="text-sm font-medium">Publish immediately</p>
                  <p className="text-xs text-muted-foreground">
                    Unpublished posts stay as drafts only admins can see.
                  </p>
                </div>
                <Switch
                  id="np-published"
                  checked={form.published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                />
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
              disabled={save.isPending}
            >
              Cancel
            </Button>
            <SubmitButton pending={save.isPending}>
              {post ? 'Save changes' : 'Create post'}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteNewsDialog({ post, onClose }: { post: AdminNewsPost; onClose: () => void }) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => del<{ deleted: boolean }>(`/api/admin/news/${post.id}`),
    onSuccess: () => {
      toast.success('Post deleted', { description: post.title })
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['admin-news'] })
    },
    onError: (err) => {
      toast.error('Could not delete post', {
        description: err instanceof Error ? err.message : undefined,
      })
      onClose()
    },
  })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{post.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The post and its image reference are removed from the website.
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
            {remove.isPending ? 'Deleting…' : 'Delete post'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function EventsSection() {
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminEvent | null>(null)

  const { data, status, error, refetch } = useQuery<AdminEvent[]>({
    queryKey: ['admin-events'],
    queryFn: () => api<AdminEvent[]>('/api/admin/events'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data?.length ?? 0} event{data?.length === 1 ? '' : 's'} on the public calendar.
        </p>
        <Button className="min-h-11" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Event
        </Button>
      </div>

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<RowsSkeleton rows={3} />}
      >
        {data && data.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events"
            hint="Add open days, clinics and ceremonies to the calendar."
            className="py-16"
          />
        ) : (
          <ul className="space-y-4">
            {(data ?? []).map((ev, i) => (
              <li key={ev.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <Card>
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                          <span className="text-[10px] font-bold uppercase">
                            {new Date(ev.date).toLocaleDateString('en-GB', { month: 'short' })}
                          </span>
                          <span className="font-display text-lg font-black leading-none">
                            {new Date(ev.date).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{ev.title}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {ev.venue}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                            {fmtDateTime(ev.date)}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {ev.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(ev)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>

      <AddEventDialog
        key={`event-${addOpen}`}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      {deleting && <DeleteEventDialog event={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}

function AddEventDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [venue, setVenue] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      postApi<AdminEvent>('/api/admin/events', {
        title: title.trim(),
        description: description.trim(),
        date: date ? new Date(`${date}T${time || '10:00'}`).toISOString() : undefined,
        venue: venue.trim(),
      }),
    onSuccess: (ev) => {
      toast.success('Event added', {
        description: `${ev.title} — ${fmtDate(ev.date)} at ${ev.venue}.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not add the event.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !date || !venue.trim()) {
      setFormError('Title, description, date and venue are required.')
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
          <DialogTitle>Add event</DialogTitle>
          <DialogDescription>Upcoming events show on the public website.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="ev-title" label="Title" required>
                <Input
                  id="ev-title"
                  className="h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open Day — January Intake"
                  required
                />
              </Field>
              <Field id="ev-desc" label="Description" required>
                <Textarea
                  id="ev-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="ev-date" label="Date" required>
                  <Input
                    id="ev-date"
                    type="date"
                    className="h-11"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Field>
                <Field id="ev-time" label="Start time">
                  <Input
                    id="ev-time"
                    type="time"
                    className="h-11"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </Field>
              </FieldGrid>
              <Field id="ev-venue" label="Venue" required>
                <Input
                  id="ev-venue"
                  className="h-11"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Main Campus Hall"
                  required
                />
              </Field>
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
            <SubmitButton pending={create.isPending}>Add event</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteEventDialog({ event, onClose }: { event: AdminEvent; onClose: () => void }) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => del<{ deleted: boolean }>(`/api/admin/events/${event.id}`),
    onSuccess: () => {
      toast.success('Event deleted', { description: event.title })
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] })
    },
    onError: (err) => {
      toast.error('Could not delete event', {
        description: err instanceof Error ? err.message : undefined,
      })
      onClose()
    },
  })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{event.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The event is removed from the public calendar.
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
            {remove.isPending ? 'Deleting…' : 'Delete event'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
