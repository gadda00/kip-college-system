'use client'

/**
 * Admin dashboard API response types (Task 5-c) mirroring the Task-4 contract
 * plus the /api/admin/lecturers endpoint added by this task.
 * See worklog.md §Task 4 "API CONTRACT" for the authoritative shapes.
 */

import type {
  Campus,
  CourseDetail,
  CourseUnit,
  EventItem,
  NewsPost,
  PublicCourse,
} from '@/components/kip/lib/types'
import type {
  FeeItemDTO,
  PaymentDTO,
  TimetableEntryDTO,
} from '@/components/kip/portal/types'

// ---------- overview ----------

export type AdminOverview = {
  studentsActive: number
  studentsByCampus: { campusId: string; campus: string; count: number }[]
  studentsByCategory: { category: string; count: number }[]
  applicationsPending: number
  applicationsAccepted: number
  applicationsRejected: number
  totalBilled: number
  collectionsTotal: number
  collectionsThisTerm: number
  outstandingBalance: number
  revenueByMonth: { month: string; total: number }[]
  enrollmentsByCourse: { course: string; count: number }[]
  recentPayments: {
    id: string
    amount: number
    method: string
    reference: string
    paidAt: string
    studentName: string
    admissionNo: string
    course: string
  }[]
}

// ---------- reports & exports (Task 8-c) ----------

/** GET /api/admin/export/stats — live row counts for export cards + audience sizes. */
export type ExportStats = {
  students: number
  payments: number
  applications: number
  results: number
  feesOutstanding: number
  audienceStudents: number
  audienceStaff: number
  audienceAll: number
}

// ---------- students ----------

export type AdminStudentRow = {
  id: string
  userId: string
  name: string
  email: string
  phone: string | null
  admissionNo: string
  course: { id: string; title: string; code: string; category: string }
  campus: { id: string; name: string }
  yearOfStudy: number
  currentTerm: number
  status: string
  balance: number
}

export type AdminStudentDetail = {
  id: string
  userId: string
  admissionNo: string
  courseId: string
  campusId: string
  yearOfStudy: number
  currentTerm: number
  status: string
  kcseGrade: string | null
  gender: string | null
  dob: string | null
  address: string | null
  guardianName: string | null
  guardianPhone: string | null
  admittedAt: string
  user: { id: string; name: string; email: string; phone: string | null; createdAt: string }
  course: {
    id: string
    code: string
    title: string
    category: string
    level: string
    durationMonths: number
  }
  campus: { id: string; name: string; location: string }
  feeItems: FeeItemDTO[]
  payments: PaymentDTO[]
  balance: number
  totalCharged: number
  totalPaid: number
  results: {
    id: string
    unitId: string
    unitName: string
    unitCode: string
    stageLabel: string
    term: string
    marks: number
    grade: string
    remark: string | null
    published: boolean
    examBody: string | null
  }[]
  timetableCount: number
}

// ---------- applications ----------

export type AdminApplication = {
  id: string
  applicantName: string
  email: string
  phone: string
  courseId: string
  campusId: string
  kcseGrade: string
  kcseYear: number
  gender: string | null
  dob: string | null
  guardianName: string | null
  guardianPhone: string | null
  message: string | null
  status: string
  adminNote: string | null
  createdAt: string
  reviewedAt: string | null
  course?: { id: string; code: string; title: string; level?: string; category?: string }
  campus?: { id: string; name: string }
}

/** Response of PATCH accept on an application — the credentials moment. */
export type AcceptApplicationResult = {
  student: {
    name: string
    email: string
    admissionNo: string
    tempPassword: string
    studentId: string
    course: string
    campus: string
  }
  feeItemsPosted: number
  application: AdminApplication
}

// ---------- courses ----------

export type AdminCourse = PublicCourse & {
  requirements: string
  isActive: boolean
  sortOrder: number
  studentsCount: number
}

export type AdminCourseDetail = CourseDetail

export type AdminUnitsByStage = CourseDetail['unitsByStage']

// ---------- fees & payments ----------

export type AdminFeeStatement = {
  student: {
    id: string
    name: string
    email: string
    phone: string | null
    admissionNo: string
    course: { id: string; title: string; code: string }
    campus: { id: string; name: string }
    status: string
    currentTerm: number
  }
  feeItems: FeeItemDTO[]
  payments: PaymentDTO[]
  totalCharged: number
  totalPaid: number
  balance: number
}

export type PostFeeResult = {
  posted: number
  feeItem?: FeeItemDTO
  course?: string
  note?: string
  totalCharged?: number
  totalPaid?: number
  balance?: number
}

export type AdminPaymentRow = PaymentDTO & {
  studentName: string
  admissionNo: string
  course: string
}

export type RecordPaymentResult = AdminPaymentRow & {
  totalCharged: number
  totalPaid: number
  balance: number
}

// ---------- results ----------

export type AdminResultsWorksheet = {
  course: { id: string; code: string; title: string; examBody: string }
  unit: { id: string; code: string; name: string; stage: number; stageLabel: string } | null
  term: string | null
  students: {
    studentId: string
    name: string
    admissionNo: string
    currentTerm: number
    result: {
      id: string
      marks: number
      grade: string
      term: string
      published: boolean
    } | null
  }[]
}

// ---------- timetable ----------

export type AdminTimetableEntry = TimetableEntryDTO

export type AdminLecturer = {
  id: string
  staffNo: string
  name: string
  email: string
  title: string
  department: string
  specialization: string
}

// ---------- announcements / news / events / messages ----------

export type AdminAnnouncement = {
  id: string
  title: string
  body: string
  audience: string
  pinned: boolean
  active: boolean
  authorName: string
  createdAt: string
}

export type AdminNewsPost = NewsPost

export type AdminEvent = EventItem

export type AdminMessage = {
  id: string
  name: string
  email: string | null
  phone: string | null
  subject: string
  message: string
  status: string
  createdAt: string
}

// ---------- shared option sources ----------

export type CampusOption = Campus
export type UnitOption = CourseUnit
