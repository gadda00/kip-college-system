'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowDown,
  ArrowRight,
  Banknote,
  ChevronDown,
  Clock3,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeading } from '@/components/kip/components/section-heading'
import { CourseFinder } from '@/components/kip/components/course-finder'
import { ErrorPanel } from '@/components/kip/components/loading'
import { KipLink } from '@/components/kip/components/link'
import { api } from '@/components/kip/lib/api'
import { categoryMeta, fmtDate, fmtDuration, fmtKES } from '@/components/kip/lib/format'
import { nextIntake } from '@/components/kip/lib/intake'
import type {
  Campus,
  FAQ,
  NewsPost,
  PublicCourse,
  PublicOverview,
  Testimonial,
} from '@/components/kip/lib/types'

// ─────────────────────────────────────────────────────────────
// Static presentation data
// ─────────────────────────────────────────────────────────────

/** Examining & accreditation bodies — small bordered chips in the hero (no gold). */
const TRUST_BODIES = ['KNEC', 'TVET CDACC', 'NITA', 'KASNEB'] as const

/** Contact constants used across the page. */
const WHATSAPP_URL = 'https://wa.me/254703710879'
const FINANCE_PHONE = '0703 710 879'

/** Two-line outcome blurbs for the three pathway cards. */
const PATHWAY_OUTCOMES: Record<string, string> = {
  TECHNICAL:
    'Become an engineer, technician, caterer or tradesperson — hands-on skills in real workshops that employers hire for.',
  BUSINESS:
    'Run operations, people, records and supply chains — office-ready training for firms, SACCOs, NGOs and county offices.',
  KASNEB:
    'Qualify as an accountant, secretary or investment analyst — professional papers respected by employers nationwide.',
}

/** Payment channels shown in the fees section. */
const PAYMENT_CHANNELS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Smartphone,
    title: 'M-Pesa',
    text: 'Paybill 522 890 — Account: your admission number',
  },
  {
    icon: Landmark,
    title: 'Equity Bank',
    text: 'Direct deposit at any Equity Bank branch',
  },
  {
    icon: Banknote,
    title: 'Cash',
    text: 'Finance office at any campus, during opening hours',
  },
]

/** Opening hours per campus (Town runs extended hours for evening learners). */
const CAMPUS_HOURS: Record<string, string> = {
  MAIN: 'Mon–Fri 8am–5pm · Sat 8am–1pm',
  TOWN: 'Mon–Fri 8am–8.30pm · Sat 8am–4pm',
  MWINGI: 'Mon–Fri 8am–5pm · Sat 8am–1pm',
}

/** Quiet entrance reveal shared by section content blocks. */
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

// ─────────────────────────────────────────────────────────────
// Local components
// ─────────────────────────────────────────────────────────────

/** Decorative scroll cue: chevron bottom-right of the hero, fades out on scroll. */
function HeroScrollCue() {
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    const onScroll = () => setFaded(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-6 right-6 hidden text-[#f2efe6]/60 transition-opacity duration-500 sm:block ${
        faded ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <ChevronDown className="h-6 w-6 motion-safe:animate-bounce" />
    </div>
  )
}

function CountdownChip({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="min-w-[4.25rem] rounded-lg bg-[#f2efe6]/10 px-3 py-2 text-center">
      <span className="tnum block text-lg font-bold leading-none text-[#f2efe6]">
        {value === null ? '—' : value.toLocaleString('en-KE')}
      </span>
      <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#f2efe6]/60">
        {label}
      </span>
    </div>
  )
}

/**
 * Intake countdown — the next Jan/May/Sep 1st and a compact live day/hour
 * countdown. Ticking numbers render after mount (hydration-safe); the date
 * spans suppress the (rare) midnight/intake-boundary hydration diff.
 */
function IntakeCountdown() {
  const intake = useMemo(() => nextIntake(), [])
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // first tick right after paint, then refresh every 30 s (client-only —
    // the SSR markup renders em-dash placeholders, so hydration always matches)
    const tick = () => setNow(Date.now())
    const initial = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 30_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(id)
    }
  }, [])

  const msLeft = now === null ? null : Math.max(intake.start.getTime() - now, 0)
  const days = msLeft === null ? null : Math.floor(msLeft / 86_400_000)
  const hours = msLeft === null ? null : Math.floor((msLeft % 86_400_000) / 3_600_000)

  return (
    <div className="mt-8 max-w-md rounded-xl border border-[#f2efe6]/15 bg-brand-950/40 p-4 backdrop-blur-md">
      <p className="text-xs leading-relaxed text-[#f2efe6]/75">
        Next intake starts{' '}
        <span className="tnum font-semibold text-[#f2efe6]" suppressHydrationWarning>
          {fmtDate(intake.start)}
        </span>{' '}
        — apply by{' '}
        <span className="tnum font-semibold text-[#f2efe6]" suppressHydrationWarning>
          {fmtDate(intake.applyBy)}
        </span>
      </p>
      <div className="mt-3 flex items-center gap-2">
        <CountdownChip value={days} label="days" />
        <CountdownChip value={hours} label="hrs" />
        <span className="text-[11px] leading-tight text-[#f2efe6]/55">until classes begin</span>
      </div>
    </div>
  )
}

/** Pathway card — image with scrim, programme count, outcome blurb, link. */
function PathwayCard({
  pathwayKey,
  count,
}: {
  pathwayKey: string
  count: number | undefined
}) {
  const meta = categoryMeta(pathwayKey)
  return (
    <KipLink
      to={`/academics?category=${pathwayKey}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="card-lift h-full overflow-hidden py-0">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={meta.image}
            alt={`Illustrative image for the ${meta.label} pathway (AI-generated placeholder)`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <h3 className="text-lg font-semibold leading-snug text-white">{meta.label}</h3>
            {count !== undefined && (
              <span className="tnum whitespace-nowrap rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {count} programmes
              </span>
            )}
          </div>
        </div>
        <CardContent className="p-5">
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {PATHWAY_OUTCOMES[pathwayKey]}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            {count !== undefined ? `Explore ${count} programmes` : 'Explore programmes'}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </p>
        </CardContent>
      </Card>
    </KipLink>
  )
}

/** Total-cost card for a popular programme (one featured course per pathway). */
function FeeTotalCard({ course }: { course: PublicCourse }) {
  // Fees are charged per term — three 4-month terms per year (stated assumption).
  const terms = Math.max(1, Math.ceil(course.durationMonths / 4))
  const tuitionTotal = course.tuitionPerTerm * terms
  const total = course.registrationFee + tuitionTotal + course.examFee
  return (
    <Card className="card-lift h-full">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {course.level} · {course.examBody} · {fmtDuration(course.durationMonths)}
        </p>
        <h3 className="mt-1.5 min-h-11 text-base font-semibold leading-snug">{course.title}</h3>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Registration (one-off)</dt>
            <dd className="tnum font-medium">{fmtKES(course.registrationFee)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">
              Tuition × <span className="tnum">{terms}</span> terms
              <span className="block text-xs text-muted-foreground/80">
                ({fmtKES(course.tuitionPerTerm)} per term)
              </span>
            </dt>
            <dd className="tnum font-medium">{fmtKES(tuitionTotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Exam fee</dt>
            <dd className="tnum font-medium">{fmtKES(course.examFee)}</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between gap-4 border-t pt-4">
          <span className="text-sm font-medium text-muted-foreground">Total from</span>
          <span className="tnum text-2xl font-bold tracking-tight text-primary">
            {fmtKES(total)}
          </span>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
          Pay in instalments within the term — two or three payments are fine.
        </p>
        <KipLink
          to={`/course/${course.id}`}
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Programme details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </KipLink>
      </CardContent>
    </Card>
  )
}

/** Named graduate story — initials avatar (no stock photos), role, quote. */
function GraduateStoryCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  // seeded roles read like "CPA Graduate (2023) — Accountant, Kitui County Government"
  const [graduateTag = '', currentRole] = testimonial.role.split(' — ')
  const year = graduateTag.match(/\((\d{4})\)/)?.[1]
  return (
    <Card className="card-lift flex h-full flex-col">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-800 dark:bg-brand-800 dark:text-brand-100"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-snug">{testimonial.name}</p>
            <p className="truncate text-xs text-muted-foreground">{testimonial.course}</p>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-primary">
          {currentRole ?? testimonial.role}
          {year && (
            <span className="ml-2 font-normal text-muted-foreground">· Class of {year}</span>
          )}
        </p>
        <blockquote className="mt-3 border-l-2 border-brand-200 pl-4 text-pretty text-sm leading-relaxed text-muted-foreground dark:border-brand-800">
          “{testimonial.quote}”
        </blockquote>
      </CardContent>
    </Card>
  )
}

/** Campus card — photo, address, hours, directions & WhatsApp links. */
function CampusCard({ campus }: { campus: Campus }) {
  const hours = CAMPUS_HOURS[campus.code] ?? CAMPUS_HOURS.MAIN
  const shortName = campus.name.replace(' Campus', '')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Kitui Institute of Professionals ${campus.name}`,
  )}`
  const waUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello, I'd like to ask about ${campus.name} programmes`,
  )}`
  return (
    <Card className="card-lift flex h-full flex-col overflow-hidden py-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={campus.image}
          alt={`Illustrative render of ${campus.name}, ${campus.location} (AI-generated placeholder)`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-brand-950/10 to-transparent"
        />
        <h3 className="absolute inset-x-0 bottom-0 p-4 text-lg font-semibold leading-snug text-white">
          {campus.name}
        </h3>
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {campus.location}
        </p>
        <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {hours}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Get directions
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp {shortName}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Home view — 7 sections
// ─────────────────────────────────────────────────────────────

export function HomeView() {
  const overview = useQuery({
    queryKey: ['public-overview'],
    queryFn: () => api<PublicOverview>('/api/public/overview'),
  })
  const courses = useQuery({
    queryKey: ['public-courses', ''],
    queryFn: () => api<PublicCourse[]>('/api/public/courses'),
  })
  const testimonials = useQuery({
    queryKey: ['public-testimonials'],
    queryFn: () => api<Testimonial[]>('/api/public/testimonials'),
  })
  const faqs = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => api<FAQ[]>('/api/public/faqs'),
  })

  const stats = overview.data?.stats
  const intake = useMemo(() => nextIntake(), [])

  /** Cheapest tuition in the catalogue → “fees from KES X per term”. */
  const minTuition = useMemo(
    () =>
      courses.data?.reduce<number | null>(
        (min, course) => (min === null || course.tuitionPerTerm < min ? course.tuitionPerTerm : min),
        null,
      ) ?? null,
    [courses.data],
  )

  /** Programme count per pathway (used by the pathway cards). */
  const pathwayCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const course of courses.data ?? []) {
      counts[course.category] = (counts[course.category] ?? 0) + 1
    }
    return counts
  }, [courses.data])

  /** One popular (featured) programme per pathway for the total-cost cards. */
  const feeShowcase = useMemo(() => {
    const list = courses.data
    if (!list) return [] as PublicCourse[]
    const pick = (category: string) =>
      list.find((course) => course.category === category && course.isFeatured) ??
      list.find((course) => course.category === category)
    return (['TECHNICAL', 'BUSINESS', 'KASNEB'] as const)
      .map(pick)
      .filter((course): course is PublicCourse => Boolean(course))
  }, [courses.data])

  const scrollToFinder = useCallback(() => {
    document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const news: NewsPost[] = overview.data?.news ?? []
  const campuses: Campus[] = overview.data?.campuses ?? []
  const stories: Testimonial[] = (testimonials.data ?? []).slice(0, 3)
  const topFaqs: FAQ[] = (faqs.data ?? []).slice(0, 6)
  const programmesCount = courses.data?.length ?? stats?.coursesCount

  return (
    <div className="flex flex-col">
      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section
        className="kip-grain relative overflow-hidden bg-brand-band"
        aria-labelledby="home-hero-title"
      >
        <div className="kip-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f2efe6]/20 bg-brand-950/40 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f2efe6]/80 backdrop-blur-sm sm:text-xs">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Kitui Institute of Professionals · TVET College
            </p>
            <h1
              id="home-hero-title"
              className="text-balance text-3xl leading-[1.12] tracking-tight text-[#f2efe6] sm:text-4xl sm:leading-[1.08] lg:text-[2.75rem] lg:leading-[1.06]"
            >
              Study a recognised diploma, certificate or KASNEB qualification in Kitui.
            </h1>
            <p className="mt-5 text-pretty text-sm leading-relaxed text-[#f2efe6]/85 sm:text-base">
              Three campuses · day, evening &amp; weekend classes
              {minTuition !== null && (
                <>
                  {' '}
                  · fees from{' '}
                  <span className="tnum font-semibold text-[#f2efe6]">
                    {fmtKES(minTuition)}
                  </span>{' '}
                  per term
                </>
              )}
              .
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={scrollToFinder}
                className="btn-gold min-h-11 px-6 text-base font-semibold sm:px-7"
              >
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                Find my course
                <ArrowDown className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-11 border-[#f2efe6]/30 bg-transparent px-6 text-base font-semibold text-[#f2efe6] backdrop-blur-sm hover:bg-white/10 hover:text-[#f2efe6] sm:px-7"
              >
                <KipLink to="/apply">
                  Apply for the <span suppressHydrationWarning>{intake.monthName}</span> intake
                </KipLink>
              </Button>
            </div>
            <ul
              className="mt-8 flex flex-wrap gap-2"
              aria-label="Examining and accreditation bodies"
            >
              {TRUST_BODIES.map((body) => (
                <li
                  key={body}
                  className="rounded-full border border-[#f2efe6]/25 bg-brand-950/30 px-3.5 py-1.5 text-xs font-semibold text-[#f2efe6]/85 backdrop-blur-sm"
                >
                  {body}
                </li>
              ))}
            </ul>
            <IntakeCountdown />
          </motion.div>

          {/* two-photo collage — decorative, honest, desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#f2efe6]/15 shadow-2xl shadow-brand-950/50">
              <Image
                src="/images/hero-campus.webp"
                alt="Illustrative render of a college campus building (AI-generated placeholder image)"
                width={520}
                height={390}
                priority
                sizes="(min-width: 1024px) 40vw, 0px"
                className="h-auto w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/10 to-transparent"
              />
              <p className="absolute bottom-3 left-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[#f2efe6]/80">
                Main Campus · Wikililye
              </p>
            </div>
            <div className="absolute -bottom-8 -left-10 w-48 overflow-hidden rounded-xl border border-[#f2efe6]/15 shadow-xl shadow-brand-950/60 xl:w-56">
              <Image
                src="/images/gallery-computer-lab.webp"
                alt="Illustrative image of students working in a computer laboratory (AI-generated placeholder)"
                width={224}
                height={168}
                sizes="224px"
                className="h-auto w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent"
              />
            </div>
            <p className="mt-14 text-right text-[11px] leading-relaxed text-[#f2efe6]/50">
              Illustrative renders — visit any campus to see the real thing.
            </p>
          </motion.div>
        </div>
        <HeroScrollCue />
      </section>

      {/* ── 2. COURSE FINDER ─────────────────────────────────── */}
      <section
        id="finder"
        className="scroll-mt-24 bg-muted/40 py-16 sm:py-20"
        aria-label="Course finder"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Course finder"
              title="Find the programme that fits you"
              description="Set your KCSE grade, budget, class times and campus — the list updates instantly and the link stays shareable."
            />
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
            <CourseFinder
              courses={courses.data}
              coursesError={courses.error}
              onRetry={() => courses.refetch()}
            />
          </motion.div>
        </div>
      </section>

      {/* ── 3. THREE PATHWAYS ────────────────────────────────── */}
      <section className="py-16 sm:py-20" aria-label="Study pathways">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Three pathways"
              title="Choose how you want to study"
              description="Every programme leads to a national qualification — examined by KNEC, TVET CDACC, NITA or KASNEB."
            />
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {(['TECHNICAL', 'BUSINESS', 'KASNEB'] as const).map((key) => (
              <PathwayCard key={key} pathwayKey={key} count={pathwayCounts[key]} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 4. FEES & HOW TO PAY ─────────────────────────────── */}
      <section className="bg-muted/40 py-16 sm:py-20" aria-label="Fees and how to pay">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Fees & how to pay"
              title="Know the full cost before you enrol"
              description="Transparent totals for three of our most popular programmes — registration, tuition for every term and the exam fee."
            />
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {courses.isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="space-y-4 p-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : courses.isError ? (
              <div className="lg:col-span-3">
                <ErrorPanel error={courses.error} onRetry={() => courses.refetch()} />
              </div>
            ) : (
              feeShowcase.map((course) => <FeeTotalCard key={course.id} course={course} />)
            )}
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <Card className="mt-6">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">Ways to pay</h3>
                  <KipLink
                    to="/admissions"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Full fee details &amp; instalments
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </KipLink>
                </div>
                <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                  {PAYMENT_CHANNELS.map((channel) => (
                    <li key={channel.title} className="flex gap-3 rounded-xl border bg-muted/40 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-primary dark:bg-brand-800/60 dark:text-brand-100">
                        <channel.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{channel.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                          {channel.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Totals above assume three 4-month terms per year and one exam entry for the full
                  programme; fees are charged per term. Confirm current paybill and bank details
                  with the finance office —{' '}
                  <a
                    href={`tel:${FINANCE_PHONE.replace(/\s/g, '')}`}
                    className="tnum font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {FINANCE_PHONE}
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── 5. PROOF — GRADUATES & FACTS ─────────────────────── */}
      <section className="py-16 sm:py-20" aria-label="Graduate stories and college facts">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Proof, not promises"
              title="Where our graduates end up"
              description="Real students, real qualifications, real jobs — in their own words."
            />
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {testimonials.isPending
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))
              : testimonials.isError
                ? <ErrorPanel error={testimonials.error} onRetry={() => testimonials.refetch()} />
                : stories.map((testimonial) => (
                    <GraduateStoryCard key={testimonial.id} testimonial={testimonial} />
                  ))}
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <dl className="mt-10 grid grid-cols-3 divide-x divide-border rounded-2xl border bg-card px-2 py-6 text-center sm:px-8">
              <div className="flex flex-col gap-1 px-2">
                <dd className="tnum text-2xl font-bold tracking-tight sm:text-3xl">
                  {programmesCount ?? '—'}
                </dd>
                <dt className="text-xs leading-snug text-muted-foreground sm:text-sm">
                  programmes across three pathways
                </dt>
              </div>
              <div className="flex flex-col gap-1 px-2">
                <dd className="tnum text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats?.campusesCount ?? 3}
                </dd>
                <dt className="text-xs leading-snug text-muted-foreground sm:text-sm">
                  campuses across Kitui County
                </dt>
              </div>
              <div className="flex flex-col gap-1 px-2">
                <dd className="tnum text-2xl font-bold tracking-tight sm:text-3xl">14</dd>
                <dt className="text-xs leading-snug text-muted-foreground sm:text-sm">
                  years of training excellence
                </dt>
              </div>
            </dl>
          </motion.div>
        </div>
      </section>

      {/* ── 6. CAMPUSES ──────────────────────────────────────── */}
      <section className="bg-muted/40 py-16 sm:py-20" aria-label="Our campuses">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Visit a campus"
              title="Three campuses, one standard"
              description="Main (Wikililye–Mulango Rd), Town (Muli Mall) and Mwingi (Sunrise Bldg) — walk in, call or WhatsApp us."
            />
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {overview.isPending
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden py-0">
                    <Skeleton className="aspect-[4/3] rounded-none" />
                    <CardContent className="space-y-3 p-5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="mt-4 h-11 w-full" />
                    </CardContent>
                  </Card>
                ))
              : overview.isError
                ? <ErrorPanel error={overview.error} onRetry={() => overview.refetch()} />
                : campuses.map((campus) => <CampusCard key={campus.id} campus={campus} />)}
          </motion.div>
        </div>
      </section>

      {/* ── 7. GOOD TO KNOW — CLOSING BAND ───────────────────── */}
      <section
        className="kip-grain relative overflow-hidden bg-brand-band"
        aria-label="Good to know: news, answers and next steps"
      >
        <div className="kip-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#f2efe6] sm:text-3xl">
              Latest news, quick answers &amp; your next step
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
            {/* latest news */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2efe6]/70">
                Latest from the college
              </h3>
              {overview.isPending ? (
                <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading news">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl bg-[#f2efe6]/10" />
                  ))}
                </div>
              ) : overview.isError ? (
                <div className="mt-4">
                  <ErrorPanel error={overview.error} onRetry={() => overview.refetch()} />
                </div>
              ) : news.length === 0 ? (
                <p className="mt-4 text-sm text-[#f2efe6]/60">
                  College updates will appear here — follow us on WhatsApp for day-to-day news.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[#f2efe6]/10">
                  {news.map((post) => (
                    <li key={post.id}>
                      <KipLink
                        to={`/news/${post.id}`}
                        className="group flex flex-col gap-1 rounded-lg px-3 py-3.5 transition-colors hover:bg-white/5 sm:px-4"
                      >
                        <time className="tnum text-xs text-[#f2efe6]/60">
                          {fmtDate(post.publishedAt)}
                        </time>
                        <p className="text-pretty text-sm font-semibold leading-snug text-[#f2efe6] transition-colors group-hover:text-gold-300">
                          {post.title}
                        </p>
                      </KipLink>
                    </li>
                  ))}
                </ul>
              )}
              <KipLink
                to="/news"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-[#f2efe6]/90 transition-colors hover:text-gold-300"
              >
                All news
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </KipLink>
            </motion.div>

            {/* quick answers */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2efe6]/70">
                Quick answers
              </h3>
              {faqs.isPending ? (
                <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading frequently asked questions">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl bg-[#f2efe6]/10" />
                  ))}
                </div>
              ) : faqs.isError ? (
                <div className="mt-4">
                  <ErrorPanel error={faqs.error} onRetry={() => faqs.refetch()} />
                </div>
              ) : topFaqs.length === 0 ? (
                <p className="mt-4 text-sm text-[#f2efe6]/60">
                  Answers to common questions will appear here.
                </p>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  className="mt-4 w-full"
                  aria-label="Top frequently asked questions"
                >
                  {topFaqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border-[#f2efe6]/10 last:border-b-0"
                    >
                      <AccordionTrigger className="min-h-11 rounded-lg px-1 text-left text-sm font-semibold text-[#f2efe6] transition-colors hover:bg-white/5 hover:no-underline hover:text-gold-300 [&>svg]:text-[#f2efe6]/70">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-1 pb-5 text-sm leading-relaxed text-[#f2efe6]/75">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              <KipLink
                to="/faq"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-[#f2efe6]/90 transition-colors hover:text-gold-300"
              >
                View all FAQs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </KipLink>
            </motion.div>
          </div>

          {/* final CTA row */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-14 flex flex-col items-center gap-5 border-t border-[#f2efe6]/15 pt-10 text-center"
          >
            <p className="text-pretty text-balance text-lg font-semibold leading-snug text-[#f2efe6] sm:text-xl">
              Ready to start? Applications for the{' '}
              <span className="text-gold-300" suppressHydrationWarning>
                {intake.monthName}
              </span>{' '}
              intake are open.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="btn-gold min-h-11 px-7 text-base font-semibold"
              >
                <KipLink to="/apply">
                  Apply now
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </KipLink>
              </Button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gold-400/60 px-7 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-400/10"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Talk to us on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
