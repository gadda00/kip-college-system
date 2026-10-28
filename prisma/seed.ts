/**
 * KIP COLLEGE — Local SQLite seed CLI.
 *
 * Re-seeds the local demo database (db/custom.db) with the full dataset.
 * PostgreSQL production never needs this — src/lib/provision.ts provisions
 * and seeds the database automatically on first use.
 *
 * Run: bun prisma/seed.ts   (after `bun run db:push`)
 */
import { PrismaClient } from '@prisma/client'
import { seedDatabase } from '../src/lib/provision'

async function main() {
  console.log('🌱 Seeding KIP COLLEGE database…')

  // wipe (FK-safe order; idempotent re-runs)
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

  await db.$transaction((tx) => seedDatabase(tx), { timeout: 120_000, maxWait: 60_000 })

  // demo fee summary
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
      `✓ Demo student — charges KES ${(charges._sum.amount ?? 0).toLocaleString()}, paid KES ${(paid._sum.amount ?? 0).toLocaleString()}, balance KES ${((charges._sum.amount ?? 0) - (paid._sum.amount ?? 0)).toLocaleString()}`,
    )
  }

  console.log('🌱 Seed complete!')
}

const db = new PrismaClient()

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
