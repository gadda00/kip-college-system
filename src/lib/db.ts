import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { ensureProvisioned } from './provision'

const globalForPrisma = globalThis as unknown as {
  kipBasePrisma: PrismaClient | undefined
}

/**
 * Resolve the database URL for runtime use.
 *
 *  1. DATABASE_URL as provided — `postgres://`, `postgresql://` and
 *     `prisma://` (Prisma Postgres) URLs pass straight through to the
 *     PostgreSQL engine used in production (Vercel).
 *  2. Local fallback: <project>/db/custom.db (works out of the box after
 *     clone). Relative `file:` paths are resolved the way the Prisma CLI
 *     resolves them (relative to prisma/schema.prisma).
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''

  if (url) {
    if (!url.startsWith('file:')) return url // postgres://, postgresql://, prisma:// — as-is
    const p = url.slice('file:'.length)
    if (p.startsWith('/')) return url // absolute — as-is
    const base = p.startsWith('../')
      ? path.join(process.cwd(), 'prisma') // CLI convention: relative to schema dir
      : process.cwd()
    return 'file:' + path.resolve(base, p)
  }

  if (process.env.VERCEL || process.env.NETLIFY) {
    console.error(
      '[kip-college] DATABASE_URL is not set. Add your Prisma Postgres connection string ' +
        '(Vercel → Project → Settings → Environment Variables → DATABASE_URL), then redeploy.',
    )
  }
  return 'file:' + path.join(process.cwd(), 'db', 'custom.db')
}

const resolvedUrl = resolveDatabaseUrl()

/** True when running against PostgreSQL (production / Prisma Postgres). */
export const isPostgres = /^(postgres(?:ql)?|prisma):\/\//.test(resolvedUrl)

const base =
  globalForPrisma.kipBasePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url: resolvedUrl } },
  })
if (process.env.NODE_ENV !== 'production') globalForPrisma.kipBasePrisma = base

/**
 * One-time PostgreSQL provisioning (schema + demo dataset). Called lazily
 * before the first model query on serverless instances. Failures reset the
 * promise so the next request retries instead of caching the error.
 */
let readyPromise: Promise<void> | null = null
export function ensureDbReady(): Promise<void> {
  if (!isPostgres) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = ensureProvisioned(base).catch((err) => {
      readyPromise = null
      throw err
    })
  }
  return readyPromise
}

/**
 * The shared Prisma client. On PostgreSQL every model operation first awaits
 * `ensureDbReady()`, so a brand-new database is schema-provisioned and seeded
 * automatically before the first query — no deploy-time migration step needed.
 */
export const db = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ query, args }) {
        if (isPostgres) await ensureDbReady()
        return query(args)
      },
    },
  },
})
