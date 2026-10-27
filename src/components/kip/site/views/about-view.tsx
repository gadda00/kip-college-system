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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

const ACCREDITATIONS = [
  'TVET Authority',
  'KASNEB',
  'KNEC',
  'NITA',
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="story-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img
                src="/images/about-campus.png"
                alt="KIP College Main Campus in Wikililye, Kitui"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <h2 id="story-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Our Story
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                KIP College was established in <strong>2012</strong> in a single building in Kitui
                Town with a handful of students and one clear mission — to make quality tertiary
                education accessible to the young people of Kitui County and Eastern Kenya.
              </p>
              <p>
                More than a decade later, the college has grown into a respected institution with{' '}
                <strong>three campuses</strong> — Main Campus at Wikililye along Mulango Road, Town
                Campus at the Muli Mall building in Kitui CBD, and Mwingi Campus at the Sunrise
                Building — serving thousands of learners from across the region.
              </p>
              <p>
                Our programmes are aligned to national examination bodies — TVET-CDACC and KNEC
                curricula, KASNEB professional syllabi and NITA trade testing — so every
                qualification our students earn carries recognised, national value.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* mission / vision */}
      <section className="bg-muted/40" aria-labelledby="mvv-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="mvv-title" className="sr-only">
            Mission, vision and values
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <motion.div {...fadeUp}>
              <Card className="h-full border-primary/15">
                <CardContent className="p-6 sm:p-8">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Target className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">Our Mission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    To provide accessible, high-quality technical, business and professional
                    education that equips learners with the knowledge, skills and values for
                    employment, entrepreneurship and lifelong learning.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="h-full border-primary/15">
                <CardContent className="p-6 sm:p-8">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">Our Vision</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    To be Eastern Kenya&rsquo;s most trusted tertiary institution — the first choice
                    for students seeking careers in engineering, ICT, business and the accountancy
                    profession.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.ul {...fadeUp} className="mt-6 flex flex-wrap justify-center gap-3">
            {VALUES.map((value) => (
              <li
                key={value.label}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-card px-4 text-sm font-medium text-primary"
              >
                <value.icon className="h-4 w-4" aria-hidden="true" />
                {value.label}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* what we offer */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="offer-title">
        <SectionHeading
          eyebrow="Programmes"
          title="What We Offer"
          description="Three faculties covering the most sought-after careers in the region."
        />
        <h2 id="offer-title" className="sr-only">
          What we offer
        </h2>
        <div className="space-y-4">
          {OFFER_ROWS.map((row, i) => (
            <motion.div key={row.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
              <Card className="border-primary/10">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <row.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{row.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{row.text}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* leadership */}
      <section className="bg-muted/40" aria-labelledby="leadership-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
                <Card className="h-full text-center transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6">
                    <span
                      aria-hidden="true"
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-primary to-sky-800 text-xl font-bold uppercase tracking-wide text-white ring-4 ring-sky-400/70"
                    >
                      {person.initials}
                    </span>
                    <h3 className="mt-4 font-semibold">{person.name}</h3>
                    <p className="mt-0.5 text-sm font-medium text-primary">{person.role}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{person.detail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* accreditations */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="accreditations-title">
        <div className="text-center">
          <h2 id="accreditations-title" className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Examined &amp; accredited by
          </h2>
          <motion.ul {...fadeUp} className="mt-5 flex flex-wrap justify-center gap-3">
            {ACCREDITATIONS.map((body) => (
              <li
                key={body}
                className="inline-flex min-h-11 items-center rounded-lg border-2 border-primary/25 bg-primary/5 px-5 text-sm font-bold text-primary"
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
