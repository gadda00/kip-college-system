import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { currentLecturer } from '@/lib/roles'
import { publishResults, upsertResults } from '@/lib/results'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const resultsSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  term: z.string().trim().min(1, 'Term is required'),
  entries: z
    .array(
      z.object({
        studentId: z.string().min(1),
        marks: z.coerce
          .number()
          .min(0, 'Marks must be between 0 and 100')
          .max(100, 'Marks must be between 0 and 100'),
      }),
    )
    .min(1, 'Provide at least one result entry'),
  /** false (default) = save as draft; true = save AND publish immediately */
  publish: z.boolean().optional(),
})

const publishSchema = z.object({
  action: z.literal('publish'),
  unitId: z.string().min(1, 'unitId is required'),
  term: z.string().trim().optional(),
})

async function assertTeaches(unitId: string, lecturerProfileId: string) {
  const teaches = await db.timetableEntry.findFirst({
    where: { unitId, lecturerId: lecturerProfileId },
    select: { id: true },
  })
  if (!teaches) throw new HttpError(403, 'You can only enter results for units you teach')
}

/**
 * Lecturer batch results entry. Draft by default; `publish: true` publishes.
 * Body `{ action: 'publish', unitId, term? }` publishes existing drafts.
 */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req)
    const { user, profile } = await currentLecturer()
    const raw = await readJson(req)

    if (publishSchema.safeParse(raw).success) {
      const body = publishSchema.parse(raw)
      await assertTeaches(body.unitId, profile.id)
      const result = await publishResults(body)
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: 'RESULTS_PUBLISHED',
        entity: 'unit',
        entityId: body.unitId,
        meta: { count: result.publishedCount, term: body.term ?? null, by: 'LECTURER' },
      })
      return ok(result)
    }

    const body = resultsSchema.parse(raw)
    await assertTeaches(body.unitId, profile.id)
    const result = await upsertResults(body)
    if (body.publish) {
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: 'RESULTS_PUBLISHED',
        entity: 'unit',
        entityId: body.unitId,
        meta: { count: result.savedCount, term: body.term, by: 'LECTURER' },
      })
    }
    return ok(result, 201)
  })
}
