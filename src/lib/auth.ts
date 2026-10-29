import { db } from '@/lib/db'
import type { Prisma, Role } from '@prisma/client'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'kip_session'
const SESSION_DAYS = 30

/**
 * Sessions store only sha256(token) in the database, so a leaked DB dump
 * cannot be replayed as valid cookies. The cookie carries the raw token;
 * lookups always hash it first.
 */
export function hashSessionToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

/**
 * CSRF-lite: for cookie-authenticated state changes, require that the
 * request's Origin (or Referer fallback) matches the serving Host.
 * Applied by route handlers via `assertSameOrigin(req)` before mutations.
 *
 * @param opts.requireOrigin — when true (mutations), a request with NO
 *   Origin/Referer at all is rejected too, so cross-site scripts and
 *   smuggled non-browser clients cannot bypass the check by omitting it.
 *   Omit it for GET handlers so direct links / curl inspections keep working.
 */
export function assertSameOrigin(req: Request, opts?: { requireOrigin?: boolean }): void {
  const origin = req.headers.get('origin') || req.headers.get('referer')
  if (!origin) {
    if (opts?.requireOrigin) {
      throw new HttpError(403, 'Missing Origin header — this request was rejected as a possible cross-site attempt')
    }
    return // non-browser clients (curl/tests) — auth still required
  }
  let originHost: string | null = null
  let host: string | null = null
  try {
    originHost = new URL(origin).host
    host = req.headers.get('host')
  } catch {
    throw new HttpError(403, 'Invalid request origin')
  }
  if (originHost && host && originHost !== host) {
    throw new HttpError(403, 'Cross-origin request rejected')
  }
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashSessionToken(token) // only the hash is persisted
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000)
  await db.session.create({ data: { token: tokenHash, userId, expiresAt } })
  // opportunistic cleanup of this user's expired sessions
  await db.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } }).catch(() => {})
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // `secure` requires HTTPS — enabled automatically in production
    // (Vercel/Netlify serve HTTPS; local dev stays on http://localhost).
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
  return token
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { token: hashSessionToken(token) } })
  }
  jar.delete(SESSION_COOKIE)
}

export type SafeStudentProfile = {
  admissionNo: string
  yearOfStudy: number
  currentTerm: number
  status: string
  courseId: string
  campusId: string
  course: { id: string; title: string; code: string; category: string } | null
  campus: { id: string; name: string } | null
}

export type SafeLecturerProfile = {
  staffNo: string
  title: string
  department: string
  specialization: string
}

export type SafeUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: Role
  studentProfile: SafeStudentProfile | null
  lecturerProfile: SafeLecturerProfile | null
}

// Conditional Prisma includes make relation fields optional (`| undefined`),
// so this mapper accepts loosely-typed rows and narrows safely.
function toSafeUser(raw: {
  id: string
  email: string
  name: string
  phone: string | null
  role: Role
  studentProfile?:
    | (Omit<SafeStudentProfile, 'course' | 'campus'> & {
        course?: { id: string; title: string; code: string; category: string } | null
        campus?: { id: string; name: string } | null
      })
    | null
  lecturerProfile?: SafeLecturerProfile | null
}): SafeUser {
  const sp = raw.studentProfile
  const lp = raw.lecturerProfile
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    phone: raw.phone,
    role: raw.role,
    studentProfile:
      raw.role === 'STUDENT' && sp
        ? {
            admissionNo: sp.admissionNo,
            yearOfStudy: sp.yearOfStudy,
            currentTerm: sp.currentTerm,
            status: sp.status,
            courseId: sp.courseId,
            campusId: sp.campusId,
            course: sp.course
              ? {
                  id: sp.course.id,
                  title: sp.course.title,
                  code: sp.course.code,
                  category: sp.course.category,
                }
              : null,
            campus: sp.campus ? { id: sp.campus.id, name: sp.campus.name } : null,
          }
        : null,
    lecturerProfile:
      raw.role === 'LECTURER' && lp
        ? {
            staffNo: lp.staffNo,
            title: lp.title,
            department: lp.department,
            specialization: lp.specialization,
          }
        : null,
  }
}

// Role-aware include: students pull course+campus, lecturers pull their profile.
function includeForRole(role: Role): Prisma.UserInclude {
  if (role === 'STUDENT') {
    return { studentProfile: { include: { course: true, campus: true } } }
  }
  if (role === 'LECTURER') {
    return { lecturerProfile: true }
  }
  return {}
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await db.session.findUnique({
    where: { token: hashSessionToken(token) },
    select: { userId: true, expiresAt: true, user: { select: { id: true, role: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null
  const raw = await db.user.findUnique({
    where: { id: session.userId },
    include: includeForRole(session.user.role),
  })
  if (!raw) return null
  return toSafeUser(raw)
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser()
  if (!user) throw new HttpError(401, 'Please sign in to continue')
  return user
}

export async function requireRole(...roles: string[]): Promise<SafeUser> {
  const user = await requireUser()
  if (!roles.includes(user.role)) {
    throw new HttpError(403, `${roles.join(' or ')} access required`)
  }
  return user
}
