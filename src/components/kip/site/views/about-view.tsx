'use client'

import { motion } from 'framer-motion'
import {
  BookOpenCheck,
  Briefcase,
  Eye,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { PageHero } from '@/components/kip/components/page-hero'
import { SectionHeading } from '@/components/kip/components/section-heading'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

const VALUES = [
  { label: 'Integrity', icon: ShieldCheck },
  { label: 'Excellence', icon: Sparkles },
  { label: 'Innovation', icon: Lightbulb },
  { label: 'Service', icon: Target },
]

const LEADERSHIP = [
  {
    name: 'Mrs. Alice Mwangi',
    role: 'Principal',
    detail: 'M.Ed — Educational Management',
    initials: 'AM',
  },
  {
    name: 'Eng. David Kilonzo',
    role: 'Deputy Principal — Academics',
    detail: 'B.Sc Eng — Electrical & ICT',
    initials: 'DK',
  },
  {
    name: 'CPA Joseph Kimani',
    role: 'Registrar',
    detail: 'Head of KASNEB Professional Studies',
    initials: 'JK',
  },
  {
    name: 'Lucy Ndinda',
    role: 'Head of Hospitality',
    detail: 'Catering & Accommodation Department',
    initials: 'LN',
  },
]

const ACCREDITATIONS = ['TVET Authority', 'KASNEB', 'KNEC', 'CDACC', 'NITA']

const MILESTONES = [
  {
    period: '2012',
    title: 'One building, one mission',
    text: 'KIP College opens its doors in a single building in Kitui Town — a handful of students and one clear mission: quality tertiary education within reach of every young person in Kitui County.',
  },
  {
    period: 'Growth',
    title: 'Faculties take root',
    text: 'Technical workshops, business studies and KASNEB professional programmes grow side by side — all examined by national bodies so every certificate carries recognised value.',
  },
  {
    period: 'Expansion',
    title: 'Three campuses',
    text: 'Main Campus at Wikililye along Mulango Road, Town Campus at the Muli Mall building in Kitui CBD, and Mwingi Campus at the Sunrise Building.',
  },
  {
    period: 'Today',
    title: 'A regional institution',
    text: 'Thousands of learners from Kitui County and across Eastern Kenya study with us each year — supported by labs, workshops, mock exams and an outstanding pass-rate record.',
  },
]

const OFFER_ROWS = [
  {
    icon: GraduationCap,
    title: 'Technical & Engineering',
    text: 'Diplomas and certificates in ICT, Electrical & Electronic Engineering, Building Construction, Catering & Accommodation, Hairdressing & Beauty Therapy, Fashion Design and artisan trades — with heavy practical work in labs, workshops and studios.',
  },
  {
    icon: Briefcase,
    title: 'Business & Management',
    text: 'Business Management, Human Resource Management, Supply Chain Management, Sales & Marketing and Project Management programmes that prepare you for today\u2019s workplace and further professional study.',
  },
  {
    icon: BookOpenCheck,
    title: 'KASNEB Professional',
    text: 'CPA, CAMS, CS, CIFA and DICT examination courses taught by qualified accountants — with mock exams, revision clinics and an outstanding pass-rate record.',
  },
]

export function AboutView() {
  return (
    <div>
      <PageHero
        eyebrow="Who we are"
        title="About KIP College"
        subtitle="A trusted tertiary learning institution in Kitui Town, Kenya — building careers through technical, business and professional education since 2012."
        breadcrumb={[{ label: 'About' }]}
      />

      {/* story */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="story-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div {...fadeUp} className="relative">
            <div
              aria-hidden="true"
              className="absolute -left-3 -top-3 h-full w-full rounded-2xl border-2 border-gold-500/40"
            />
            <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-brand-900/15">
              <img
                src="/images/about-campus.png"
                alt="KIP College Main Campus in Wikililye, Kitui"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-brand-950/85 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-300 shadow-md backdrop-blur-sm"
              >
                <span className="gold-rule h-px w-4" />
                Since 2012
              </span>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <p className="eyebrow">Our story</p>
            <h2 id="story-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              From one building in Kitui to <em className="text-gold-gradient">three campuses</em>
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p className="text-pretty first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-5xl first-letter:font-semibold first-letter:leading-none first-letter:text-gold-500">
                KIP College was established in <strong className="text-foreground">2012</strong> in a single
                building in Kitui Town with a handful of students and one clear mission — to make quality
                tertiary education accessible to the young people of Kitui County and Eastern Kenya.
              </p>
              <p>
                More than a decade later, the college has grown into a respected institution with{' '}
                <strong className="text-foreground">three campuses</strong> — Main Campus at Wikililye along
                Mulango Road, Town Campus at the Muli Mall building in Kitui CBD, and Mwingi Campus at the
                Sunrise Building — serving thousands of learners from across the region.
              </p>
              <p>
                Our programmes are aligned to national examination bodies — TVET-CDACC and KNEC curricula,
                KASNEB professional syllabi and NITA trade testing — so every qualification our students earn
                carries recognised, national value.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* timeline of milestones */}
      <section className="kip-dots" aria-labelledby="milestones-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Milestones"
            title="A Decade of Growth"
            description="Key moments on the road from a single classroom block to a three-campus institution."
          />
          <h2 id="milestones-title" className="sr-only">
            Milestones
          </h2>
          <motion.ol {...fadeUp} className="relative mx-auto max-w-3xl">
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-[7px] top-4 w-0.5 rounded-full bg-gradient-to-b from-brand-600 via-brand-700 to-brand-600/20 dark:from-brand-500 dark:via-brand-600"
            />
            {MILESTONES.map((milestone, i) => (
              <motion.li
                key={milestone.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                className="relative pb-10 pl-10 last:pb-0 sm:pl-12"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1 h-4 w-4 rounded-full bg-gold-500 ring-4 ring-gold-500/20"
                />
                <p className="eyebrow">{milestone.period}</p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl">
                  {milestone.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{milestone.text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* mission / vision / values */}
      <section
        className="bg-brand-band kip-grain relative overflow-hidden text-[#f2efe6]"
        aria-labelledby="mvv-title"
      >
        <div aria-hidden="true" className="kip-pattern absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 id="mvv-title" className="sr-only">
            Mission, vision and values
          </h2>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="gold-rule w-6" aria-hidden="true" />
              <p className="eyebrow text-gold-400">What drives us</p>
              <span className="gold-rule w-6" aria-hidden="true" />
            </div>
            <p className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              Mission &amp; Vision
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <motion.div {...fadeUp}>
              <div className="card-lift h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
                  <Target className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">Our Mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#f2efe6]/70">
                  To provide accessible, high-quality technical, business and professional education that
                  equips learners with the knowledge, skills and values for employment, entrepreneurship and
                  lifelong learning.
                </p>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <div className="card-lift h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
                  <Eye className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">Our Vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#f2efe6]/70">
                  To be Eastern Kenya&rsquo;s most trusted tertiary institution — the first choice for
                  students seeking careers in engineering, ICT, business and the accountancy profession.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.ul {...fadeUp} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {VALUES.map((value, i) => (
              <motion.li
                key={value.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="card-lift flex min-h-11 items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-[#f2efe6]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
                  <value.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {value.label}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* what we offer */}
      <section
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="offer-title"
      >
        <SectionHeading
          eyebrow="Programmes"
          title="What We Offer"
          description="Three faculties covering the most sought-after careers in the region."
        />
        <h2 id="offer-title" className="sr-only">
          What we offer
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {OFFER_ROWS.map((row, i) => (
            <motion.div key={row.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
              <div className="card-lift h-full rounded-2xl border border-brand-900/10 bg-card p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                  <row.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{row.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* leadership */}
      <section className="bg-muted/40" aria-labelledby="leadership-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Our team"
            title="College Leadership"
            description="Experienced educators and administrators guiding every cohort."
          />
          <h2 id="leadership-title" className="sr-only">
            College leadership
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP.map((person, i) => (
              <motion.div key={person.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
                <div className="card-lift h-full rounded-2xl border border-brand-900/10 bg-card p-6 text-center shadow-sm">
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-brand-600 to-brand-800 font-display text-xl font-semibold uppercase tracking-wide text-[#f2efe6] ring-2 ring-gold-400/70 ring-offset-4 ring-offset-card dark:from-brand-500 dark:to-brand-700"
                  >
                    {person.initials}
                  </span>
                  <h3 className="mt-4 font-display font-semibold tracking-tight">{person.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-gold-600 dark:text-gold-400">{person.role}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{person.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* accreditations */}
      <section
        className="bg-brand-950 kip-grain relative overflow-hidden py-12 text-[#f2efe6] sm:py-14"
        aria-labelledby="accreditations-title"
      >
        <div aria-hidden="true" className="kip-pattern absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="accreditations-title"
            className="text-xs font-bold uppercase tracking-[0.22em] text-gold-400"
          >
            Examined &amp; accredited by
          </h2>
          <motion.ul {...fadeUp} className="mt-5 flex flex-wrap justify-center gap-3">
            {ACCREDITATIONS.map((body) => (
              <li
                key={body}
                className="inline-flex min-h-11 items-center rounded-lg border border-gold-400/40 bg-gold-400/10 px-5 font-display text-sm font-semibold tracking-wide text-gold-300"
              >
                {body}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>
    </div>
  )
}
