import { db } from '@/lib/db'
import { handle, ok, csvList } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Public campuses list ordered by sortOrder. */
export async function GET() {
  return handle(async () => {
    const campuses = await db.campus.findMany({ orderBy: { sortOrder: 'asc' } })
    return ok(campuses.map((c) => ({ ...c, facilitiesList: csvList(c.facilities) })))
  })
}
