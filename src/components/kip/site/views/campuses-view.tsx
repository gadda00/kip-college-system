'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[28rem] rounded-2xl" />
            ))}
          </div>
        ) : campuses.isError ? (
          <ErrorPanel error={campuses.error} onRetry={() => campuses.refetch()} />
        ) : (campuses.data?.length ?? 0) === 0 ? (
          <EmptyState icon={Building2} title="No campuses listed" hint="Campus information is being updated." />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {campuses.data!.map((campus) => (
              <motion.article
                key={campus.id}
                {...fadeUp}
                className="card-lift flex flex-col overflow-hidden rounded-2xl border border-brand-900/10 bg-card shadow-sm"
              >
                <figure className="relative min-h-52">
                  <Image
                    src={campus.image}
                    alt={`${campus.name} — ${campus.location}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-brand-950/10 to-transparent"
                  />
                  <Badge className="absolute left-3 top-3 border-transparent bg-brand-900/90 text-[#f2efe6] shadow-sm backdrop-blur-sm">
                    {campus.code}
                  </Badge>
                  <figcaption className="sr-only">{campus.name}</figcaption>
                </figure>

                {/* gold MapPin header band */}
                <div className="bg-brand-50 dark:bg-brand-100/40">
                  <div className="flex items-start gap-3 p-5 sm:p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-gold-700 dark:bg-gold-400/15 dark:text-gold-400">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                        {campus.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">{campus.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">{campus.description}</p>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Facilities
                    </h3>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {campus.facilitiesList.map((facility) => (
                        <li key={facility}>
                          <Badge
                            variant="outline"
                            className="gap-1.5 border-brand-900/15 bg-brand-50/60 px-3 py-1 font-normal text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-[#f2efe6]/85"
                          >
                            <CheckCircle2 className="h-3 w-3 text-gold-500" aria-hidden="true" />
                            {facility}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-brand-900/10 pt-4 text-sm">
                    <a
                      href={`tel:${campus.phone.replace(/\s/g, '')}`}
                      className="flex min-h-11 items-center gap-2 font-medium text-primary transition-colors hover:text-gold-600 hover:underline dark:hover:text-gold-400"
                    >
                      <Phone className="h-4 w-4 text-gold-500" aria-hidden="true" /> {campus.phone}
                    </a>
                    <a
                      href={`mailto:${campus.email}`}
                      className="flex min-h-11 items-center gap-2 font-medium text-primary transition-colors hover:text-gold-600 hover:underline dark:hover:text-gold-400"
                    >
                      <Mail className="h-4 w-4 text-gold-500" aria-hidden="true" /> {campus.email}
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${campus.name}, ${campus.location}, Kitui, Kenya`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-card px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-gold-500/60 hover:bg-accent hover:text-accent-foreground dark:border-stone-700 dark:bg-input/30 dark:hover:border-gold-400/50"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Get directions
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* note + visit CTA */}
        <motion.div {...fadeUp} className="mt-12">
          <div className="bg-brand-band kip-grain relative overflow-hidden rounded-2xl text-[#f2efe6] shadow-lg">
            <div aria-hidden="true" className="kip-pattern absolute inset-0" />
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-5 p-6 text-center sm:p-8">
              <p className="eyebrow text-gold-400">Same quality, three locations</p>
              <p className="max-w-2xl text-pretty text-sm leading-relaxed text-[#f2efe6]/80">
                <strong className="font-semibold text-[#f2efe6]">
                  All campuses offer the full programme catalogue
                </strong>{' '}
                — technical, business and KASNEB courses — with the same quality of teaching, examinations
                support and student services. Evening, weekend and holiday classes are available for working
                students.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => navigate('/apply')}
                  className="btn-gold min-h-11 border-0 text-brand-950 hover:bg-gold-400 hover:text-brand-950"
                >
                  Apply to study with us
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="min-h-11 border-white/25 bg-white/5 text-[#f2efe6] hover:border-gold-400/60 hover:bg-white/10 hover:text-gold-300 dark:border-white/25 dark:bg-white/5 dark:text-[#f2efe6] dark:hover:border-gold-400/60 dark:hover:bg-white/10 dark:hover:text-gold-300"
                >
                  Plan a campus visit
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
