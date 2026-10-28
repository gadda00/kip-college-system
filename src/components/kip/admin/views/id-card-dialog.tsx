'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IdCard, Printer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { useAdminPrintDoc } from '@/components/kip/admin/admin-print'
import { initialsOf } from '@/components/kip/portal/shared'
import type { AdminStudentDetail } from '@/components/kip/admin/types'

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
 * The admin-side student ID card — mirrors the student-facing design:
 * deep emerald gradient band with gold accents, crest, “KITUI INSTITUTE OF
 * PROFESSIONALS / STUDENT ID CARD” header in serif, initials avatar with a
 * gold ring, ACTIVE badge, VALID THROUGH stamp and a CSS barcode footer with
 * the college motto. Rendered on-screen inside the dialog and re-mounted into
 * the body-level print portal so ONLY the card prints.
 */
export function AdminStudentIdCard({ student }: { student: AdminStudentDetail }) {
  const validThrough = useMemo(
    () => validThroughLabel(student.admittedAt, student.course.durationMonths),
    [student.admittedAt, student.course.durationMonths],
  )

  return (
    <div
      className="relative w-full max-w-[420px] overflow-hidden rounded-2xl text-[#f2efe6] shadow-xl ring-1 ring-white/20"
      style={{
        background: 'linear-gradient(135deg, #06231A 0%, #0B4430 55%, #10543A 100%)',
      }}
      role="img"
      aria-label={`Student ID card for ${student.user.name}, admission number ${student.admissionNo}`}
    >
      {/* decorative gold accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-gold-300/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-gold-300/10"
      />

      <div className="relative flex aspect-[8/5] flex-col p-4 sm:p-5">
        {/* header — emerald band with serif institution name */}
        <div className="flex items-center gap-3">
          <KipCrest className="h-10 w-10 shrink-0 text-white" />
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-[11px] font-bold uppercase leading-tight tracking-wide">
              Kitui Institute of Professionals
            </p>
            <div className="gold-rule mt-1 w-10" aria-hidden="true" />
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-300">
              Student ID Card
            </p>
          </div>
          <Badge
            className={`shrink-0 gap-1 border-transparent px-2 py-0.5 text-[9px] font-bold ${
              student.status === 'ACTIVE'
                ? 'bg-gold-400 text-[#06231A]'
                : 'bg-white/20 text-[#f2efe6]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            {student.status === 'ACTIVE' ? 'ACTIVE' : student.status}
          </Badge>
        </div>

        {/* body */}
        <div className="mt-3 flex min-h-0 flex-1 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-2 border-gold-400/60 bg-white/10 text-xl font-bold tracking-wide"
          >
            {initialsOf(student.user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight">{student.user.name}</p>
            <p className="mt-1 font-mono text-[10px] font-semibold tracking-wider text-gold-300">
              {student.admissionNo}
            </p>
            <p className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-snug text-white/90">
              {student.course.title}
            </p>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-white/70">
              {student.campus.name} · Year {student.yearOfStudy} · Term {student.currentTerm}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Valid through
            </p>
            <p className="mt-0.5 font-mono text-[13px] font-bold tracking-wide">{validThrough}</p>
          </div>
        </div>

        {/* barcode footer strip */}
        <div className="mt-3 flex h-10 items-center justify-between gap-3 rounded-lg bg-white px-3">
          <div
            aria-hidden="true"
            className="h-6 w-40 shrink-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #06231A 0 2px, transparent 2px 4px, #06231A 4px 7px, transparent 7px 9px, #06231A 9px 10px, transparent 10px 13px, #06231A 13px 15px, transparent 15px 17px)',
            }}
          />
          <p className="shrink-0 text-[9px] font-bold italic tracking-wide text-[#06231A]">
            Training for Excellence
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Admin ID card dialog: opens from the students table or the student detail
 * view, previews the card and prints ONLY the card via the body-level print
 * portal (uses the cached ['admin-student', id] query so it renders
 * instantly when opened from the detail view).
 */
export function StudentIdCardDialog({
  open,
  onOpenChange,
  studentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string | null
}) {
  const { data, status, error, refetch } = useQuery<AdminStudentDetail>({
    queryKey: ['admin-student', studentId ?? ''],
    queryFn: () => api<AdminStudentDetail>(`/api/admin/students/${studentId}`),
    enabled: open && !!studentId,
    retry: false,
  })

  const { print, printDoc } = useAdminPrintDoc(
    () =>
      data ? (
        <div className="flex min-h-screen items-center justify-center p-8">
          <AdminStudentIdCard student={data} />
        </div>
      ) : null,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="h-4 w-4 text-primary" aria-hidden="true" />
            Student ID card
          </DialogTitle>
          <DialogDescription>
            Preview and print the official student identity card.
          </DialogDescription>
        </DialogHeader>

        <QueryBoundary
          status={open && studentId ? status : 'pending'}
          error={error}
          onRetry={() => void refetch()}
          skeleton={
            <div className="mx-auto w-full max-w-[420px] space-y-3">
              <Skeleton className="aspect-[8/5] w-full rounded-2xl" />
            </div>
          }
        >
          {data && (
            <div className="flex justify-center rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-4 sm:p-6">
              <AdminStudentIdCard student={data} />
            </div>
          )}
        </QueryBoundary>

        <DialogFooter className="mt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={status !== 'success' || !data}
            onClick={print}
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Print Card
          </Button>
        </DialogFooter>

        {printDoc}
      </DialogContent>
    </Dialog>
  )
}
