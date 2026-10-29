'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { IdCard, Info, Printer, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { usePrintDoc } from '@/components/kip/portal/print-doc'
import { RowsSkeleton, ViewHeading, initialsOf } from '@/components/kip/portal/shared'
import type { StudentProfileFull } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

/** Card expiry = admission date + course duration (min 12 months ahead today). */
function validThroughLabel(admittedAt: string, durationMonths: number): string {
  const from = new Date(admittedAt)
  const end = new Date(from)
  end.setMonth(end.getMonth() + (durationMonths > 0 ? durationMonths : 24))
  const floor = new Date()
  floor.setFullYear(floor.getFullYear() + 1)
  const effective = end > floor ? end : floor
  return effective.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })
}

/** Deterministic decorative "QR" matrix from the admission number (5×5 finder + hash). */
function qrCells(seed: string): boolean[] {
  let h = 7
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return Array.from({ length: 25 }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0
    if (i === 0 || i === 4 || i === 20 || i === 24) return true // finder corners
    if (i === 2 || i === 10 || i === 14 || i === 22) return false // finder gaps
    return (h >>> 8) % 2 === 0
  })
}

/**
 * The student ID card itself — premium CR80-style sapphire & gold face with
 * crest, gold-ringed initials photo placeholder, mono admission number,
 * holographic sheen and a CSS barcode strip. Used on-screen (#/portal/id-card)
 * and re-mounted in the print portal so ONLY the card prints.
 */
export function StudentIdCard({ profile }: { profile: StudentProfileFull }) {
  const validThrough = useMemo(
    () => validThroughLabel(profile.admittedAt, profile.course.durationMonths),
    [profile.admittedAt, profile.course.durationMonths],
  )
  const qr = useMemo(() => qrCells(profile.admissionNo), [profile.admissionNo])

  return (
    <div
      className="relative aspect-[85.6/53.9] w-full max-w-sm overflow-hidden rounded-2xl border border-gold-400/40 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-[#f2efe6] shadow-xl"
      role="img"
      aria-label={`Student ID card for ${profile.name}, admission number ${profile.admissionNo}`}
    >
      {/* woven reed texture overlay */}
      <div aria-hidden="true" className="kip-pattern absolute inset-0" />
      {/* gold glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-gold-400/15 blur-xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-brand-500/20 blur-xl"
      />
      {/* holographic sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
      />

      <div className="relative flex h-full flex-col p-3.5 sm:p-4">
        {/* header */}
        <div className="flex items-center gap-2.5">
          <KipCrest className="h-9 w-9 shrink-0 text-[#f2efe6]" />
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-[11px] font-bold uppercase leading-tight tracking-wide">
              Kitui Institute of Professionals
            </p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-gold-300">
              Student ID Card
            </p>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider',
              profile.status === 'ACTIVE'
                ? 'border-emerald-300/40 bg-emerald-400/20 text-emerald-200'
                : 'border-white/25 bg-white/10 text-[#f2efe6]/80',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                profile.status === 'ACTIVE' ? 'bg-emerald-300' : 'bg-white/60',
              )}
              aria-hidden="true"
            />
            {profile.status === 'ACTIVE' ? 'Active' : profile.status}
          </span>
        </div>

        {/* body */}
        <div className="mt-2.5 flex min-h-0 flex-1 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold-400/30 bg-brand-950/60 text-lg font-bold tracking-wide text-[#f2efe6] ring-2 ring-gold-400/70"
          >
            {initialsOf(profile.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-[15px] font-bold leading-tight">
              {profile.name}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold tracking-wider text-gold-300">
              {profile.admissionNo}
            </p>
            <p className="mt-1.5 line-clamp-2 text-[9.5px] font-medium leading-snug text-[#f2efe6]/90">
              {profile.course.title}
            </p>
            <p className="mt-1 text-[8px] font-medium uppercase tracking-wide text-[#f2efe6]/60">
              {profile.campus.name} · Year {profile.yearOfStudy} · Term {profile.currentTerm}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[7.5px] font-semibold uppercase tracking-[0.18em] text-[#f2efe6]/60">
              Valid through
            </p>
            <p className="font-mono text-[13px] font-bold tracking-wide text-gold-300">
              {validThrough}
            </p>
          </div>
        </div>

        {/* barcode + QR footer strip */}
        <div className="mt-2.5 flex h-9 items-center justify-between gap-3 rounded-lg bg-[#f2efe6] px-2.5 py-1.5">
          <div
            aria-hidden="true"
            className="h-full w-32 shrink-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #0e2233 0 2px, transparent 2px 4px, #0e2233 4px 7px, transparent 7px 9px, #0e2233 9px 10px, transparent 10px 13px, #0e2233 13px 15px, transparent 15px 17px)',
            }}
          />
          <p className="shrink-0 text-[8px] font-bold italic tracking-wide text-brand-900">
            Training for Excellence
          </p>
          {/* decorative QR mark */}
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 grid-cols-5 grid-rows-5 gap-[1px]"
          >
            {qr.map((on, i) => (
              <span
                key={i}
                className={cn('h-full w-full', on ? 'bg-brand-900' : 'bg-transparent')}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Reverse side: magstripe, registrar return note and emergency contacts. */
function StudentIdCardBack({ profile }: { profile: StudentProfileFull }) {
  return (
    <div
      className="relative aspect-[85.6/53.9] w-full max-w-sm overflow-hidden rounded-2xl border border-brand-800/60 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 text-[#f2efe6] shadow-xl"
      role="img"
      aria-label={`Back of the student ID card for ${profile.name}, with emergency contacts`}
    >
      <div aria-hidden="true" className="kip-pattern absolute inset-0" />
      {/* magstripe */}
      <div aria-hidden="true" className="relative h-7 w-full bg-brand-950" />
      <div className="relative flex h-[calc(100%-1.75rem)] flex-col justify-between p-4">
        <div className="space-y-1.5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-gold-300">
            If found, return to the Registrar
          </p>
          <p className="text-[9.5px] font-medium leading-relaxed text-[#f2efe6]/80">
            Kitui Institute of Professionals · P.O. Box 310-90200, Kitui, Kenya · Tel 0703 710 879
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9.5px]">
          <div>
            <dt className="text-[7.5px] font-semibold uppercase tracking-wider text-[#f2efe6]/55">
              Guardian
            </dt>
            <dd className="mt-0.5 truncate font-semibold">
              {profile.guardianName ?? 'Not recorded'}
            </dd>
          </div>
          <div>
            <dt className="text-[7.5px] font-semibold uppercase tracking-wider text-[#f2efe6]/55">
              Guardian phone
            </dt>
            <dd className="mt-0.5 truncate font-mono font-semibold">
              {profile.guardianPhone ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[7.5px] font-semibold uppercase tracking-wider text-[#f2efe6]/55">
              Admission no
            </dt>
            <dd className="mt-0.5 font-mono font-semibold text-gold-300">{profile.admissionNo}</dd>
          </div>
          <div>
            <dt className="text-[7.5px] font-semibold uppercase tracking-wider text-[#f2efe6]/55">
              Campus
            </dt>
            <dd className="mt-0.5 truncate font-semibold">{profile.campus.name}</dd>
          </div>
        </dl>
        <div className="flex items-center justify-between gap-3">
          <div
            aria-hidden="true"
            className="h-4 w-28 shrink-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #f2efe6 0 2px, transparent 2px 4px, #f2efe6 4px 7px, transparent 7px 9px, #f2efe6 9px 10px, transparent 10px 13px)',
            }}
          />
          <p className="shrink-0 text-[7.5px] font-semibold uppercase tracking-[0.2em] text-[#f2efe6]/55">
            Property of KIP College
          </p>
        </div>
      </div>
    </div>
  )
}

/** #/portal/id-card — digital + printable student ID card. */
export function IdCardView() {
  const { data, status, error, refetch } = useQuery<StudentProfileFull>({
    queryKey: ['student-profile'],
    queryFn: () => api<StudentProfileFull>('/api/student/profile'),
  })

  const { print, printDoc } = usePrintDoc(
    () =>
      data ? (
        <div className="flex min-h-screen items-center justify-center p-8">
          <StudentIdCard profile={data} />
        </div>
      ) : null,
  )

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={<RowsSkeleton rows={3} />}
    >
      {data && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ViewHeading
              title="Student ID Card"
              description="Your digital student ID — print it and keep it with you on campus."
              actions={
                <Button onClick={print} className="btn-gold focus-glow min-h-11">
                  <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                  Print ID card
                </Button>
              }
            />
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            aria-label="Student ID card preview"
            className="kip-dots flex flex-col items-center gap-5 rounded-2xl border bg-muted/30 p-6 sm:p-10"
          >
            <StudentIdCard profile={data} />
            <StudentIdCardBack profile={data} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            aria-label="ID card notes"
          >
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-400">
                  <IdCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-display font-semibold text-foreground">About your student ID</p>
                  <p className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-gold-400" aria-hidden="true" />
                    <span>
                      Printing opens your browser dialog with only the front of the card on the page
                      — choose &ldquo;Save as PDF&rdquo; to download a digital copy, or print and
                      collect an official laminated card at the registrar&rsquo;s office.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-gold-400" aria-hidden="true" />
                    <span>
                      Always carry your ID on campus — it is required at the library, workshops,
                      exams and college transport.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {printDoc}
        </div>
      )}
    </QueryBoundary>
  )
}
