import type { Role } from '@prisma/client'

/**
 * Pure auth response types shared by server (src/lib/auth.ts) and client
 * (src/components/kip/lib/types.ts). This module holds ONLY types — the
 * `Role` import from @prisma/client is type-only, so it is erased at runtime
 * and safe for client bundles.
 */

export type SafeStudentProfile = {
  admissionNo: string
  yearOfStudy: number
  currentTerm: number
  status: string
  courseId: string
  campusId: string
  course: { id: string; title: string; code: string; category: string } | null
  campus: { id: string; name: string } | null
}

export type SafeLecturerProfile = {
  staffNo: string
  title: string
  department: string
  specialization: string
}

export type SafeUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: Role
  /** true while the account still uses its issued temporary password — the
   *  student portal gates every view behind the change-password form. */
  mustChangePassword: boolean
  studentProfile: SafeStudentProfile | null
  lecturerProfile: SafeLecturerProfile | null
}
