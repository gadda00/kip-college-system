import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { fail } from '@/lib/api-helpers'
import { computeBalances } from '@/lib/fees'

export const dynamic = 'force-dynamic'

/**
 * Task 8-c — CSV data exports for the registrar.
 *
 * GET /api/admin/export?type=students|payments|applications|results|fees-outstanding
 *   (&from=YYYY-MM-DD&to=YYYY-MM-DD for the payments export)
 *
 * ADMIN-guarded (session cookie, same pattern as every admin route).
 * Returns a raw CSV file (NOT the JSON envelope):
 *   - Content-Type: text/csv; charset=utf-8
 *   - Content-Disposition: attachment; filename="kip-{type}-{yyyymmdd}.csv"
 *   - UTF-8 BOM (\ufeff) so Excel opens it with correct encoding
 *   - fields containing commas/quotes/newlines are wrapped in double quotes
 *     with inner quotes doubled (RFC 4180 escaping)
 * On error the JSON error envelope is returned so the client can toast it.
 */

const EXPORT_TYPES = ['students', 'payments', 'applications', 'results', 'fees-outstanding'] as const
type ExportType = (typeof EXPORT_TYPES)[number]

/** RFC-4180 CSV field escaping. */
function esc(value: unknown): string {
  const s = value == null ? '' : String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** Build a CSV document (CRLF line endings per RFC 4180). */
function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))]
  return lines.join('\r\n')
}

/** "20261104" style stamp for filenames. */
function ymdStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

/** "2026-11-04 09:30" style sortable timestamp for CSV cells. */
function fmtCsvDateTime(value: Date | null): string {
  if (!value) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${value.getFullYear()}-${p(value.getMonth() + 1)}-${p(value.getDate())} ${p(value.getHours())}:${p(value.getMinutes())}`
}

function csvResponse(type: ExportType, csv: string): Response {
  return new Response(`\ufeff${csv}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kip-${type}-${ymdStamp()}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

/** Parse a YYYY-MM-DD date input into a Date bound (or null when invalid). */
function dateBound(raw: string, endOfDay: boolean): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const d = new Date(`${raw}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  if (endOfDay) d.setHours(23, 59, 59, 999)
  return d
}

export async function GET(req: Request) {
  try {
    await requireRole('ADMIN')

    const url = new URL(req.url)
    const type = url.searchParams.get('type')?.trim() ?? ''
    if (!EXPORT_TYPES.includes(type as ExportType)) {
      throw new HttpError(
        400,
        'Unknown export type — expected one of students, payments, applications, results, fees-outstanding',
      )
    }

    if (type === 'students') {
      const students = await db.studentProfile.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          course: { select: { title: true } },
          campus: { select: { name: true } },
        },
        orderBy: { admissionNo: 'asc' },
      })
      const balances = await computeBalances(students.map((s) => s.id))
      const csv = toCsv(
        [
          'Admission No', 'Name', 'Email', 'Phone', 'Course', 'Campus', 'Year', 'Term',
          'Status', 'KCSE', 'Gender', 'Guardian', 'Guardian Phone',
          'Fees Billed', 'Fees Paid', 'Balance',
        ],
        students.map((s) => [
          s.admissionNo,
          s.user.name,
          s.user.email,
          s.user.phone ?? '',
          s.course.title,
          s.campus.name,
          s.yearOfStudy,
          s.currentTerm,
          s.status,
          s.kcseGrade ?? '',
          s.gender ?? '',
          s.guardianName ?? '',
          s.guardianPhone ?? '',
          balances.get(s.id)?.totalCharged ?? 0,
          balances.get(s.id)?.totalPaid ?? 0,
          balances.get(s.id)?.balance ?? 0,
        ]),
      )
      return csvResponse('students', csv)
    }

    if (type === 'payments') {
      const from = url.searchParams.get('from')?.trim() ?? ''
      const to = url.searchParams.get('to')?.trim() ?? ''
      const fromDate = from ? dateBound(from, false) : null
      const toDate = to ? dateBound(to, true) : null
      if (from && !fromDate) throw new HttpError(400, 'Invalid "from" date — use YYYY-MM-DD')
      if (to && !toDate) throw new HttpError(400, 'Invalid "to" date — use YYYY-MM-DD')

      const payments = await db.payment.findMany({
        where: {
          ...(fromDate || toDate
            ? {
                paidAt: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
        include: {
          student: {
            select: {
              admissionNo: true,
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      })
      const csv = toCsv(
        [
          'Date', 'Reference', 'Student Admission No', 'Student Name', 'Amount', 'Method',
          'Status', 'Recorded By', 'Note',
        ],
        payments.map((p) => [
          fmtCsvDateTime(p.paidAt),
          p.reference,
          p.student.admissionNo,
          p.student.user.name,
          p.amount,
          p.method,
          p.status,
          p.recordedBy ?? '',
          p.note ?? '',
        ]),
      )
      return csvResponse('payments', csv)
    }

    if (type === 'applications') {
      const applications = await db.application.findMany({
        include: {
          course: { select: { title: true } },
          campus: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      const csv = toCsv(
        [
          'Applied At', 'Name', 'Email', 'Phone', 'Course', 'Campus', 'KCSE Grade',
          'KCSE Year', 'Gender', 'Guardian', 'Status', 'Admin Note', 'Reviewed At',
        ],
        applications.map((a) => [
          fmtCsvDateTime(a.createdAt),
          a.applicantName,
          a.email,
          a.phone,
          a.course.title,
          a.campus.name,
          a.kcseGrade,
          a.kcseYear,
          a.gender ?? '',
          a.guardianName ?? '',
          a.status,
          a.adminNote ?? '',
          a.reviewedAt ? fmtCsvDateTime(a.reviewedAt) : '',
        ]),
      )
      return csvResponse('applications', csv)
    }

    if (type === 'results') {
      const results = await db.result.findMany({
        include: {
          student: {
            select: {
              admissionNo: true,
              user: { select: { name: true } },
              course: { select: { title: true } },
            },
          },
          unit: { select: { code: true, name: true } },
        },
      })
      results.sort((a, b) =>
        a.student.admissionNo === b.student.admissionNo
          ? a.unit.code.localeCompare(b.unit.code)
          : a.student.admissionNo.localeCompare(b.student.admissionNo),
      )
      const csv = toCsv(
        [
          'Student Admission No', 'Student Name', 'Course', 'Unit Code', 'Unit Name', 'Term',
          'Marks', 'Grade', 'Published', 'Exam Body',
        ],
        results.map((r) => [
          r.student.admissionNo,
          r.student.user.name,
          r.student.course.title,
          r.unit.code,
          r.unit.name,
          r.term,
          r.marks,
          r.grade,
          r.published ? 'Yes' : 'No',
          r.examBody ?? '',
        ]),
      )
      return csvResponse('results', csv)
    }

    // type === 'fees-outstanding'
    const students = await db.studentProfile.findMany({
      include: {
        user: { select: { name: true, phone: true } },
        course: { select: { title: true } },
        campus: { select: { name: true } },
      },
      orderBy: { admissionNo: 'asc' },
    })
    const balances = await computeBalances(students.map((s) => s.id))
    const rows = students
      .map((s) => ({ s, bal: balances.get(s.id) ?? { totalCharged: 0, totalPaid: 0, balance: 0 } }))
      .filter((r) => r.bal.balance > 0)
      .sort((a, b) => b.bal.balance - a.bal.balance)
    const csv = toCsv(
      ['Admission No', 'Name', 'Course', 'Campus', 'Phone', 'Guardian Phone', 'Billed', 'Paid', 'Balance'],
      rows.map(({ s, bal }) => [
        s.admissionNo,
        s.user.name,
        s.course.title,
        s.campus.name,
        s.user.phone ?? '',
        s.guardianPhone ?? '',
        bal.totalCharged,
        bal.totalPaid,
        bal.balance,
      ]),
    )
    return csvResponse('fees-outstanding', csv)
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.status)
    console.error('[api] Export error:', err)
    return fail('Something went wrong while generating the export', 500)
  }
}
