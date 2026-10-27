import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

async function studentDetail(studentId: string) {
  const profile = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      course: {
        select: { id: true, code: true, title: true, category: true, level: true, durationMonths: true },
      },
      campus: { select: { id: true, name: true, location: true } },
    },
  })
  if (!profile) return null

  const [feeItems, payments, results, timetableCount, summary] = await Promise.all([
    db.feeItem.findMany({ where: { studentId: profile.id }, orderBy: { createdAt: 'desc' } }),
    db.payment.findMany({ where: { studentId: profile.id }, orderBy: { paidAt: 'desc' } }),
    db.result.findMany({
      where: { studentId: profile.id },
      include: {
        unit: { select: { id: true, code: true, name: true, stageLabel: true } },
      },
      orderBy: [{ unit: { stage: 'asc' } }, { unit: { code: 'asc' } }],
    }),
    db.timetableEntry.count({ where: { courseId: profile.courseId } }),
    computeBalance(profile.id),
  ])

  return {
    ...profile,
    feeItems,
    payments,
    balance: summary.balance,
    totalCharged: summary.totalCharged,
    totalPaid: summary.totalPaid,
    results: results.map((r) => ({
      id: r.id,
      unitId: r.unitId,
      unitName: r.unit.name,
      unitCode: r.unit.code,
      stageLabel: r.unit.stageLabel,
      term: r.term,
      marks: r.marks,
      grade: r.grade,
      remark: r.remark,
      published: r.published,
      examBody: r.examBody,
    })),
    timetableCount,
  }
}

/** Full student record: profile, course/campus, fee ledger, payments, results. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const detail = await studentDetail(id)
    if (!detail) throw new HttpError(404, 'Student not found')
    return ok(detail)
  })
}

const updateSchema = z.object({
  name: z.string().trim().min(3).optional(),
  phone: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'GRADUATED', 'SUSPENDED']).optional(),
  courseId: z.string().optional(),
  campusId: z.string().optional(),
  yearOfStudy: z.coerce.number().int().min(1).max(8).optional(),
  currentTerm: z.coerce.number().int().min(1).max(12).optional(),
  admissionNo: z.string().trim().optional(),
  kcseGrade: z.string().trim().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  address: z.string().trim().optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
})

/** Update a student's profile and/or user contact fields. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const body = updateSchema.parse(await readJson(req))

    const existing = await db.studentProfile.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Student not found')

    const userData: Prisma.UserUpdateInput = {}
    if (body.name !== undefined) userData.name = body.name
    if (body.phone !== undefined) userData.phone = body.phone || null

    const profileData: Prisma.StudentProfileUpdateInput = {}
    if (body.status !== undefined) profileData.status = body.status
    if (body.courseId !== undefined) profileData.course = { connect: { id: body.courseId } }
    if (body.campusId !== undefined) profileData.campus = { connect: { id: body.campusId } }
    if (body.yearOfStudy !== undefined) profileData.yearOfStudy = body.yearOfStudy
    if (body.currentTerm !== undefined) profileData.currentTerm = body.currentTerm
    if (body.admissionNo !== undefined) profileData.admissionNo = body.admissionNo
    if (body.kcseGrade !== undefined) profileData.kcseGrade = body.kcseGrade || null
    if (body.gender !== undefined) profileData.gender = body.gender
    if (body.address !== undefined) profileData.address = body.address || null
    if (body.guardianName !== undefined) profileData.guardianName = body.guardianName || null
    if (body.guardianPhone !== undefined) profileData.guardianPhone = body.guardianPhone || null

    const operations: Prisma.PrismaPromise<unknown>[] = []
    if (Object.keys(userData).length > 0) {
      operations.push(db.user.update({ where: { id: existing.userId }, data: userData }))
    }
    if (Object.keys(profileData).length > 0) {
      operations.push(db.studentProfile.update({ where: { id }, data: profileData }))
    }
    if (operations.length > 0) await db.$transaction(operations)

    const detail = await studentDetail(id)
    return ok(detail)
  })
}
