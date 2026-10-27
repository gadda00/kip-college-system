'use client'

/**
 * Portal API response types (student + lecturer) mirroring the Task-4 contract.
 * See worklog.md §Task 4 "API CONTRACT" for the authoritative shapes.
 */

// ---------- shared ----------

export type TimetableEntryDTO = {
  id: string
  courseId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
  unitId: string | null
  unitName: string | null
  unitCode: string | null
  stageLabel: string | null
  courseCode: string
  courseTitle: string
  campusId: string | null
  campusName: string | null
  lecturerId: string | null
  lecturerName: string | null
}

// ---------- student ----------

export type StudentAnnouncement = {
  id: string
  title: string
  body: string
  audience: string
  pinned: boolean
  active: boolean
  authorName: string
  createdAt: string
}

export type StudentDashboard = {
  profile: {
    name: string
    email: string
    admissionNo: string
    course: { id: string; title: string; category: string; level: string }
    campus: { id: string; name: string }
    yearOfStudy: number
    currentTerm: number
    status: string
  }
  units: { id: string; code: string; name: string; stageLabel: string; weekHours: number }[]
  fees: { totalCharged: number; totalPaid: number; balance: number }
  results: {
    unitsDone: number
    average: number
    gpa: number
    gradeCounts: Record<string, number>
  }
  todayClasses: TimetableEntryDTO[]
  nextClasses: TimetableEntryDTO[]
  announcements: StudentAnnouncement[]
}

export type FeeItemDTO = {
  id: string
  studentId: string
  term: string
  description: string
  amount: number
  type: string
  dueDate: string | null
  createdAt: string
}

export type PaymentDTO = {
  id: string
  studentId: string
  amount: number
  method: string
  reference: string
  paidAt: string
  status: string
  note: string | null
  recordedBy: string | null
}

export type FeeStatement = {
  feeItems: FeeItemDTO[]
  payments: PaymentDTO[]
  totalCharged: number
  totalPaid: number
  balance: number
}

export type PayFeeResponse = {
  payment: PaymentDTO
  totalCharged: number
  totalPaid: number
  balance: number
}

export type ResultEntryDTO = {
  id: string
  unitId: string
  unitName: string
  unitCode: string
  term: string
  marks: number
  grade: string
  remark: string | null
  examBody: string | null
}

export type StudentResults = {
  byStage: { stageLabel: string; entries: ResultEntryDTO[] }[]
  overall: { unitsDone: number; average: number; gpa: number }
}

export type StudyMaterialDTO = {
  id: string
  title: string
  description: string
  type: string
  fileLabel: string
  unitId: string | null
  unitName: string | null
  stageLabel: string | null
  createdAt: string
}

/** GET /api/student/profile — full profile (new Task-5-b endpoint). */
export type StudentProfileFull = {
  name: string
  email: string
  phone: string | null
  address: string | null
  admissionNo: string
  gender: string | null
  dob: string | null
  kcseGrade: string | null
  guardianName: string | null
  guardianPhone: string | null
  admittedAt: string
  yearOfStudy: number
  currentTerm: number
  status: string
  course: {
    id: string
    code: string
    title: string
    category: string
    level: string
    examBody: string
    durationMonths: number
  }
  campus: { id: string; name: string; location: string }
}

// ---------- lecturer ----------

export type LecturerOverview = {
  unitsCount: number
  coursesCount: number
  studentsCount: number
  todaySchedule: TimetableEntryDTO[]
}

export type LecturerClass = {
  unitId: string
  unitName: string
  unitCode: string
  courseId: string
  courseTitle: string
  stageLabel: string
  stage: number
  weeklyHours: number
  studentsCount: number
}

export type LecturerClassStudent = {
  id: string
  name: string
  admissionNo: string
  phone: string | null
  email: string
  currentTerm: number
  result: { marks: number; grade: string; term: string; published: boolean } | null
}

/** Task 8-b — class analytics block on GET /api/lecturer/classes/[unitId]. */
export type LecturerClassAnalytics = {
  totalStudents: number
  withResults: number
  average: number | null
  highest: number | null
  lowest: number | null
  /** % of entered results at marks >= 50. */
  passRate: number | null
  gradeCounts: Record<string, number>
}

export type LecturerClassDetail = {
  unit: {
    id: string
    code: string
    name: string
    stage: number
    stageLabel: string
    weekHours: number
    course: { id: string; code: string; title: string; category: string; level: string }
  }
  students: LecturerClassStudent[]
  analytics: LecturerClassAnalytics
}

export type SavedResultsResponse = {
  unit: { id: string; code: string; name: string; stageLabel: string; course: unknown }
  saved: {
    id: string
    studentId: string
    unitId: string
    term: string
    marks: number
    grade: string
    remark: string | null
    published: boolean
    examBody: string | null
    studentName: string | null
    admissionNo: string | null
  }[]
}
