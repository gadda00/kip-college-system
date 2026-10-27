import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, getCurrentUser, HttpError } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  return handle(async () => {
    const body = loginSchema.parse(await readJson(req))
    const email = body.email.trim().toLowerCase()

    const user = await db.user.findUnique({ where: { email } })
    if (!user) throw new HttpError(401, 'Invalid email or password')

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) throw new HttpError(401, 'Invalid email or password')

    await createSession(user.id)
    // getCurrentUser() re-reads the session cookie set above → full SafeUser with profiles
    const safeUser = await getCurrentUser()
    return ok(safeUser)
  })
}
