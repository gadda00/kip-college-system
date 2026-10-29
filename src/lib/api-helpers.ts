import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError, z } from 'zod'
import { db, isPostgres } from '@/lib/db'
import { HttpError } from '@/lib/auth'

/** Lenient boolean input: true/false, "true"/"false", "1"/"0", "yes"/"no". */
export const boolish = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'boolean' ? v : ['true', '1', 'yes'].includes(v.trim().toLowerCase())))

/** success response shape: { ok: true, data } */
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}

/** error response shape: { ok: false, error } */
export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

/**
 * Wraps a route handler body: converts HttpError / ZodError / Prisma known
 * errors into the standard JSON error shape; anything else → 500.
 */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.status)
    if (err instanceof ZodError) {
      return fail(err.issues[0]?.message ?? 'Invalid request input', 400)
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return fail('A record with the same unique value already exists', 409)
      if (err.code === 'P2025') return fail('Record not found', 404)
      if (err.code === 'P2003') return fail('Related record does not exist', 400)
      return fail('Database operation failed', 400)
    }
    console.error('[api]Unhandled error:', err)
    return fail('Something went wrong', 500)
  }
}

/** Parse a JSON request body, throwing a clean 400 on invalid JSON. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON')
  }
}

/** Parse dynamic route params (Next.js 16: params is a Promise). */
export async function routeParams<T extends Record<string, string>>(params: Promise<T>): Promise<T> {
  return await params
}

/** Auto-generate the next admission number: KIP/{yyyy}/{4-digit seq}. */
export async function nextAdmissionNo(): Promise<string> {
  const year = new Date().getFullYear()
  // Per-year sequence: count only students admitted in THIS calendar year
  // (KIP/{year}/…) so a new year restarts at 0001 instead of the sequence
  // inflating forever with total enrolment.
  const count = await db.studentProfile.count({
    where: { admissionNo: { startsWith: `KIP/${year}/` } },
  })
  let seq = count + 1
  for (;;) {
    const candidate = `KIP/${year}/${String(seq).padStart(4, '0')}`
    const existing = await db.studentProfile.findUnique({
      where: { admissionNo: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
    seq += 1
  }
}

/** Auto-generate a course code from the title's initials (e.g. "Diploma in X" → "DIX"). */
export async function generateCourseCode(title: string): Promise<string> {
  const initials = title
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ''))
    .filter((w) => w.length > 0)
    .map((w) => w[0]!.toUpperCase())
    .join('')
  const base = (initials || 'CRS').slice(0, 8)
  let code = base
  let n = 2
  for (;;) {
    const existing = await db.course.findUnique({ where: { code }, select: { id: true } })
    if (!existing) return code
    code = `${base}-${n}`
    n += 1
  }
}

/** KIP College grading scale: A≥80, B 65–79, C 50–64, D 40–49, E<40. */
export function gradeFor(marks: number): { grade: string; remark: string } {
  if (marks >= 80) return { grade: 'A', remark: 'Excellent' }
  if (marks >= 65) return { grade: 'B', remark: 'Good' }
  if (marks >= 50) return { grade: 'C', remark: 'Credit' }
  if (marks >= 40) return { grade: 'D', remark: 'Pass' }
  return { grade: 'E', remark: 'Fail' }
}

/** GPA conversion: A=4, B=3, C=2, D=1, E=0. */
export function gradePoints(grade: string): number {
  switch (grade) {
    case 'A':
      return 4
    case 'B':
      return 3
    case 'C':
      return 2
    case 'D':
      return 1
    default:
      return 0
  }
}

/** Current KIP College term label, e.g. "2026/2027 T1" (Jan–Apr T1, May–Aug T2, Sep–Dec T3). */
export function currentTermLabel(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const term = month <= 4 ? 1 : month <= 8 ? 2 : 3
  return `${now.getFullYear()}/${now.getFullYear() + 1} T${term}`
}

/** Random uppercase-alphanumeric reference (8 chars) with uniqueness retry. */
export async function uniqueReference(prefix: string, length = 8): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let attempt = 0; attempt < 10; attempt++) {
    let suffix = ''
    for (let i = 0; i < length; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
    const candidate = `${prefix}${suffix}`
    const existing = await db.payment.findUnique({ where: { reference: candidate }, select: { id: true } })
    if (!existing) return candidate
  }
  // practically unreachable; fall back to a timestamp-based suffix
  return `${prefix}${Date.now().toString(36).toUpperCase()}`
}

/** Parse "HH:MM" into minutes since midnight (returns null when malformed). */
export function timeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

/**
 * "Now" in Africa/Nairobi (EAT, UTC+3) — the college's local clock.
 * Vercel lambdas run on UTC, where the weekday flips at 21:00 EAT; computing
 * weekday/minutes through this formatter keeps "today" correct for timetables.
 */
const NAIROBI_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Nairobi',
  weekday: 'short', // Mon…Sun
  hour: 'numeric',
  minute: 'numeric',
  hour12: false, // 00…23
})

const ISO_DOW: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }

function nairobiNow(): { dow: number; minutes: number } {
  const parts = NAIROBI_FMT.formatToParts(new Date())
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  const dow = ISO_DOW[get('weekday')] ?? 1
  const minutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'))
  return { dow, minutes }
}

/** ISO day-of-week for "today" in Kenya: 1 Mon … 5 Fri, 6 Sat, 7 Sun. */
export function todayDow(): number {
  return nairobiNow().dow
}

/** Minutes since midnight right now, Africa/Nairobi time. */
export function nowMinutes(): number {
  return nairobiNow().minutes
}

/** Split a CSV string into a trimmed array (facilities, intakeMonths…). */
export function csvList(csv: string | null | undefined): string[] {
  if (!csv) return []
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Portable case-insensitive `contains` filter value.
 * SQLite's Prisma client rejects `mode: 'insensitive'` (its LIKE is already
 * ASCII-case-insensitive), while PostgreSQL's LIKE is case-sensitive and
 * needs the explicit insensitive mode. Use inside `where` objects:
 *   where: { title: contains(term) }
 */
export function contains(term: string): { contains: string; mode?: 'insensitive' } {
  return isPostgres ? { contains: term, mode: 'insensitive' as const } : { contains: term }
}

/**
 * Application references (KIP/APP/{year}/{code}) live inside the Application
 * adminNote column. Extract one from any adminNote shape — the structured
 * `Ref: <reference>` prefix (current), or the bare reference (legacy rows).
 */
export function applicationRefFromAdminNote(adminNote: string | null | undefined): string | null {
  if (!adminNote) return null
  const trimmed = adminNote.trim()
  const prefixed = /^Ref:\s*(KIP\/APP\/\d{4}\/[A-Z0-9]+)/i.exec(trimmed)
  if (prefixed) return prefixed[1]!
  if (/^KIP\/APP\/\d{4}\/[A-Z0-9]+$/.test(trimmed)) return trimmed // legacy bare reference
  return null
}

/**
 * Merge an admin's review note into adminNote WITHOUT losing the applicant's
 * reference: the `Ref: <reference>` prefix always survives and the admin's
 * note is appended after it. With no reference present it behaves like a
 * plain overwrite (null when both are empty).
 */
export function mergeAdminNote(
  existing: string | null | undefined,
  adminNote: string | null | undefined,
): string | null {
  const ref = applicationRefFromAdminNote(existing)
  const note = adminNote?.trim() ?? ''
  if (ref && note) return `Ref: ${ref} — ${note}`
  if (ref) return `Ref: ${ref}`
  return note || null
}
