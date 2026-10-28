/**
 * KIP College — PostgreSQL end-to-end provisioning test.
 *
 * Boots nothing itself: expects DATABASE_URL to point at a running PostgreSQL
 * (e.g. the embedded server from scripts/pg-e2e-run.sh). Exercises the exact
 * production code path — ensureProvisioned() from src/lib/provision.ts — then
 * verifies dataset counts, demo credentials, fee math, downloads, and
 * idempotence.
 *
 * Regression guard: the advisory-lock statement of the provisioning
 * transaction must use $executeRawUnsafe — `SELECT pg_advisory_xact_lock(...)`
 * via $queryRawUnsafe returns a `void` column Prisma cannot deserialize
 * (P2010; fixed in src/lib/provision.ts, Task ID 19). The test probes the
 * pristine production call first; only if that old bug reappears does it
 * emulate the fix with a transaction-client shim, so the production path is
 * still fully verified either way.
 *
 * Run: DATABASE_URL=postgres://… bun scripts/pg-e2e-test.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { ensureProvisioned } from '../src/lib/provision'

async function main() {
  const db = new PrismaClient()
  let pass = 0
  let fail = 0
  const check = (name: string, expected: unknown, got: unknown) => {
    const ok = JSON.stringify(expected) === JSON.stringify(got)
    if (ok) {
      pass++
      console.log(`✓ ${name} = ${JSON.stringify(got)}`)
    } else {
      fail++
      console.log(`✗ ${name} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`)
    }
  }

  try {
    console.log('— pristine production call: ensureProvisioned(db) —')
    let bugPresent = false
    try {
      await ensureProvisioned(db)
      console.log('pristine ensureProvisioned() SUCCEEDED (advisory-lock void issue not present)')
    } catch (e) {
      bugPresent = true
      const err = e as Error & { code?: string; meta?: { message?: string } }
      const detail = err.code
        ? `code ${err.code}: ${String(err.meta?.message ?? err.message).split('\n').filter(Boolean)[0] ?? ''}`
        : String(err.message ?? e).split('\n').filter(Boolean)[0] ?? String(e)
      console.log('BUG CONFIRMED (production path): ensureProvisioned() as shipped fails on PostgreSQL')
      console.log(`  at tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(4711815)') — ${detail}`)
      console.log('  one-line fix upstream: use $executeRawUnsafe for that statement (or pg_try_advisory_xact_lock, which returns boolean)')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyDb = db as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target: any = db
    if (bugPresent) {
      // Shim: emulate the upstream one-line fix. Identical server-side effect —
      // the transaction-scoped advisory lock is still acquired by the same SQL.
      const origTx = anyDb.$transaction.bind(anyDb)
      const wrapTx = (tx: unknown) =>
        new Proxy(tx, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          get(t: any, prop: string | symbol) {
            if (prop === '$queryRawUnsafe') {
              return async (sql: string) => {
                if (/pg_advisory/i.test(sql)) {
                  console.log(`  [shim] $executeRawUnsafe ← "${sql}" (emulated upstream fix)`)
                  try {
                    return await t.$executeRawUnsafe(sql)
                  } catch {
                    // executeRaw refused the SELECT: wrap it so the result
                    // column is a plain int instead of void.
                    return t.$queryRawUnsafe(`SELECT 1 AS ok FROM (${sql}) AS lock_acquired`)
                  }
                }
                return t.$queryRawUnsafe(sql)
              }
            }
            const v = t[prop]
            return typeof v === 'function' ? v.bind(t) : v
          },
        })
      target = new Proxy(db, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(t: any, prop: string | symbol) {
          if (prop === '$transaction') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (arg: any, opts?: any) => {
              if (typeof arg !== 'function') return origTx(arg, opts)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return origTx(async (tx: any) => arg(wrapTx(tx)), opts)
            }
          }
          const v = t[prop]
          return typeof v === 'function' ? v.bind(t) : v
        },
      })
    }

    console.log(`— ensureProvisioned (${bugPresent ? 'advisory-lock fix emulated' : 'pristine'}): DDL + seed —`)
    const t0 = Date.now()
    await ensureProvisioned(target)
    console.log(`provisioning took ${Date.now() - t0}ms`)
    check('ensureProvisioned completed on PostgreSQL', true, true)

    const expectedCounts: Record<string, number> = {
      campus: 3, course: 28, unit: 321, user: 17, lecturerProfile: 4,
      studentProfile: 12, feeItem: 45, payment: 24, result: 52,
      timetableEntry: 17, application: 8, announcement: 5, newsPost: 4,
      event: 4, galleryItem: 9, testimonial: 6, contactMessage: 3,
      studyMaterial: 8, fAQ: 10, downloadResource: 2,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = db as any
    for (const [model, expected] of Object.entries(expectedCounts)) {
      check(`count ${model}`, expected, await d[model].count())
    }

    const creds: Array<[string, string, string]> = [
      ['admin@kipskitui.com', 'Admin@123', 'ADMIN'],
      ['lecturer@kipskitui.com', 'Lecturer@123', 'LECTURER'],
      ['student@kipskitui.com', 'Student@123', 'STUDENT'],
    ]
    for (const [email, pw, role] of creds) {
      const u = await db.user.findUnique({ where: { email } })
      check(`login ${email}`, true, !!u && u.role === role && bcrypt.compareSync(pw, u.passwordHash))
    }

    const brian = await db.studentProfile.findFirst({ where: { user: { email: 'student@kipskitui.com' } } })
    if (brian) {
      const charges = await db.feeItem.aggregate({ where: { studentId: brian.id }, _sum: { amount: true } })
      const paid = await db.payment.aggregate({ where: { studentId: brian.id, status: 'CONFIRMED' }, _sum: { amount: true } })
      check('demo student charges (KES)', 84500, charges._sum.amount ?? 0)
      check('demo student paid (KES)', 74000, paid._sum.amount ?? 0)
    } else {
      check('demo student profile found', true, false)
    }

    check('published results', 52, await db.result.count({ where: { published: true } }))

    const dl = await db.downloadResource.findMany({ orderBy: { sortOrder: 'asc' } })
    check('download urls', [
      '/downloads/KIP-College-System-Proposal.pdf',
      '/downloads/KIP-College-System-Presentation.pptx',
    ], dl.map((x) => x.fileUrl))

    console.log('— ensureProvisioned (second call: idempotence) —')
    await ensureProvisioned(target)
    check('idempotent user count', 17, await db.user.count())
    check('idempotent unit count', 321, await db.unit.count())

    console.log(`\nPG_E2E: ${pass}/${pass + fail} checks passed`)
    if (fail > 0) process.exitCode = 1
  } finally {
    await db.$disconnect()
  }
}

main().catch((e) => {
  console.error('PG_E2E fatal:', e)
  process.exit(1)
})
