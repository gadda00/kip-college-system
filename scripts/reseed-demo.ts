/**
 * KIP COLLEGE — One-off REMOTE demo-content refresh.
 *
 * Re-runs the demo seed against a REMOTE PostgreSQL database (e.g. the
 * Prisma Postgres instance linked to Vercel). Use it after changing
 * prisma/seed-data.ts when the production demo database already has the
 * OLD content (runtime auto-seeding only fills an EMPTY database, and is
 * disabled in production by design — see src/lib/provision.ts).
 *
 * ── Usage ────────────────────────────────────────────────────────────────
 *   DATABASE_URL="postgres://…your-remote-url…" DEMO_MODE=1 \
 *     bun run scripts/reseed-demo.ts
 *
 * Safety:
 *   • Refuses to run unless DEMO_MODE=1 is set (explicit opt-in).
 *   • Refuses to run against SQLite/file: URLs (use `bun run db:seed`
 *     for the local database instead).
 *   • WIPES all existing data in the target database, then reseeds the
 *     full demo dataset in ONE transaction.
 *   • Regenerates the Prisma client for the PostgreSQL schema first
 *     (a machine that develops against SQLite has a SQLite-flavoured
 *     client). If your .env points at SQLite, restore it afterwards
 *     with:  bun run db:generate
 * ──────────────────────────────────────────────────────────────────────────
 */
import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'

async function main() {
  const url = (process.env.DATABASE_URL || '').trim()

  if (process.env.DEMO_MODE !== '1') {
    console.error(
      '✖ Refusing to run without DEMO_MODE=1.\n' +
        '  This script WIPES the target database. Re-run with DEMO_MODE=1 to confirm.',
    )
    process.exit(1)
  }
  if (!url || !/^(postgres(?:ql)?|prisma):\/\//.test(url)) {
    console.error(
      '✖ DATABASE_URL must be a remote PostgreSQL connection string.\n' +
        '  (For the LOCAL SQLite database use `bun run db:seed` instead.)',
    )
    process.exit(1)
  }

  console.log('[reseed-demo] regenerating Prisma client for the PostgreSQL schema…')
  execSync('npx prisma generate --schema prisma/schema.prisma', { stdio: 'inherit' })

  // Seed AFTER the client regeneration above — the import of provision.ts
  // below is hoisted, but seedDatabase only uses the tx client passed in.
  const { seedDatabase } = await import('../src/lib/provision')

  const db = new PrismaClient({
    datasources: { db: { url } },
    log: ['error', 'warn'],
  })

  try {
    console.log('[reseed-demo] wiping existing data (FK-safe order)…')
    await db.result.deleteMany({})
    await db.payment.deleteMany({})
    await db.feeItem.deleteMany({})
    await db.timetableEntry.deleteMany({})
    await db.studyMaterial.deleteMany({})
    await db.application.deleteMany({})
    await db.session.deleteMany({})
    await db.lecturerProfile.deleteMany({})
    await db.studentProfile.deleteMany({})
    await db.user.deleteMany({})
    await db.unit.deleteMany({})
    await db.course.deleteMany({})
    await db.campus.deleteMany({})
    await db.announcement.deleteMany({})
    await db.newsPost.deleteMany({})
    await db.event.deleteMany({})
    await db.galleryItem.deleteMany({})
    await db.contactMessage.deleteMany({})
    await db.testimonial.deleteMany({})
    await db.fAQ.deleteMany({})
    await db.downloadResource.deleteMany({})

    console.log('[reseed-demo] seeding fresh demo dataset…')
    await db.$transaction((tx) => seedDatabase(tx), { timeout: 120_000, maxWait: 60_000 })

    const brian = await db.studentProfile.findFirst({
      where: { user: { email: 'student@kipskitui.com' } },
      select: { id: true },
    })
    if (brian) {
      const charges = await db.feeItem.aggregate({ where: { studentId: brian.id }, _sum: { amount: true } })
      const paid = await db.payment.aggregate({
        where: { studentId: brian.id, status: 'CONFIRMED' },
        _sum: { amount: true },
      })
      console.log(
        `✓ Demo student — charges KES ${(charges._sum.amount ?? 0).toLocaleString()}, ` +
          `paid KES ${(paid._sum.amount ?? 0).toLocaleString()}, ` +
          `balance KES ${((charges._sum.amount ?? 0) - (paid._sum.amount ?? 0)).toLocaleString()}`,
      )
    }
    console.log('✓ Remote demo database reseeded.')
    console.log('\nℹ If your local .env uses SQLite, restore the local client: bun run db:generate')
  } finally {
    await db.$disconnect()
  }
}

main().catch((err) => {
  console.error('✖ Reseed failed:', err)
  process.exit(1)
})
