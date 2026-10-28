/**
 * KIP COLLEGE — Runtime database provisioning (PostgreSQL).
 *
 * On serverless deployments (Vercel + Prisma Postgres) there is no opportunity
 * to run `prisma migrate deploy` against a fresh database, so the app
 * provisions itself on first use:
 *
 *   1. Acquires a transaction-scoped advisory lock (concurrent cold starts
 *      cannot double-provision).
 *   2. Creates the full schema (DDL generated from prisma/schema.prisma via
 *      `prisma migrate diff --from-empty`) if the tables are missing.
 *   3. Seeds the complete KIP College demo dataset if the User table is empty.
 *
 * Everything runs inside ONE transaction, so a crash mid-way rolls back
 * cleanly and the next request simply tries again.
 *
 * Local SQLite development is unaffected — this module only runs for
 * postgres:// / postgresql:// / prisma:// DATABASE_URLs.
 */
import type { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {
  announcements,
  applications,
  campuses,
  categoryImage,
  contactMessages,
  courses,
  downloads,
  events,
  faqs,
  galleryItems,
  gradeFor,
  INTAKES,
  lecturers,
  materials,
  newsPosts,
  remarkFor,
  students,
  testimonials,
  timetables,
} from '../../prisma/seed-data'

type Tx = Prisma.TransactionClient

/** Full DDL for the KIP College schema, verbatim from `prisma migrate diff`. */
const DDL_SCRIPT = `
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LECTURER', 'STUDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "staffNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "LecturerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "facilities" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "examBody" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "intakeMonths" TEXT NOT NULL,
    "tuitionPerTerm" DOUBLE PRECISION NOT NULL,
    "registrationFee" DOUBLE PRECISION NOT NULL,
    "examFee" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "stageLabel" TEXT NOT NULL DEFAULT 'Term 1',
    "weekHours" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "unitId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "campusId" TEXT,
    "lecturerId" TEXT,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "yearOfStudy" INTEGER NOT NULL DEFAULT 1,
    "currentTerm" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "kcseGrade" TEXT,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "address" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeItem" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TUITION',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'MPESA',
    "reference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "note" TEXT,
    "recordedBy" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "remark" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "examBody" TEXT,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "kcseGrade" TEXT NOT NULL,
    "kcseYear" INTEGER NOT NULL,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "authorName" TEXT NOT NULL DEFAULT 'Registrar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'News',
    "author" TEXT NOT NULL DEFAULT 'Communications Office',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyMaterial" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "unitId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NOTES',
    "fileLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Admissions',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Forms',
    "fileLabel" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '#',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LecturerProfile_userId_key" ON "LecturerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LecturerProfile_staffNo_key" ON "LecturerProfile"("staffNo");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_code_key" ON "Campus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Unit_courseId_stage_idx" ON "Unit"("courseId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_courseId_code_key" ON "Unit"("courseId", "code");

-- CreateIndex
CREATE INDEX "TimetableEntry_courseId_idx" ON "TimetableEntry"("courseId");

-- CreateIndex
CREATE INDEX "TimetableEntry_lecturerId_idx" ON "TimetableEntry"("lecturerId");

-- CreateIndex
CREATE INDEX "TimetableEntry_campusId_idx" ON "TimetableEntry"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_admissionNo_key" ON "StudentProfile"("admissionNo");

-- CreateIndex
CREATE INDEX "StudentProfile_courseId_idx" ON "StudentProfile"("courseId");

-- CreateIndex
CREATE INDEX "StudentProfile_campusId_idx" ON "StudentProfile"("campusId");

-- CreateIndex
CREATE INDEX "StudentProfile_status_idx" ON "StudentProfile"("status");

-- CreateIndex
CREATE INDEX "FeeItem_studentId_term_idx" ON "FeeItem"("studentId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Result_unitId_idx" ON "Result"("unitId");

-- CreateIndex
CREATE INDEX "Result_term_idx" ON "Result"("term");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_unitId_key" ON "Result"("studentId", "unitId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_courseId_idx" ON "Application"("courseId");

-- CreateIndex
CREATE INDEX "NewsPost_published_idx" ON "NewsPost"("published");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "StudyMaterial_courseId_idx" ON "StudyMaterial"("courseId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturerProfile" ADD CONSTRAINT "LecturerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "LecturerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeItem" ADD CONSTRAINT "FeeItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`

/**
 * Individual DDL statements, made re-runnable:
 *  - tables/indexes get IF NOT EXISTS
 *  - CREATE TYPE / ALTER TABLE cannot take IF NOT EXISTS — duplicate errors
 *    are ignored at execution time instead (see IGNORABLE_CODES).
 */
const DDL_STATEMENTS = DDL_SCRIPT.split(/;\s*\n/)
  .map((s) => s.replace(/^--.*$/gm, '').trim())
  .filter(Boolean)
  .map((s) =>
    s
      .replace(/^CREATE TABLE /, 'CREATE TABLE IF NOT EXISTS ')
      .replace(/^CREATE UNIQUE INDEX /, 'CREATE UNIQUE INDEX IF NOT EXISTS ')
      .replace(/^CREATE INDEX /, 'CREATE INDEX IF NOT EXISTS '),
  )

/** Postgres error codes safe to ignore when re-running the DDL. */
const IGNORABLE_CODES = new Set([
  '42P07', // duplicate_table
  '42710', // duplicate_object (enum / constraint)
  '42701', // duplicate_column
  '42P16', // invalid_table_definition (already implied)
])

function isIgnorableError(err: unknown): boolean {
  const code = (err as { code?: string }).code
  if (code && IGNORABLE_CODES.has(code)) return true
  const msg = err instanceof Error ? err.message : String(err)
  return /already exists/i.test(msg)
}

/** Deterministic, human-readable ids so relations resolve without round-trips. */
const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_')
const iso = (s: string) => new Date(s)

/**
 * Seed the full KIP College dataset using deterministic ids.
 * Engine-agnostic: works on PostgreSQL (runtime provisioning) and SQLite
 * (local `bun prisma/seed.ts`). Expects a transaction client.
 */
export async function seedDatabase(tx: Tx): Promise<void> {
  // ---- lookup maps (deterministic ids) ----
  const campusIdBy = new Map(campuses.map((c) => [c.code, `campus_${c.code}`]))
  const courseIdBy = new Map(courses.map((c) => [c.code, `course_${c.code}`]))

  const unitRows: Array<{
    id: string
    courseId: string
    code: string
    name: string
    stage: number
    stageLabel: string
    weekHours: number
  }> = []
  const unitIdByKey = new Map<string, string>() // `${courseCode}::${unitName}`
  for (const c of courses) {
    c.units.forEach((stageUnits, sIdx) => {
      stageUnits.forEach((u, uIdx) => {
        const code = `${c.code}-${sIdx + 1}.${uIdx + 1}`
        const id = `unit_${clean(code)}`
        unitRows.push({
          id,
          courseId: courseIdBy.get(c.code) as string,
          code,
          name: u.name,
          stage: sIdx + 1,
          stageLabel: c.stageLabels[sIdx] ?? `Stage ${sIdx + 1}`,
          weekHours: u.weekHours ?? 4,
        })
        unitIdByKey.set(`${c.code}::${u.name}`, id)
      })
    })
  }

  const lecturerProfileIdByEmail = new Map<string, string>()
  for (const l of lecturers) lecturerProfileIdByEmail.set(l.email, `lprofile_${clean(l.staffNo)}`)

  // ---- password hashes (one per distinct password) ----
  const adminHash = bcrypt.hashSync('Admin@123', 10)
  const lecturerHash = bcrypt.hashSync('Lecturer@123', 10)
  const studentHash = bcrypt.hashSync('Student@123', 10)

  // ---- campuses ----
  await tx.campus.createMany({
    data: campuses.map((c) => ({ id: `campus_${c.code}`, ...c })),
  })

  // ---- courses ----
  await tx.course.createMany({
    data: courses.map((c) => ({
      id: `course_${c.code}`,
      code: c.code,
      title: c.title,
      category: c.category,
      level: c.level,
      examBody: c.examBody,
      durationMonths: c.durationMonths,
      intakeMonths: INTAKES,
      tuitionPerTerm: c.tuitionPerTerm,
      registrationFee: c.registrationFee,
      examFee: c.examFee,
      description: c.description,
      requirements: c.requirements,
      image: categoryImage(c.category),
      isActive: true,
      isFeatured: c.isFeatured ?? false,
      sortOrder: c.sortOrder,
    })),
  })

  // ---- units ----
  await tx.unit.createMany({ data: unitRows })

  // ---- users: admin ----
  await tx.user.createMany({
    data: [
      {
        id: 'user_admin',
        email: 'admin@kipskitui.com',
        passwordHash: adminHash,
        name: 'Alice Mwangi',
        phone: '+254 700 112 233',
        role: 'ADMIN',
      },
    ],
  })

  // ---- users: lecturers + profiles ----
  await tx.user.createMany({
    data: lecturers.map((l) => ({
      id: `user_${clean(l.staffNo)}`,
      email: l.email,
      passwordHash: lecturerHash,
      name: l.name,
      phone: l.phone,
      role: 'LECTURER',
    })),
  })
  await tx.lecturerProfile.createMany({
    data: lecturers.map((l) => ({
      id: `lprofile_${clean(l.staffNo)}`,
      userId: `user_${clean(l.staffNo)}`,
      staffNo: l.staffNo,
      title: l.title,
      department: l.department,
      specialization: l.specialization,
      bio: l.bio,
    })),
  })

  // ---- users: students + profiles + fees + payments + results ----
  await tx.user.createMany({
    data: students.map((s) => ({
      id: `user_${clean(s.admissionNo)}`,
      email: s.email,
      passwordHash: studentHash,
      name: s.name,
      phone: s.phone,
      role: 'STUDENT',
    })),
  })
  await tx.studentProfile.createMany({
    data: students.map((s) => ({
      id: `sprofile_${clean(s.admissionNo)}`,
      userId: `user_${clean(s.admissionNo)}`,
      admissionNo: s.admissionNo,
      courseId: courseIdBy.get(s.courseCode) as string,
      campusId: campusIdBy.get(s.campusCode) as string,
      yearOfStudy: s.yearOfStudy,
      currentTerm: s.currentTerm,
      status: s.status ?? 'ACTIVE',
      kcseGrade: s.kcseGrade,
      gender: s.gender,
      dob: s.dob ? iso(s.dob) : null,
      address: s.address,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      admittedAt: iso(s.admittedAt),
    })),
  })
  await tx.feeItem.createMany({
    data: students.flatMap((s) =>
      s.fees.map((f, i) => ({
        id: `fee_${clean(s.admissionNo)}_${i}`,
        studentId: `sprofile_${clean(s.admissionNo)}`,
        term: f.term,
        description: f.description,
        amount: f.amount,
        type: f.type,
        dueDate: f.dueDate ? iso(f.dueDate) : null,
      })),
    ),
  })
  await tx.payment.createMany({
    data: students.flatMap((s) =>
      s.payments.map((p) => ({
        id: `pay_${clean(p.reference)}`,
        studentId: `sprofile_${clean(s.admissionNo)}`,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        paidAt: iso(p.paidAt),
        status: p.status ?? 'CONFIRMED',
        note: p.note,
        recordedBy: p.recordedBy,
      })),
    ),
  })
  await tx.result.createMany({
    data: students.flatMap((s) =>
      s.results.map((r) => {
        const grade = gradeFor(r.marks)
        return {
          id: `res_${clean(s.admissionNo)}_${clean(r.courseCode)}_${clean(r.unitName)}`,
          studentId: `sprofile_${clean(s.admissionNo)}`,
          unitId: unitIdByKey.get(`${r.courseCode}::${r.unitName}`) as string,
          term: r.term,
          marks: r.marks,
          grade,
          remark: remarkFor(grade),
          published: true,
          examBody: r.examBody,
        }
      }),
    ),
  })

  // ---- timetable ----
  await tx.timetableEntry.createMany({
    data: timetables.map((t, i) => ({
      id: `tt_${String(i).padStart(3, '0')}`,
      courseId: courseIdBy.get(t.courseCode) as string,
      unitId: unitIdByKey.get(`${t.courseCode}::${t.unitName}`) ?? null,
      dayOfWeek: t.dayOfWeek,
      startTime: t.startTime,
      endTime: t.endTime,
      room: t.room,
      campusId: campusIdBy.get(t.campusCode) ?? null,
      lecturerId: lecturerProfileIdByEmail.get(t.lecturerEmail) ?? null,
    })),
  })

  // ---- applications ----
  await tx.application.createMany({
    data: applications.map((a, i) => ({
      id: `app_${String(i).padStart(3, '0')}`,
      applicantName: a.applicantName,
      email: a.email,
      phone: a.phone,
      courseId: courseIdBy.get(a.courseCode) as string,
      campusId: campusIdBy.get(a.campusCode) as string,
      kcseGrade: a.kcseGrade,
      kcseYear: a.kcseYear,
      gender: a.gender,
      dob: a.dob ? iso(a.dob) : null,
      guardianName: a.guardianName,
      guardianPhone: a.guardianPhone,
      message: a.message,
      status: a.status ?? 'PENDING',
      adminNote: a.adminNote,
      createdAt: iso(a.createdAt),
      reviewedAt: a.reviewedAt ? iso(a.reviewedAt) : null,
    })),
  })

  // ---- announcements ----
  await tx.announcement.createMany({
    data: announcements.map((a, i) => {
      const { createdAt, ...rest } = a
      return { id: `ann_${i}`, ...rest, createdAt: iso(createdAt) }
    }),
  })

  // ---- news ----
  await tx.newsPost.createMany({
    data: newsPosts.map((n, i) => {
      const { publishedAt, ...rest } = n
      return { id: `news_${i}`, ...rest, publishedAt: iso(publishedAt) }
    }),
  })

  // ---- events ----
  await tx.event.createMany({
    data: events.map((e, i) => {
      const { date, image, ...rest } = e
      return { id: `evt_${i}`, ...rest, date: iso(date), image: image ?? null }
    }),
  })

  // ---- gallery ----
  await tx.galleryItem.createMany({
    data: galleryItems.map((g, i) => ({ id: `gal_${i}`, ...g })),
  })

  // ---- testimonials ----
  await tx.testimonial.createMany({
    data: testimonials.map((t, i) => ({ id: `tst_${i}`, ...t })),
  })

  // ---- contact messages ----
  await tx.contactMessage.createMany({
    data: contactMessages.map((m, i) => {
      const { createdAt, ...rest } = m
      return { id: `msg_${i}`, ...rest, createdAt: iso(createdAt) }
    }),
  })

  // ---- FAQs ----
  await tx.fAQ.createMany({
    data: faqs.map((f, i) => ({ id: `faq_${i}`, question: f.question, answer: f.answer, category: f.category, sortOrder: f.sortOrder })),
  })

  // ---- downloads ----
  await tx.downloadResource.createMany({
    data: downloads.map((d, i) => ({ id: `dnl_${i}`, ...d })),
  })

  // ---- study materials ----
  await tx.studyMaterial.createMany({
    data: materials.map((m, i) => ({
      id: `mat_${i}`,
      courseId: courseIdBy.get(m.courseCode) as string,
      unitId: unitIdByKey.get(`${m.courseCode}::${m.unitName}`) ?? null,
      title: m.title,
      description: m.description,
      type: m.type,
      fileLabel: m.fileLabel,
      createdAt: m.createdAt ? iso(m.createdAt) : undefined,
    })),
  })
}

/**
 * Ensure the PostgreSQL database exists, has the current schema, and holds the
 * KIP College dataset. Safe to call on every request — after the first
 * successful run it short-circuits to two cheap probes inside one transaction.
 */
export async function ensureProvisioned(db: PrismaClient): Promise<void> {
  await db.$transaction(
    async (tx) => {
      // Serialize concurrent cold starts (e.g. several lambdas booting at once).
      await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(4711815)')

      const probe = (await tx.$queryRawUnsafe(
        'SELECT to_regclass(\'public."User"\')::text AS t',
      )) as Array<{ t: string | null }>
      if (probe[0]?.t == null) {
        for (const stmt of DDL_STATEMENTS) {
          try {
            await tx.$executeRawUnsafe(stmt)
          } catch (err) {
            if (!isIgnorableError(err)) throw err
          }
        }
        console.log('[kip-college] schema provisioned (22 tables)')
      }

      const count = (await tx.$queryRawUnsafe(
        'SELECT COUNT(*)::int AS n FROM "User"',
      )) as Array<{ n: number }>
      if ((count[0]?.n ?? 0) === 0) {
        await seedDatabase(tx)
        console.log('[kip-college] demo dataset seeded')
      }
    },
    { timeout: 120_000, maxWait: 60_000 },
  )
}
