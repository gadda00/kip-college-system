import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireUser, SESSION_COOKIE } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser()
    const body = passwordSchema.parse(await readJson(req))

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new HttpError(404, 'User not found')

    const valid = await bcrypt.compare(body.currentPassword, dbUser.passwordHash)
    if (!valid) throw new HttpError(400, 'Current password is incorrect')

    const passwordHash = await bcrypt.hash(body.newPassword, 10)
    await db.user.update({ where: { id: user.id }, data: { passwordHash } })

    // invalidate every session except the current one
    const jar = await cookies()
    const currentToken = jar.get(SESSION_COOKIE)?.value
    await db.session.deleteMany({
      where: { userId: user.id, ...(currentToken ? { NOT: { token: currentToken } } : {}) },
    })

    return ok({ updated: true })
  })
}
