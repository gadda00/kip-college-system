'use client'

import { useQuery } from '@tanstack/react-query'
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
                className="group grid w-full grid-cols-1 overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:grid-cols-2"
                aria-label={`Read featured story: ${featured.title}`}
              >
                <div className="aspect-[16/9] overflow-hidden bg-muted lg:aspect-auto lg:min-h-72">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge className="bg-primary text-primary-foreground">{featured.category}</Badge>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {fmtDate(featured.publishedAt)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-balance text-xl font-bold leading-snug tracking-tight sm:text-2xl">
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
                    className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    aria-label={`Read: ${post.title}`}
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span>{fmtDate(post.publishedAt)}</span>
                      </div>
                      <h3 className="mt-2 line-clamp-2 font-semibold leading-snug">{post.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
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
