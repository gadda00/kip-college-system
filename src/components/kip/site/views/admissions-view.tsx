'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  Building,
  CalendarDays,
  CheckCircle2,
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
  },
  {
    icon: Landmark,
    title: 'Bank deposit',
    lines: ['Equity Bank — Kitui Branch', 'A/C 1234567890'],
    note: 'Bring the slip to the campus finance office.',
  },
  {
    icon: Building,
    title: 'Cash at campus',
    lines: ['Finance offices at all 3 campuses', 'Mon–Fri 8:00–17:00, Sat 9:00–13:00'],
    note: 'An official receipt is issued immediately.',
  },
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="steps-title">
        <h2 id="steps-title" className="sr-only">
          Admission steps
        </h2>
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.li key={step.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Card className="relative h-full border-primary/10 transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <span className="absolute right-4 top-4 text-4xl font-black text-primary/10" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* requirements */}
      <section className="bg-muted/40" aria-labelledby="requirements-title">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="requirements-title" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Minimum Entry Requirements
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Per programme level — unsure where you fit? Call{' '}
            <a href="tel:+254712345678" className="font-medium text-primary hover:underline">
              0703 710 879
            </a>{' '}
            and we will guide you.
          </p>
          <motion.div {...fadeUp} className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="text-sm font-semibold">Level</TableHead>
                  <TableHead className="text-sm font-semibold">Requirement</TableHead>
                  <TableHead className="hidden text-sm font-semibold md:table-cell">
                    Example programmes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REQUIREMENT_ROWS.map((row) => (
                  <TableRow key={row.level}>
                    <TableCell className="font-semibold text-primary">{row.level}</TableCell>
                    <TableCell>{row.requirement}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {row.example}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* documents */}
          <motion.div {...fadeUp} className="mt-10">
            <Card className="border-primary/15">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Documents you&rsquo;ll need
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DOCUMENTS.map((doc) => (
                    <li key={doc} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="payment-title">
        <h2 id="payment-title" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Fee Payment Methods
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Choose whichever channel suits you — receipts issued for every payment.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method, i) => (
            <motion.div key={method.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Card className="h-full border-primary/10 transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <method.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{method.title}</h3>
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
          <Banknote className="h-4 w-4 text-primary" aria-hidden="true" />
          Flexible instalments available — talk to the finance office.
        </p>
      </section>

      {/* important dates + CTA */}
      <section className="bg-gradient-to-br from-primary via-[#123a8a] to-[#0b1f3f]" aria-labelledby="dates-title">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 id="dates-title" className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Next Intakes: January &middot; May &middot; September
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['January 2027 intake — applying now', 'May 2027 intake', 'September 2027 intake'].map(
              (label, i) => (
                <Badge
                  key={label}
                  variant="outline"
                  className={
                    i === 0
                      ? 'border-sky-300/70 bg-sky-400/25 px-4 py-2 text-sm font-medium text-sky-100'
                      : 'border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white/85'
                  }
                >
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Badge>
              ),
            )}
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-white/80">
            Apply early to secure a place, on-campus hostel room and KASNEB registration for the
            next sitting. Applications are free.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/apply')}
            className="min-h-12 bg-white px-10 text-base font-bold text-primary shadow-lg hover:bg-sky-100"
          >
            Start Online Application
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </div>
  )
}
