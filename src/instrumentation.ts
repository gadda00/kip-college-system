/**
 * Server bootstrap — runs once per server instance (including serverless
 * cold starts on Vercel / Netlify).
 *
 * Demo-mode SQLite bootstrap: when DATABASE_URL points at the serverless
 * function's writable /tmp storage, copy the bundled seeded database there
 * so the entire platform (pages, portals, demo accounts) works out of the
 * box without a managed database service.
 *
 * Local development and production Postgres deployments are unaffected.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return // skip the Edge variant
  const url = process.env.DATABASE_URL || ''
  if (!url.startsWith('file:/tmp/')) return

  const dest = url.slice('file:'.length)
  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  try {
    await fs.access(dest)
    return // already bootstrapped on this instance
  } catch {
    // not present yet — copy the bundled seed database
  }

  const candidates = [
    path.join(process.cwd(), 'db', 'custom.db'),
    path.join(process.cwd(), 'db', 'custom.db'), // traced copies may land at bundle root
    'db/custom.db',
  ]

  for (const src of candidates) {
    try {
      await fs.copyFile(src, dest)
      return
    } catch {
      // try the next candidate
    }
  }

  console.warn(
    '[kip-college] demo database not found for /tmp bootstrap — set DATABASE_URL to a PostgreSQL URL for production (see DEPLOYMENT.md)',
  )
}
