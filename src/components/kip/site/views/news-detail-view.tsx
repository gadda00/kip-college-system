'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Markdown from 'react-markdown'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Share2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
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

  const handleShare = async (title: string) => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
    } catch {
      // user dismissed the native share sheet — fall back to copying the link
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied', {
        description: 'Share this story with friends and family.',
      })
    } catch {
      toast.error('Could not copy the link', {
        description: 'Copy it from your browser address bar instead.',
      })
    }
  }

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" className="min-h-11" onClick={() => navigate('/news')}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to news
        </Button>
        <Button
          variant="outline"
          className="min-h-11 hover:border-brand-700 hover:bg-brand-700 hover:text-[#f2efe6]"
          onClick={() => handleShare(data.title)}
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Share story
        </Button>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="relative aspect-[16/8] overflow-hidden rounded-2xl shadow-sm">
          <Image
            src={data.image}
            alt={data.title}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        </div>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge className="border border-gold-500/40 bg-gold-400/15 text-gold-700 dark:text-gold-300">
              {data.category}
            </Badge>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400"
                aria-hidden="true"
              />
              <time dateTime={data.publishedAt}>{fmtDate(data.publishedAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound
                className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400"
                aria-hidden="true"
              />
              {data.author}
            </span>
          </div>
          <h1 className="mt-4 text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {data.title}
          </h1>
          <div className="gold-rule mt-4" aria-hidden="true" />
          <p className="mt-4 border-l-[3px] border-gold-400/70 pl-4 text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            {data.excerpt}
          </p>
        </header>

        <div className="chat-markdown mt-8">
          <Markdown>{data.body}</Markdown>
        </div>
      </motion.article>

      {/* CTA — sapphire band with gold action */}
      <Card className="bg-brand-band kip-pattern kip-grain relative mt-12 overflow-hidden border-0 text-[#f2efe6]">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl"
        />
        <CardContent className="relative flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
            Ready to join KIP College?
          </p>
          <h2 className="font-display text-lg font-semibold text-[#f2efe6] sm:text-xl">
            Applications for the next intake are open
          </h2>
          <p className="max-w-md text-sm text-[#f2efe6]/70">
            Apply online for free and get a response within 48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/apply')} className="btn-gold min-h-11 font-semibold">
              Apply Now
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/academics')}
              className="min-h-11 border-white/25 bg-transparent text-[#f2efe6] hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-300"
            >
              View programmes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
