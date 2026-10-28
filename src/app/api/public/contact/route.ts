import { z } from 'zod'
import { db } from '@/lib/db'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'
import { clientIp, rateLimited, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required (min 2 characters)'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject is required'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters'),
})

/** Public contact form submission. */
export async function POST(req: Request) {
  return handle(async () => {
    const ip = clientIp(req)
    if (rateLimited(`contact:${ip}`, RATE_LIMITS.contact.limit, RATE_LIMITS.contact.windowMs)) {
      throw new HttpError(429, 'Too many messages sent — please try again later')
    }
    const body = contactSchema.parse(await readJson(req))

    const created = await db.contactMessage.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        subject: body.subject,
        message: body.message,
        status: 'NEW',
      },
    })

    return ok(created, 201)
  })
}
