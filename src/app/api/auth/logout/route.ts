import { assertSameOrigin, destroySession } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return handle(async () => {
    // CSRF-lite on logout too (forced-logout cross-site POSTs)
    assertSameOrigin(req, { requireOrigin: true })
    await destroySession()
    return ok({ loggedOut: true })
  })
}
