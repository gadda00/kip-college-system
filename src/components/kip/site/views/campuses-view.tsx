'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorPanel } from '@/components/kip/components/loading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { PageHero } from '@/components/kip/components/page-hero'
import { api } from '@/components/kip/lib/api'
import type { Campus } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

export function CampusesView() {
  const campuses = useQuery({
    queryKey: ['public-campuses', 'view'],
    queryFn: () => api<Campus[]>('/api/public/campuses'),
  })

  return (
    <div>
      <PageHero
        eyebrow="Locations"
        title="Our Campuses"
        subtitle="Three campuses across Kitui County — Wikililye, Kitui CBD and Mwingi Town — all offering the full programme catalogue."
        breadcrumb={[{ label: 'Campuses' }]}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Campus list">
        {campuses.isPending ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : campuses.isError ? (
          <ErrorPanel error={campuses.error} onRetry={() => campuses.refetch()} />
        ) : (campuses.data?.length ?? 0) === 0 ? (
          <EmptyState icon={Building2} title="No campuses listed" hint="Campus information is being updated." />
        ) : (
          <div className="space-y-10">
            {campuses.data!.map((campus, i) => (
              <motion.article
                key={campus.id}
                {...fadeUp}
                className={`grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-2 ${
                  i % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
                }`}
              >
                <figure className="relative min-h-56 lg:min-h-full">
                  <img
                    src={campus.image}
                    alt={`${campus.name} — ${campus.location}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption className="sr-only">{campus.name}</figcaption>
                </figure>
                <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                  <div>
                    <Badge className="bg-primary text-primary-foreground">{campus.code}</Badge>
                    <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                      {campus.name}
                    </h2>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                      {campus.location}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{campus.description}</p>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Facilities
                    </h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {campus.facilitiesList.map((facility) => (
                        <li key={facility}>
                          <Badge
                            variant="outline"
                            className="gap-1 border-primary/25 font-normal text-primary"
                          >
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            {facility}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t pt-4 text-sm">
                    <a
                      href={`tel:${campus.phone.replace(/\s/g, '')}`}
                      className="flex min-h-9 items-center gap-2 font-medium text-primary transition-colors hover:underline"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" /> {campus.phone}
                    </a>
                    <a
                      href={`mailto:${campus.email}`}
                      className="flex min-h-9 items-center gap-2 font-medium text-primary transition-colors hover:underline"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" /> {campus.email}
                    </a>
                  </div>
                </CardContent>
              </motion.article>
            ))}
          </div>
        )}

        {/* note + visit CTA */}
        <motion.div {...fadeUp} className="mt-12">
          <Card className="border-primary/15 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">All campuses offer the full programme catalogue</strong>{' '}
                — technical, business and KASNEB courses — with the same quality of teaching,
                examinations support and student services. Evening, weekend and holiday classes are
                available for working students.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => navigate('/apply')} className="min-h-11">
                  Apply to study with us
                </Button>
                <Button variant="outline" onClick={() => navigate('/contact')} className="min-h-11">
                  Plan a campus visit
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
