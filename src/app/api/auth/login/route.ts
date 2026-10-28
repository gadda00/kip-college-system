import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, getCurrentUser, HttpError } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { clientIp, rateLimited, RATE_LIMITS } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  return handle(async () => {
    const ip = clientIp(req)
    if (rateLimited(`login:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs)) {
      throw new HttpError(429, 'Too many sign-in attempts — please wait a few minutes and try again')
    }

    const body = loginSchema.parse(await readJson(req))
    const email = body.email.trim().toLowerCase()

    const user = await db.user.findUnique({ where: { email } })
    // constant-shape response: never reveal whether the email exists
    if (!user) throw new HttpError(401, 'Invalid email or password')

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      await logAudit({ actorId: user.id, actorEmail: email, action: 'AUTH_LOGIN_FAILED', ip })
      throw new HttpError(401, 'Invalid email or password')
    }

    await createSession(user.id)
    // getCurrentUser() re-reads the session cookie set above → full SafeUser with profiles
    const safeUser = await getCurrentUser()
    await logAudit({
      actorId: user.id,
      actorEmail: email,
      action: 'AUTH_LOGIN',
      entity: 'user',
      entityId: user.id,
      meta: { role: user.role },
      ip,
    })
    return ok(safeUser)
  })
}
