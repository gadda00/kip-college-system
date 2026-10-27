import { getCurrentUser } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser()
    return ok(user) // null when not signed in
  })
}
