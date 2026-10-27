'use client'

import { useQuery } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { ArrowLeft, ArrowRight, CalendarDays, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorPanel } from '@/components/kip/components/loading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { api } from '@/components/kip/lib/api'
import { fmtDate } from '@/components/kip/lib/format'
import type { NewsPost } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

export function NewsDetailView({ newsId }: { newsId: string }) {
  const post = useQuery({
    queryKey: ['public-news', newsId],
    queryFn: () => api<NewsPost>(`/api/public/news/${newsId}`),
    enabled: Boolean(newsId),
    retry: (count, error) => {
      if (error instanceof Error && error.message.toLowerCase().includes('not found')) return false
      return count < 1
    },
  })

  if (post.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-6 aspect-[16/8] w-full rounded-2xl" />
        <Skeleton className="mt-6 h-9 w-4/5" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (post.isError || !post.data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorPanel error={post.error ?? new Error('Story not found')} onRetry={() => post.refetch()} />
        <div className="mt-6 text-center">
          <Button variant="outline" className="min-h-11" onClick={() => navigate('/news')}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to news
          </Button>
        </div>
      </div>
    )
  }

  const data = post.data

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/news')}
        className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to news
      </button>

      <article>
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <img src={data.image} alt={data.title} className="aspect-[16/8] w-full object-cover" />
        </div>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge className="bg-primary text-primary-foreground">{data.category}</Badge>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={data.publishedAt}>{fmtDate(data.publishedAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              {data.author}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {data.title}
          </h1>
          <p className="mt-3 border-l-2 border-sky-500 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {data.excerpt}
          </p>
        </header>

        <div className="chat-markdown mt-8">
          <Markdown>{data.body}</Markdown>
        </div>
      </article>

      {/* CTA */}
      <Card className="mt-12 border-primary/15 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold">Ready to join KIP College?</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Applications for the next intake are open — apply online for free and get a response
            within 48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/apply')} className="min-h-11">
              Apply Now
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/academics')} className="min-h-11">
              View programmes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
