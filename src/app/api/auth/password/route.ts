import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, hashSessionToken, HttpError, requireUser, SESSION_COOKIE } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { clientIp, rateLimited, RATE_LIMITS } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/[0-9]/, 'Password must include a number'),
})

export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const user = await requireUser()
    const ip = clientIp(req)
    if (rateLimited(`password:${user.id}`, RATE_LIMITS.password.limit, RATE_LIMITS.password.windowMs)) {
      throw new HttpError(429, 'Too many password changes — please try again later')
    }

    const body = passwordSchema.parse(await readJson(req))

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new HttpError(404, 'User not found')

    const valid = await bcrypt.compare(body.currentPassword, dbUser.passwordHash)
    if (!valid) throw new HttpError(400, 'Current password is incorrect')

    const passwordHash = await bcrypt.hash(body.newPassword, 10)
    await db.user.update({ where: { id: user.id }, data: { passwordHash } })

    // invalidate every session except the current one (compare hashed tokens —
    // the Session table only ever stores sha256 of the raw cookie value)
    const jar = await cookies()
    const currentToken = jar.get(SESSION_COOKIE)?.value
    await db.session.deleteMany({
      where: {
        userId: user.id,
        ...(currentToken ? { NOT: { token: hashSessionToken(currentToken) } } : {}),
      },
    })

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'AUTH_PASSWORD_CHANGED',
      entity: 'user',
      entityId: user.id,
      ip,
    })

    return ok({ updated: true })
  })
}
