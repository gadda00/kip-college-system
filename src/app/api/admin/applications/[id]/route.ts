import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { currentTermLabel, handle, ok, nextAdmissionNo, readJson } from '@/lib/api-helpers'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const actionSchema = z.object({
  action: z.enum(['accept', 'reject'], { message: 'action must be accept or reject' }),
  adminNote: z.string().trim().optional(),
})

/** Review an application: accept (enrol student + post fees) or reject. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req)
    const admin = await requireRole('ADMIN')
    const { id } = await params
    const body = actionSchema.parse(await readJson(req))

    const application = await db.application.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, registrationFee: true, tuitionPerTerm: true, examFee: true, examBody: true } },
        campus: { select: { id: true, name: true } },
      },
    })
    if (!application) throw new HttpError(404, 'Application not found')
    if (application.status !== 'PENDING') throw new HttpError(400, 'This application has already been reviewed')

    if (body.action === 'reject') {
      const updated = await db.application.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminNote: body.adminNote || null,
          reviewedAt: new Date(),
        },
        include: {
          course: { select: { id: true, code: true, title: true } },
          campus: { select: { id: true, name: true } },
        },
      })
      await logAudit({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'APPLICATION_REJECTED',
        entity: 'application',
        entityId: id,
        meta: { applicant: application.applicantName, note: body.adminNote ?? null },
      })
      return ok(updated)
    }

    // ---- accept ----
    // Email collisions: an existing STUDENT without a profile is cleaned up;
    // a real student account or staff account blocks the acceptance.
    const existingUser = await db.user.findUnique({
      where: { email: application.email },
      include: { studentProfile: { select: { id: true } } },
    })
    if (existingUser) {
      if (existingUser.studentProfile) {
        throw new HttpError(400, 'A student account with this email already exists')
      }
      if (existingUser.role !== 'STUDENT') {
        throw new HttpError(400, 'A user with this email already exists')
      }
      await db.user.delete({ where: { id: existingUser.id } })
    }

    const tempPassword = `Kip${Math.floor(1000 + Math.random() * 9000)}`
    const passwordHash = await bcrypt.hash(tempPassword, 10)
    const admissionNo = await nextAdmissionNo()
    const term = currentTermLabel()

    const { profile, feeItemsPosted, updatedApplication } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: application.email,
          name: application.applicantName,
          phone: application.phone,
          role: 'STUDENT',
          passwordHash,
        },
      })
      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          admissionNo,
          courseId: application.courseId,
          campusId: application.campusId,
          yearOfStudy: 1,
          currentTerm: 1,
          kcseGrade: application.kcseGrade,
          gender: application.gender,
          guardianName: application.guardianName,
          guardianPhone: application.guardianPhone,
        },
      })
      const feeItems = await tx.feeItem.createMany({
        data: [
          {
            studentId: profile.id,
            term,
            description: 'Registration Fee',
            amount: application.course.registrationFee,
            type: 'REGISTRATION',
          },
          {
            studentId: profile.id,
            term,
            description: `Tuition Fee — ${application.course.title}`,
            amount: application.course.tuitionPerTerm,
            type: 'TUITION',
          },
          {
            studentId: profile.id,
            term,
            description: `${application.course.examBody} Examination Fee`,
            amount: application.course.examFee,
            type: 'EXAM',
          },
        ],
      })
      const updatedApplication = await tx.application.update({
        where: { id: application.id },
        data: {
          status: 'ACCEPTED',
          adminNote: body.adminNote || null,
          reviewedAt: new Date(),
        },
        include: {
          course: { select: { id: true, code: true, title: true } },
          campus: { select: { id: true, name: true } },
        },
      })
      return { profile, feeItemsPosted: feeItems.count, updatedApplication }
    })

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'APPLICATION_ACCEPTED',
      entity: 'application',
      entityId: id,
      meta: {
        applicant: application.applicantName,
        admissionNo,
        course: application.course.title,
        campus: application.campus.name,
        feeItemsPosted,
      },
    })

    return ok({
      student: {
        name: application.applicantName,
        email: application.email,
        admissionNo,
        tempPassword,
        studentId: profile.id,
        course: application.course.title,
        campus: application.campus.name,
      },
      feeItemsPosted,
      application: updatedApplication,
    })
  })
}
