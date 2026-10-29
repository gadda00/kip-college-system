/**
 * Node.js-only demo-database bootstrap (called from src/instrumentation.ts).
 *
 * Kept in its own module — imported dynamically and only for the Node.js
 * runtime — so Edge compilation of the instrumentation entry never pulls in
 * `node:fs` / `node:path`.
 */

/** Copy the bundled seeded SQLite database to the serverless /tmp path. */
export async function bootstrapDemoDatabase(): Promise<void> {
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
    'db/custom.db', // traced copies may land at the bundle root
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
