'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { IdCard, Info, Printer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { usePrintDoc } from '@/components/kip/portal/print-doc'
import { RowsSkeleton, ViewHeading, initialsOf } from '@/components/kip/portal/shared'
import type { StudentProfileFull } from '@/components/kip/portal/types'

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

/**
 * The student ID card itself — navy → royal blue gradient, crest, initials
 * photo placeholder, ACTIVE status (semantic green) and a CSS barcode footer.
 * Used on-screen (#/portal/id-card) and re-mounted in the print portal so
 * ONLY the card prints.
 */
export function StudentIdCard({ profile }: { profile: StudentProfileFull }) {
  const validThrough = useMemo(
    () => validThroughLabel(profile.admittedAt, profile.course.durationMonths),
    [profile.admittedAt, profile.course.durationMonths],
  )

  return (
    <div
      className="relative w-full max-w-[420px] overflow-hidden rounded-2xl text-white shadow-xl ring-1 ring-white/20"
      style={{
        background: 'linear-gradient(135deg, #0b1f3f 0%, #123a8a 55%, #1565C0 100%)',
      }}
      role="img"
      aria-label={`Student ID card for ${profile.name}, admission number ${profile.admissionNo}`}
    >
      {/* decorative sky accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-sky-300/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-sky-300/10"
      />

      <div className="relative flex aspect-[8/5] flex-col p-4 sm:p-5">
        {/* header */}
        <div className="flex items-center gap-3">
          <KipCrest className="h-10 w-10 shrink-0 text-white" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black uppercase leading-tight tracking-wide">
              Kitui Institute of Professionals
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-sky-300">
              Student ID Card
            </p>
          </div>
          <Badge
            className={`shrink-0 gap-1 border-transparent px-2 py-0.5 text-[9px] font-bold ${
              profile.status === 'ACTIVE'
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            {profile.status === 'ACTIVE' ? 'ACTIVE' : profile.status}
          </Badge>
        </div>

        {/* body */}
        <div className="mt-3 flex min-h-0 flex-1 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-xl font-black tracking-wide"
          >
            {initialsOf(profile.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight">{profile.name}</p>
            <p className="mt-1 font-mono text-[10px] font-semibold tracking-wider text-sky-300">
              {profile.admissionNo}
            </p>
            <p className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-snug text-white/90">
              {profile.course.title}
            </p>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-white/70">
              {profile.campus.name} · Year {profile.yearOfStudy} · Term {profile.currentTerm}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Valid through
            </p>
            <p className="mt-0.5 font-mono text-[13px] font-black tracking-wide">{validThrough}</p>
          </div>
        </div>

        {/* barcode footer strip */}
        <div className="mt-3 flex h-10 items-center justify-between gap-3 rounded-lg bg-white px-3">
          <div
            aria-hidden="true"
            className="h-6 w-40 shrink-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #0b1f3f 0 2px, transparent 2px 4px, #0b1f3f 4px 7px, transparent 7px 9px, #0b1f3f 9px 10px, transparent 10px 13px, #0b1f3f 13px 15px, transparent 15px 17px)',
            }}
          />
          <p className="shrink-0 text-[9px] font-bold italic tracking-wide text-[#0b1f3f]">
            Training for Excellence
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
                <Button onClick={print} className="min-h-11">
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
            className="flex justify-center rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-10"
          >
            <StudentIdCard profile={data} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            aria-label="ID card notes"
          >
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IdCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">About your student ID</p>
                  <p className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      Printing opens your browser dialog with only the card on the page — choose
                      &ldquo;Save as PDF&rdquo; to download a digital copy, or print and collect an
                      official laminated card at the registrar&rsquo;s office.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
