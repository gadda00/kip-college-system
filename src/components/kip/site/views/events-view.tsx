'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CalendarClock, CalendarDays, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorPanel } from '@/components/kip/components/loading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { PageHero } from '@/components/kip/components/page-hero'
import { api } from '@/components/kip/lib/api'
import { fmtDateTime } from '@/components/kip/lib/format'
import type { EventItem } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

export function EventsView() {
  const events = useQuery({
    queryKey: ['public-events'],
    queryFn: () => api<EventItem[]>('/api/public/events'),
  })

  return (
    <div>
      <PageHero
        eyebrow="What's on"
        title="Events"
        subtitle="Ceremonies, clinics, open days and academic calendar highlights — upcoming events across all campuses."
        breadcrumb={[{ label: 'Events' }]}
      />

      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Upcoming events">
        {events.isPending ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : events.isError ? (
          <ErrorPanel error={events.error} onRetry={() => events.refetch()} />
        ) : (events.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            hint="New events will be announced here — check back soon or follow us on social media."
          />
        ) : (
          <ol className="relative space-y-6 border-l-2 border-primary/20 pl-6 sm:pl-8">
            {events.data!.map((event, i) => {
              const date = new Date(event.date)
              const isPast = date < new Date()
              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.25, delay: Math.min(i, 5) * 0.05 }}
                  className="relative"
                >
                  {/* timeline dot */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-[31px] top-8 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary sm:-left-[41px]"
                  />
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row">
                        {/* date block */}
                        <div
                          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
                          aria-label={fmtDateTime(event.date)}
                        >
                          <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider">
                            {date.toLocaleDateString('en-GB', { month: 'short' })}
                          </span>
                          <span className="text-[10px] opacity-80">
                            {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold leading-snug">{event.title}</h2>
                            {isPast && (
                              <Badge variant="outline" className="text-muted-foreground">
                                Past
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarClock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            {fmtDateTime(event.date)}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            {event.venue}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              )
            })}
          </ol>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" className="min-h-11" onClick={() => navigate('/contact')}>
            Questions about an event? Contact us
          </Button>
        </div>
      </section>
    </div>
  )
}
