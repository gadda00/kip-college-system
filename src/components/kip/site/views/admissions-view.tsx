'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Landmark,
  PencilRuler,
  Smartphone,
  UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHero } from '@/components/kip/components/page-hero'
import { SectionHeading } from '@/components/kip/components/section-heading'
import { navigate } from '@/components/kip/lib/router'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

const STEPS = [
  {
    icon: PencilRuler,
    title: 'Choose your programme',
    text: 'Browse the academic catalogue and pick a course that matches your KCSE results and career goals. Our team or the KIP Assistant can help you decide.',
  },
  {
    icon: FileText,
    title: 'Apply online or visit campus',
    text: 'Fill the free online application form on this website — or walk into any of our three campuses with your documents. Applying takes less than 10 minutes.',
  },
  {
    icon: ClipboardCheck,
    title: 'Verification & acceptance',
    text: 'Our admissions team verifies your details and sends an acceptance letter within 48 hours, together with your admission number and fee structure.',
  },
  {
    icon: UserCheck,
    title: 'Pay fees & register',
    text: 'Pay the registration fee and first-term tuition via M-Pesa, bank or cash, then report to campus to register units and start classes.',
  },
]

const REQUIREMENT_ROWS = [
  {
    level: 'Diploma',
    requirement: 'KCSE mean grade C- (minus)',
    example: 'Diploma in ICT, Diploma in Business Management, Diploma in EEE',
  },
  {
    level: 'CPA (Professional)',
    requirement: 'KCSE C+ (plus), or CAMS certificate as bridging',
    example: 'Certified Public Accountant (CPA) — KASNEB',
  },
  {
    level: 'Certificate',
    requirement: 'KCSE D (plain) — D+ for CAMS',
    example: 'Certificate in ICT, Certificate in HRM, CAMS',
  },
  {
    level: 'Artisan',
    requirement: 'KCSE D- (minus) and below',
    example: 'Artisan Certificate in Electrical Installation',
  },
]

const DOCUMENTS = [
  'Original & copy of KCSE certificate or result slip',
  'National ID card or birth certificate',
  'Two recent passport-size photographs',
  'Previous transcripts / certificates (transfer students only)',
]

const PAYMENT_METHODS = [
  {
    icon: Smartphone,
    title: 'M-Pesa',
    lines: ['Paybill: 522 890', 'Account: Admission No.'],
    note: 'Instant confirmation — keep the SMS as receipt.',
    featured: true,
  },
  {
    icon: Landmark,
    title: 'Bank deposit',
    lines: ['Equity Bank — Kitui Branch', 'A/C 1234567890'],
    note: 'Bring the slip to the campus finance office.',
    featured: false,
  },
  {
    icon: Building,
    title: 'Cash at campus',
    lines: ['Finance offices at all 3 campuses', 'Mon–Fri 8:00–17:00, Sat 9:00–13:00'],
    note: 'An official receipt is issued immediately.',
    featured: false,
  },
]

const INTAKES = [
  { month: 'January 2027', note: 'Applying now', open: true },
  { month: 'May 2027', note: 'Upcoming intake', open: false },
  { month: 'September 2027', note: 'Upcoming intake', open: false },
]

export function AdmissionsView() {
  return (
    <div>
      <PageHero
        eyebrow="Join us"
        title="Admissions"
        subtitle="A simple, guided process from application to your first day of class. Applications are free — response within 48 hours."
        breadcrumb={[{ label: 'Admissions' }]}
      />

      {/* steps */}
      <section className="kip-dots" aria-labelledby="steps-title">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 id="steps-title" className="sr-only">
            Admission steps
          </h2>
          <SectionHeading
            eyebrow="How to join"
            title="Four Steps to Your First Class"
            description="From choosing a programme to reporting to campus — every stage of the journey is guided."
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="relative"
              >
                {/* vertical dashed rail (below lg) */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[-2.5rem] left-[1.375rem] top-14 border-l-2 border-dashed border-brand-600/40 lg:hidden"
                  />
                )}
                {/* horizontal dashed rail (lg) */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-6 left-14 top-[1.375rem] hidden border-t-2 border-dashed border-brand-600/40 lg:block"
                  />
                )}
                <div className="flex gap-4 lg:block">
                  <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 font-display text-base font-semibold text-[#f2efe6] shadow-sm ring-4 ring-background lg:mb-4 dark:bg-brand-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                      <step.icon
                        className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400"
                        aria-hidden="true"
                      />
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* requirements */}
      <section className="bg-muted/40" aria-labelledby="requirements-title">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Entry requirements</p>
            <h2
              id="requirements-title"
              className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Minimum Entry Requirements
            </h2>
            <p className="mt-3 text-pretty text-sm text-muted-foreground">
              Per programme level — unsure where you fit? Call{' '}
              <a
                href="tel:+254712345678"
                className="font-medium text-primary underline-offset-2 transition-colors hover:text-gold-600 hover:underline dark:hover:text-gold-400"
              >
                0703 710 879
              </a>{' '}
              and we will guide you.
            </p>
          </div>
          <motion.div
            {...fadeUp}
            className="mt-8 overflow-hidden rounded-xl border border-brand-900/10 bg-card shadow-sm"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-brand-900/10 bg-brand-50 hover:bg-brand-50 dark:bg-brand-100/40 dark:hover:bg-brand-100/40">
                  <TableHead className="py-4 font-display text-sm font-semibold tracking-wide sm:text-base">
                    Level
                  </TableHead>
                  <TableHead className="py-4 font-display text-sm font-semibold tracking-wide sm:text-base">
                    Requirement
                  </TableHead>
                  <TableHead className="hidden py-4 font-display text-sm font-semibold tracking-wide sm:text-base md:table-cell">
                    Example programmes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REQUIREMENT_ROWS.map((row) => (
                  <TableRow key={row.level} className="border-brand-900/10">
                    <TableCell className="py-4 font-display font-semibold text-brand-700 dark:text-gold-300">
                      {row.level}
                    </TableCell>
                    <TableCell className="py-4">{row.requirement}</TableCell>
                    <TableCell className="hidden py-4 text-muted-foreground md:table-cell">
                      {row.example}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* documents */}
          <motion.div {...fadeUp} className="mt-10">
            <Card className="border-brand-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <FileText className="h-5 w-5 text-gold-500" aria-hidden="true" />
                  Documents you&rsquo;ll need
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DOCUMENTS.map((doc) => (
                    <li key={doc} className="flex items-start gap-2.5 text-sm">
                      <BadgeCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold-500"
                        aria-hidden="true"
                      />
                      {doc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* fee payment methods */}
      <section
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="payment-title"
      >
        <SectionHeading
          eyebrow="Fees &amp; payments"
          title="Fee Payment Methods"
          description="Choose whichever channel suits you — receipts issued for every payment."
        />
        <h2 id="payment-title" className="sr-only">
          Fee payment methods
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method, i) => (
            <motion.div key={method.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Card
                className={`card-lift h-full ${
                  method.featured
                    ? 'border-gold-500/40 bg-gold-400/5'
                    : 'border-brand-900/10'
                }`}
              >
                <CardContent className="p-6">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      method.featured
                        ? 'bg-gold-400/15 text-gold-700 dark:text-gold-400'
                        : 'bg-brand-50 text-primary dark:bg-brand-100'
                    }`}
                  >
                    <method.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                    {method.title}
                  </h3>
                  <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                    {method.lines.map((line) => (
                      <p key={line} className="font-medium text-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{method.note}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Banknote className="h-4 w-4 text-gold-500" aria-hidden="true" />
          Flexible instalments available — talk to the finance office.
        </p>
      </section>

      {/* important dates + CTA */}
      <section
        className="bg-brand-band kip-grain relative overflow-hidden text-[#f2efe6]"
        aria-labelledby="dates-title"
      >
        <div aria-hidden="true" className="kip-pattern absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow text-gold-400">Mark your calendar</p>
            <h2
              id="dates-title"
              className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Next Intakes:{' '}
              <span className="text-gold-gradient">January &middot; May &middot; September</span>
            </h2>
          </div>
          <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {INTAKES.map((intake, i) => (
              <motion.div
                key={intake.month}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className={`rounded-xl border p-5 text-left backdrop-blur-sm ${
                  intake.open
                    ? 'border-gold-400/70 bg-gold-400/10 shadow-lg shadow-gold-500/10'
                    : 'border-gold-400/30 bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CalendarDays
                    className={intake.open ? 'h-5 w-5 text-gold-300' : 'h-5 w-5 text-gold-400/80'}
                    aria-hidden="true"
                  />
                  {intake.open && (
                    <Badge className="border-transparent bg-gold-400/95 text-[#0e2233]">
                      Applying now
                    </Badge>
                  )}
                </div>
                <p className="mt-3 font-display text-xl font-semibold text-[#f2efe6]">{intake.month}</p>
                <p className="mt-1 text-sm text-[#f2efe6]/70">{intake.note}</p>
              </motion.div>
            ))}
          </div>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-[#f2efe6]/80">
            Apply early to secure a place, on-campus hostel room and KASNEB registration for the next
            sitting. Applications are free.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/apply')}
            className="btn-gold min-h-12 border-0 px-10 text-base font-bold text-brand-950 hover:bg-gold-400 hover:text-brand-950"
          >
            Start Online Application
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </div>
  )
}
