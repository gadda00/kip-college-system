import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError, z } from 'zod'
import { db } from '@/lib/db'
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
  const count = await db.studentProfile.count()
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

/** ISO day-of-week for "today": 1 Mon … 5 Fri, 6 Sat, 7 Sun. */
export function todayDow(): number {
  const js = new Date().getDay() // 0 Sun … 6 Sat
  return js === 0 ? 7 : js
}

/** Minutes since midnight right now. */
export function nowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/** Split a CSV string into a trimmed array (facilities, intakeMonths…). */
export function csvList(csv: string | null | undefined): string[] {
  if (!csv) return []
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
