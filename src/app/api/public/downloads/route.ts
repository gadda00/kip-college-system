import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Published download resources ordered by sortOrder. */
export async function GET() {
  return handle(async () => {
    const downloads = await db.downloadResource.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    })
    return ok(downloads)
  })
}
