import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { currentLecturer } from '@/lib/roles'
import { upsertResults } from '@/lib/results'

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
})

/** Lecturer batch results entry: auto-grade + publish (upsert per student). */
export async function POST(req: Request) {
  return handle(async () => {
    const { profile } = await currentLecturer()
    const body = resultsSchema.parse(await readJson(req))

    const teaches = await db.timetableEntry.findFirst({
      where: { unitId: body.unitId, lecturerId: profile.id },
      select: { id: true },
    })
    if (!teaches) throw new HttpError(403, 'You can only enter results for units you teach')

    const result = await upsertResults(body)
    return ok(result, 201)
  })
}
