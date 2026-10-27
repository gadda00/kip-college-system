'use client'

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
import { StatCard } from '@/components/kip/components/stat-card'
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

/** Examination / accreditation bodies displayed in the strip below the hero. */
const ACCREDITATION_BODIES = [
  {
    acronym: 'KNEC',
    name: 'Kenya National Examinations Council',
    blurb: 'Technical & business diplomas and certificates',
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
    acronym: 'KASNEB',
    name: 'Kenya Accountants and Secretaries National Examinations Board',
    blurb: 'Professional courses — CPA, ATD, CAMS, CS & CIFA',
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
      <section className="relative overflow-hidden" aria-labelledby="home-hero-title">
        <img
          src="/images/hero-campus.png"
          alt="KIP College campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0b1f3f]/90 via-[#0b1f3f]/60 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3f]/70 via-transparent to-transparent md:hidden" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl text-white"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-sky-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-300 backdrop-blur-sm sm:text-xs">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Admissions Open 2026 &middot; Kitui Institute of Professionals
            </p>
            <h1
              id="home-hero-title"
              className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              Choose a path that matches your ambition.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
              <span className="font-semibold text-sky-300">Training for Excellence</span> — KIP
              College offers KASNEB professional courses, TVET diplomas and certificates across
              three campuses in Kitui County. January, May and September intakes are open.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/apply')}
                className="min-h-11 bg-primary px-7 text-base font-semibold shadow-lg shadow-sky-950/30 hover:bg-primary/90"
              >
                Apply Now
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/academics')}
                className="min-h-11 border-white/50 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                Explore Programmes
              </Button>
            </div>

            {/* floating stat pills */}
            <dl className="mt-10 flex flex-wrap gap-2.5 sm:gap-3">
              {[
                { label: 'Students', value: '1,500+' },
                { label: 'Courses', value: '20+' },
                { label: 'Campuses', value: '3' },
                { label: 'Since', value: '2012' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm"
                >
                  <dd className="text-lg font-bold leading-none text-sky-300">{item.value}</dd>
                  <dt className="mt-1 text-[11px] uppercase tracking-wider text-white/70">
                    {item.label}
                  </dt>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {/* ── 2. ACCREDITATION STRIP ──────────────────────────── */}
      <section className="bg-[#0b1f3f]" aria-labelledby="accreditation-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2
            id="accreditation-title"
            className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-sky-300"
          >
            Examinable &amp; Accredited by
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {ACCREDITATION_BODIES.map((body, i) => (
              <motion.div
                key={body.acronym}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-sm transition-colors hover:border-sky-400/40 hover:bg-white/10 sm:flex-col sm:items-start sm:gap-2 sm:px-5 sm:py-4"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300"
                  aria-hidden="true"
                >
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                    {body.acronym}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/60 sm:line-clamp-2">
                    {body.name}
                  </p>
                  <p className="mt-1 hidden text-[11px] leading-snug text-sky-300/80 lg:block">
                    {body.blurb}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STATS BAND ───────────────────────────────────── */}
      <section className="border-b bg-muted/40" aria-label="College statistics">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {overview.isPending ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={Users} label="Current Students" value={Math.max(stats?.studentsCount ?? 1500, 1500)} />
              <StatCard icon={BookOpen} label="Courses Offered" value={Math.max(stats?.coursesCount ?? 21, 21)} />
              <StatCard icon={MapPin} label="Campuses" value={Math.max(stats?.campusesCount ?? 3, 3)} />
              <StatCard icon={Award} label="Graduation Rate" value={96} suffix="%" />
            </div>
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
                className="group relative overflow-hidden rounded-xl text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3f]/90 via-[#0b1f3f]/25 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white">{meta.label}</h3>
                    {count != null && (
                      <Badge className="border-sky-300/50 bg-sky-400/90 text-sky-950">
                        {count} courses
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/80 sm:text-sm">
                    {meta.blurb}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300">
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
      <section className="bg-muted/40" aria-labelledby="featured-title">
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
            <Button variant="outline" size="lg" onClick={() => navigate('/academics')} className="min-h-11">
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
              <Card className="h-full border-primary/10 transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
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
                  className="group overflow-hidden rounded-xl text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                    <h3 className="text-base font-semibold">{campus.name}</h3>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {campus.location}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 8. TESTIMONIALS (sky band, full grid) ───────────── */}
      <section
        id="testimonials"
        className="bg-sky-50/70 dark:bg-sky-950/20"
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
                  className="flex h-full flex-col rounded-xl border border-sky-200/70 bg-card p-6 shadow-sm transition-shadow hover:shadow-md dark:border-sky-900/60"
                >
                  <div className="flex items-center justify-between">
                    <Quote className="h-7 w-7 text-primary/25" aria-hidden="true" />
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
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-sky-100 pt-4 dark:border-sky-900/60">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase text-primary-foreground"
                      aria-hidden="true"
                    >
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                      <Badge
                        variant="secondary"
                        className="mt-1 max-w-full truncate bg-sky-100 text-[10px] font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300"
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
                  className="group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span>{fmtDate(post.publishedAt)}</span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 font-semibold leading-snug">{post.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => navigate('/news')} className="min-h-11 text-primary">
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
                    className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{event.title}</h3>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
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
            <Card className="border-primary/15 shadow-sm">
              <CardContent className="p-2 sm:p-4">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  aria-label="Top frequently asked questions"
                >
                  {(faqs.data ?? []).slice(0, 4).map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="min-h-11 px-3 text-sm font-semibold hover:no-underline sm:text-base">
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
            <Button variant="outline" size="lg" onClick={() => navigate('/faq')} className="min-h-11">
              View all FAQs
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 12. CTA BANNER ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#123a8a] to-[#0b1f3f]" aria-labelledby="cta-title">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 id="cta-title" className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to begin your journey?
          </h2>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
            Applications are free and take less than 10 minutes. Get your acceptance letter within
            48 hours and join the next intake.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/apply')}
              className="min-h-11 bg-white px-8 text-base font-semibold text-primary shadow-lg hover:bg-sky-100"
            >
              Start Application
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="min-h-11 border-white/40 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              Contact Admissions
            </Button>
          </div>
          <p className="text-xs text-white/60">
            Tuition from {fmtKES(6500)} per term &middot; M-Pesa &amp; bank payment options
          </p>
        </div>
      </section>
    </div>
  )
}
