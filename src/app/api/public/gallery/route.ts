import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Campus life gallery. */
export async function GET() {
  return handle(async () => {
    const items = await db.galleryItem.findMany()
    return ok(items)
  })
}
