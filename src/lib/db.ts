import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Resolve the SQLite database URL for runtime use.
 *
 * Priority:
 *  1. DATABASE_URL as provided (postgres://… or file:…). Relative `file:` paths
 *     are resolved the way the Prisma CLI resolves them (relative to
 *     prisma/schema.prisma) so `file:../db/custom.db` works for CLI + app alike.
 *  2. Zero-config serverless fallback (Vercel / Netlify demo mode): the bundled
 *     seeded database is copied to the function's writable /tmp storage.
 *  3. Local fallback: <project>/db/custom.db (works out of the box after clone).
 */
function resolveDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || ''

  if (!url) {
    const serverless = !!(process.env.VERCEL || process.env.NETLIFY)
    url = serverless
      ? 'file:/tmp/custom.db'
      : 'file:' + path.join(process.cwd(), 'db', 'custom.db')
  }

  if (!url.startsWith('file:')) return url // postgres/mysql/etc — use as-is
  const p = url.slice('file:'.length)
  if (p.startsWith('/')) return url // absolute — use as-is
  const base = p.startsWith('../')
    ? path.join(process.cwd(), 'prisma') // CLI convention: relative to schema dir
    : process.cwd()
  return 'file:' + path.resolve(base, p)
}

/**
 * Serverless demo bootstrap: SQLite needs a writable location, and the lambda
 * filesystem is read-only except /tmp. Copy the bundled seeded database there
 * (once per instance) so the whole platform — demo accounts included — works
 * with zero environment configuration. Production Postgres URLs are untouched.
 */
function bootstrapServerlessSqlite(url: string): void {
  if (!url.startsWith('file:/tmp/')) return
  const dest = url.slice('file:'.length)
  try {
    fs.accessSync(dest)
    return // already bootstrapped on this instance
  } catch {
    // not present yet — copy the bundled seed database below
  }

  const candidates = [
    path.join(process.cwd(), 'db', 'custom.db'),
    'db/custom.db',
    path.join(process.cwd(), '../db/custom.db'),
    path.join(process.cwd(), '../../db/custom.db'),
  ]
  for (const src of candidates) {
    try {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
      console.log(`[kip-college] demo database bootstrapped at ${dest}`)
      return
    } catch {
      // try the next candidate
    }
  }
  console.warn(
    '[kip-college] demo database not found for /tmp bootstrap — set DATABASE_URL to a PostgreSQL URL for production (see DEPLOYMENT.md)',
  )
}

const resolvedUrl = resolveDatabaseUrl()
bootstrapServerlessSqlite(resolvedUrl)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url: resolvedUrl } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
