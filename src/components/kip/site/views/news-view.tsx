'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorPanel } from '@/components/kip/components/loading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { PageHero } from '@/components/kip/components/page-hero'
import { api } from '@/components/kip/lib/api'
import { fmtDate } from '@/components/kip/lib/format'
import type { NewsPost } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

/** Gold date chip shared by featured + grid cards. */
function DateChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700 dark:text-gold-300">
      <CalendarDays className="h-3 w-3" aria-hidden="true" />
      <time dateTime={value}>{fmtDate(value)}</time>
    </span>
  )
}

export function NewsView() {
  const news = useQuery({
    queryKey: ['public-news'],
    queryFn: () => api<NewsPost[]>('/api/public/news'),
  })

  const posts = news.data ?? []
  const [featured, ...rest] = posts

  return (
    <div>
      <PageHero
        eyebrow="Communications"
        title="News & Stories"
        subtitle="Updates, achievements and announcements from across the college."
        breadcrumb={[{ label: 'News' }]}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-label="News articles">
        {news.isPending ? (
          <div className="space-y-8">
            <Skeleton className="h-80 rounded-2xl" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        ) : news.isError ? (
          <ErrorPanel error={news.error} onRetry={() => news.refetch()} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No stories yet"
            hint="College news and announcements will appear here."
          />
        ) : (
          <div className="space-y-10">
            {/* featured */}
            {featured && (
              <motion.button
                type="button"
                {...fadeUp}
                onClick={() => navigate(`/news/${featured.id}`)}
                className="group card-lift grid w-full grid-cols-1 overflow-hidden rounded-2xl border bg-card text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:grid-cols-2"
                aria-label={`Read featured story: ${featured.title}`}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted lg:aspect-auto lg:min-h-72">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-950/50 to-transparent"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-gold-500/50 bg-gold-400/95 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0e2233] shadow-sm">
                    ★ Featured
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="eyebrow">Latest story</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{featured.category}</Badge>
                    <DateChip value={featured.publishedAt} />
                  </div>
                  <h2 className="font-display mt-3 text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {featured.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Read full story
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </motion.button>
            )}

            {/* grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <motion.button
                    key={post.id}
                    type="button"
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: (i % 3) * 0.07 }}
                    onClick={() => navigate(`/news/${post.id}`)}
                    className="group card-lift flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    aria-label={`Read: ${post.title}`}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <DateChip value={post.publishedAt} />
                      </div>
                      <h3 className="font-display mt-2.5 line-clamp-2 font-semibold leading-snug">
                        {post.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-primary">
                        Read more
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
