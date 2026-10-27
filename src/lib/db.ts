import { PrismaClient } from '@prisma/client'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Resolve the SQLite database URL for runtime use.
 *
 * Relative SQLite paths are resolved the same way the Prisma CLI resolves
 * them (relative to prisma/schema.prisma), so a single
 * `DATABASE_URL=file:../db/custom.db` works for both the CLI and the app.
 * Paths that are already absolute (local dev, /tmp serverless demo mode,
 * postgres:// URLs) pass through unchanged.
 */
function resolveDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL
  if (!url) return undefined
  if (!url.startsWith('file:')) return url
  const p = url.slice('file:'.length)
  if (p.startsWith('/')) return url // absolute — use as-is
  const base = p.startsWith('../')
    ? path.join(process.cwd(), 'prisma') // CLI convention: relative to schema dir
    : process.cwd()
  return 'file:' + path.resolve(base, p)
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: resolveDatabaseUrl()
      ? { db: { url: resolveDatabaseUrl()! } }
      : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
