'use client'

import { Fragment, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Banknote,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Handshake,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { CourseCard } from '@/components/kip/components/course-card'
import { ErrorPanel } from '@/components/kip/components/loading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { api } from '@/components/kip/lib/api'
import { categoryMeta, fmtDate, fmtKES } from '@/components/kip/lib/format'
import type { FAQ, PublicCourse, PublicOverview, Testimonial } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

/** Examination / accreditation bodies displayed in the marquee below the hero. */
const ACCREDITATION_BODIES = [
  {
    acronym: 'KNEC',
    name: 'Kenya National Examinations Council',
    blurb: 'Technical & business diplomas and certificates',
  },
  {
    acronym: 'KASNEB',
    name: 'Kenya Accountants and Secretaries National Examinations Board',
    blurb: 'Professional courses — CPA, ATD, CAMS, CS & CIFA',
  },
  {
    acronym: 'CDACC',
    name: 'Curriculum Development, Assessment & Certification Council',
    blurb: 'Competency-based TVET programmes',
  },
  {
    acronym: 'NITA',
    name: 'National Industrial Training Authority',
    blurb: 'Trade tests & artisan grade certification',
  },
  {
    acronym: 'TVET',
    name: 'Technical & Vocational Education and Training',
    blurb: 'Ministry-approved TVET programmes',
  },
]

const WHY_FEATURES = [
  {
    icon: Award,
    title: 'Experienced lecturers',
    text: 'Learn from qualified accountants, engineers and industry practitioners with years of teaching excellence.',
  },
  {
    icon: Wrench,
    title: 'Modern labs & workshops',
    text: 'Well-equipped computer laboratories, engineering workshops, training kitchen and beauty studios.',
  },
  {
    icon: BookOpen,
    title: 'Exam-body aligned curriculum',
    text: 'Programmes aligned to KASNEB, KNEC, NITA and TVET-CDACC syllabi so you sit exams fully prepared.',
  },
  {
    icon: Banknote,
    title: 'Flexible fee payment',
    text: 'Pay conveniently via M-Pesa Paybill 522 890, Equity Bank or cash — with student-friendly instalments.',
  },
  {
    icon: Handshake,
    title: 'Attachment placement support',
    text: 'MoUs with Kitui Industries and other employers guarantee attachment places for diploma students.',
  },
  {
    icon: Building2,
    title: '3 convenient campuses',
    text: 'Main (Wikililye), Town (Muli Mall) and Mwingi (Sunrise) campuses — quality education close to you.',
  },
]

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

  return (
    <div className="flex flex-col">
      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section
        className="kip-grain relative overflow-hidden bg-brand-band"
        aria-labelledby="home-hero-title"
      >
        <img
          src="/images/hero-campus.png"
          alt="KIP College campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* emerald scrim — deep brand gradient for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/70 to-brand-950/20"
          aria-hidden="true"
        />
        {/* extra mobile bottom scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent md:hidden"
          aria-hidden="true"
        />
        {/* radial deepening behind the text column for extra depth/readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 26% 42%, rgba(6, 43, 31, 0.55) 0%, rgba(6, 43, 31, 0) 70%)',
          }}
        />
        {/* woven-reed texture over the dark scrim */}
        <div className="kip-pattern absolute inset-0" aria-hidden="true" />
        {/* bottom vignette anchoring the hero to the next section */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-950/80 to-transparent sm:h-52"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl"
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-300 backdrop-blur-sm sm:text-xs">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Kitui Town &middot; Since 2012 &middot; Admissions Open
            </p>
            <h1
              id="home-hero-title"
              className="text-balance text-3xl leading-[1.08] tracking-tight text-[#f2efe6] sm:text-[2.6rem] sm:leading-[1.05] lg:text-6xl lg:leading-[1.02]"
            >
              Choose a path that matches your{' '}
              <em className="text-gold-gradient italic">ambition.</em>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-[#f2efe6]/85 sm:text-base">
              <span className="font-semibold text-gold-300">Training for Excellence</span> — KIP
              College offers KASNEB professional courses, TVET diplomas and certificates across
              three campuses in Kitui County. January, May and September intakes are open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/apply')}
                className="btn-gold min-h-11 px-7 text-base font-semibold"
              >
                Apply Now
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/academics')}
                className="min-h-11 border-[#f2efe6]/30 bg-transparent px-7 text-base font-semibold text-[#f2efe6] backdrop-blur-sm hover:bg-white/10 hover:text-[#f2efe6]"
              >
                Explore Programmes
              </Button>
            </div>

            {/* live stat pills — serif numerals with gold suffixes */}
            <dl className="mt-12 flex flex-wrap gap-2.5 sm:gap-3">
              {[
                {
                  label: 'Students',
                  value: Math.max(stats?.studentsCount ?? 1500, 1500).toLocaleString('en-KE'),
                  suffix: '+',
                },
                { label: 'Courses', value: String(Math.max(stats?.coursesCount ?? 21, 21)), suffix: '+' },
                { label: 'Campuses', value: String(Math.max(stats?.campusesCount ?? 3, 3)), suffix: '' },
                { label: 'Since', value: '2012', suffix: '' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col rounded-xl border border-[#f2efe6]/20 bg-brand-950/40 px-4 py-2.5 shadow-lg shadow-brand-950/40 backdrop-blur-md"
                >
                  <dt className="order-2 mt-1 text-[10px] uppercase tracking-[0.14em] text-[#f2efe6]/70">
                    {item.label}
                  </dt>
                  <dd className="font-display order-1 text-lg font-bold leading-none tracking-tight tabular-nums text-[#f2efe6]">
                    {item.value}
                    {item.suffix && <span className="text-gold-400">{item.suffix}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>

        <HeroScrollCue />
      </section>

      {/* ── 2. ACCREDITATION MARQUEE ────────────────────────── */}
      <section className="border-b border-border/60 bg-muted/30" aria-labelledby="accreditation-title">
        <div className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
          <h2
            id="accreditation-title"
            className="flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-400"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
            Examinable &amp; Accredited by
          </h2>
        </div>
        <div className="marquee-mask mt-4 overflow-hidden pb-7">
          {/* the list is rendered twice inside a w-max track for a seamless loop */}
          <div className="animate-marquee flex w-max items-center motion-reduce:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className="flex items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
              >
                {ACCREDITATION_BODIES.map((body) => (
                  <Fragment key={body.acronym}>
                    <span className="flex items-baseline gap-2.5 whitespace-nowrap sm:gap-3">
                      <span className="font-display text-lg font-bold tracking-tight text-foreground/75">
                        {body.acronym}
                      </span>
                      <span className="hidden text-sm text-muted-foreground md:inline">{body.name}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500/70"
                    />
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STATS BAND (dark emerald, gold-gradient numerals) ── */}
      <section className="bg-brand-band kip-grain relative overflow-hidden" aria-label="College statistics">
        <div className="kip-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {overview.isPending ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl bg-[#f2efe6]/10" />
              ))}
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {[
                { icon: Users, label: 'Current Students', value: Math.max(stats?.studentsCount ?? 1500, 1500), suffix: '+' },
                { icon: BookOpen, label: 'Courses Offered', value: Math.max(stats?.coursesCount ?? 21, 21), suffix: '+' },
                { icon: MapPin, label: 'Campuses', value: Math.max(stats?.campusesCount ?? 3, 3), suffix: '' },
                { icon: Award, label: 'Graduation Rate', value: 96, suffix: '%' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                  className="flex flex-col items-center text-center"
                >
                  <dt className="order-2 mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f2efe6]/70">
                    {item.label}
                  </dt>
                  <dd className="font-display order-1 text-4xl font-bold tabular-nums tracking-tight text-gold-gradient sm:text-5xl">
                    {item.value.toLocaleString('en-KE')}
                    {item.suffix && <span className="text-gold-400">{item.suffix}</span>}
                  </dd>
                </motion.div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── 4. CHOOSE YOUR PATH ─────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="paths-title">
        <SectionHeading
          eyebrow="Programmes"
          title="Choose Your Path"
          description="Three faculties, one goal — a qualification that opens doors. Explore technical trades, business careers or KASNEB professional certification."
        />
        <motion.h2 id="paths-title" className="sr-only">
          Course categories
        </motion.h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(['TECHNICAL', 'BUSINESS', 'KASNEB'] as const).map((category, i) => {
            const meta = categoryMeta(category)
            const count = courses.data?.filter((c) => c.category === category).length
            return (
              <motion.button
                key={category}
                type="button"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                onClick={() => navigate(`/academics?category=${category}`)}
                className="card-lift focus-glow group relative overflow-hidden rounded-xl text-left shadow-sm"
                aria-label={`Explore ${meta.label} courses`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={meta.image}
                    alt={meta.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-[#f2efe6]">
                      {meta.label}
                    </h3>
                    {count != null && (
                      <Badge className="border-gold-500/60 bg-gold-400/95 text-[#0f2e22]">
                        {count} courses
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#f2efe6]/80 sm:text-sm">
                    {meta.blurb}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
                    Explore programmes
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* ── 5. FEATURED COURSES ─────────────────────────────── */}
      <section className="kip-dots bg-muted/40" aria-labelledby="featured-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Popular right now"
            title="Featured Programmes"
            description="The courses our students love most — from CPA to engineering diplomas."
          />
          <h2 id="featured-title" className="sr-only">
            Featured courses
          </h2>
          {overview.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : overview.isError ? (
            <ErrorPanel error={overview.error} onRetry={() => overview.refetch()} />
          ) : (overview.data?.featuredCourses?.length ?? 0) === 0 ? (
            <EmptyState icon={BookOpen} title="No featured courses yet" hint="Browse the full academic catalogue instead." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {overview.data?.featuredCourses.map((course, i) => (
                <motion.div key={course.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i % 3) * 0.07 }}>
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/academics')}
              className="min-h-11 border-brand-700/30 hover:border-gold-500/60 hover:text-gold-700 dark:hover:text-gold-400"
            >
              View all programmes
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 6. WHY KIP COLLEGE ──────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="why-title">
        <SectionHeading
          eyebrow="Why choose us"
          title="Why KIP College"
          description="Everything you need to succeed — expert teaching, modern facilities and support all the way to graduation."
        />
        <h2 id="why-title" className="sr-only">
          Why choose KIP College
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 3) * 0.07 }}
            >
              <Card className="card-lift rule-top-gold relative h-full border-border/60">
                <CardContent className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 7. CAMPUSES STRIP ───────────────────────────────── */}
      <section className="bg-muted/40" aria-labelledby="campuses-strip-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Find us"
            title="Three Campuses, One Standard"
            description="Study close to home — Wikililye, Kitui CBD or Mwingi Town."
          />
          <h2 id="campuses-strip-title" className="sr-only">
            Campuses overview
          </h2>
          {overview.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {overview.data?.campuses.map((campus, i) => (
                <motion.button
                  key={campus.id}
                  type="button"
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                  onClick={() => navigate('/campuses')}
                  className="card-lift focus-glow group overflow-hidden rounded-xl text-left shadow-sm"
                  aria-label={`View ${campus.name} details`}
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={campus.image}
                      alt={campus.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="bg-card p-4">
                    <h3 className="font-display text-base font-semibold tracking-tight">{campus.name}</h3>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-gold-600 dark:text-gold-500" aria-hidden="true" />
                      {campus.location}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. TESTIMONIALS (sage band, gold-ruled cards) ────── */}
      <section
        id="testimonials"
        className="bg-brand-50/70 dark:bg-brand-100/10"
        aria-labelledby="testimonials-title"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Student voices"
            title="What Our Graduates Say"
            description="From county offices to engineering firms — KIP College alumni are making their mark across Kenya."
          />
          <h2 id="testimonials-title" className="sr-only">
            Testimonials
          </h2>
          {testimonials.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : testimonials.isError ? (
            <ErrorPanel error={testimonials.error} onRetry={() => testimonials.refetch()} />
          ) : (testimonials.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Quote}
              title="No testimonials yet"
              hint="Graduate stories will appear here soon."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.data?.map((t, i) => (
                <motion.figure
                  key={t.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: (i % 3) * 0.07 }}
                  className="card-lift rule-top-gold relative flex h-full flex-col rounded-xl border border-border/60 bg-card p-6 pt-7 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Quote className="h-7 w-7 text-gold-400" aria-hidden="true" />
                    <div
                      className="flex gap-0.5"
                      aria-label={`Rated ${t.rating} out of 5 stars`}
                      title={`${t.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={
                            s < t.rating
                              ? 'h-4 w-4 fill-[#f5b301] text-[#f5b301]'
                              : 'h-4 w-4 text-muted-foreground/30'
                          }
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold uppercase text-[#f2efe6]"
                      aria-hidden="true"
                    >
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display truncate text-sm font-semibold text-primary">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                      <Badge
                        variant="secondary"
                        className="mt-1 max-w-full truncate bg-gold-400/15 text-[10px] font-medium text-gold-700 dark:bg-gold-400/15 dark:text-gold-300"
                      >
                        {t.course}
                      </Badge>
                    </div>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 9. LATEST NEWS ──────────────────────────────────── */}
      <section className="bg-muted/40" aria-labelledby="latest-news-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Stay informed"
            title="Latest News"
          />
          <h2 id="latest-news-title" className="sr-only">
            Latest news
          </h2>
          {overview.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (overview.data?.news?.length ?? 0) === 0 ? (
            <EmptyState icon={CalendarDays} title="No news yet" hint="College updates will appear here." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {overview.data?.news.map((post, i) => (
                <motion.button
                  key={post.id}
                  type="button"
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: (i % 3) * 0.07 }}
                  onClick={() => navigate(`/news/${post.id}`)}
                  className="card-lift focus-glow group overflow-hidden rounded-xl border bg-card text-left shadow-sm"
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
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="rounded-full bg-gold-400/15 px-2.5 py-0.5 font-medium text-gold-700 dark:text-gold-300">
                        {fmtDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display mt-2 line-clamp-2 text-base font-semibold leading-snug tracking-tight">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/news')}
              className="min-h-11 text-primary hover:text-gold-700 dark:hover:text-gold-400"
            >
              All news &amp; stories
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 10. UPCOMING EVENTS ─────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="upcoming-events-title">
        <SectionHeading
          eyebrow="Mark your calendar"
          title="Upcoming Events"
        />
        <h2 id="upcoming-events-title" className="sr-only">
          Upcoming events
        </h2>
        {overview.isPending ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (overview.data?.events?.length ?? 0) === 0 ? (
          <EmptyState icon={CalendarClock} title="No upcoming events" hint="New events will be announced here soon." />
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {overview.data?.events.map((event, i) => {
              const date = new Date(event.date)
              return (
                <motion.li key={event.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="card-lift flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:bg-gold-400/10 dark:text-gold-300">
                      <span className="font-display text-xl font-bold leading-none">{date.getDate()}</span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{event.title}</h3>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-gold-600 dark:text-gold-500" aria-hidden="true" />
                        {event.venue}
                      </p>
                    </div>
                  </button>
                </motion.li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── 11. FAQ TEASER ──────────────────────────────────── */}
      <section className="bg-muted/40" aria-labelledby="faq-teaser-title">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Quick answers"
            title="Frequently Asked Questions"
            description="The questions we hear most from applicants and parents."
          />
          <h2 id="faq-teaser-title" className="sr-only">
            Frequently asked questions
          </h2>
          {faqs.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : faqs.isError ? (
            <ErrorPanel error={faqs.error} onRetry={() => faqs.refetch()} />
          ) : (faqs.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No FAQs yet"
              hint="Answers to common questions will appear here."
            />
          ) : (
            <Card className="rule-top-gold relative border-gold-500/20 shadow-sm">
              <CardContent className="p-2 sm:p-4">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  aria-label="Top frequently asked questions"
                >
                  {(faqs.data ?? []).slice(0, 4).map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="min-h-11 rounded-lg px-3 text-sm font-semibold hover:bg-muted hover:no-underline sm:text-base [&>svg]:text-gold-600 dark:[&>svg]:text-gold-400">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/faq')}
              className="min-h-11 border-brand-700/30 hover:border-gold-500/60 hover:text-gold-700 dark:hover:text-gold-400"
            >
              View all FAQs
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 12. CTA BAND (deep emerald + gold) ──────────────── */}
      <section className="bg-brand-band kip-grain relative overflow-hidden" aria-labelledby="cta-title">
        <div className="kip-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">
            Admissions open &middot; January / May / September
          </p>
          <h2
            id="cta-title"
            className="text-balance text-2xl font-bold tracking-tight text-[#f2efe6] sm:text-3xl lg:text-4xl"
          >
            Ready to begin your <em className="text-gold-gradient italic">journey?</em>
          </h2>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-[#f2efe6]/80 sm:text-base">
            Applications are free and take less than 10 minutes. Get your acceptance letter within
            48 hours and join the next intake.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/apply')}
              className="btn-gold min-h-11 px-8 text-base font-semibold"
            >
              Start Application
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="min-h-11 border-[#f2efe6]/30 bg-transparent px-8 text-base font-semibold text-[#f2efe6] backdrop-blur-sm hover:bg-white/10 hover:text-[#f2efe6]"
            >
              Contact Admissions
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold text-gold-300">
              <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
              M-Pesa Paybill 522 890
            </span>
            <p className="text-xs text-[#f2efe6]/60">
              Tuition from {fmtKES(6500)} per term &middot; instalments available
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
