'use client'

/**
 * Shared API response types for the KIP College frontend.
 * Mirrors the Task-4 API contract (see worklog.md §Task 4).
 */

export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT'

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
  /** true while the account still uses its issued temporary password. */
  mustChangePassword: boolean
  studentProfile: SafeStudentProfile | null
  lecturerProfile: SafeLecturerProfile | null
}

// ---------- public ----------

export type PublicOverview = {
  stats: {
    studentsCount: number
    coursesCount: number
    campusesCount: number
    graduatesCount: number
  }
  featuredCourses: PublicCourse[]
  campuses: Campus[]
  news: NewsPost[]
  events: EventItem[]
  testimonials: Testimonial[]
}

export type PublicCourse = {
  id: string
  code: string
  title: string
  category: string
  level: string
  examBody: string
  durationMonths: number
  intakeMonths: string
  intakes: string[]
  tuitionPerTerm: number
  registrationFee: number
  examFee: number
  description: string
  image: string
  isFeatured: boolean
  unitsCount: number
}

export type CourseUnit = {
  id: string
  code: string
  name: string
  stage: number
  stageLabel: string
  weekHours: number
}

export type CourseDetail = PublicCourse & {
  requirements: string
  isActive: boolean
  sortOrder: number
  units: CourseUnit[]
  unitsByStage: { stage: number; stageLabel: string; units: CourseUnit[] }[]
  fees: {
    registrationFee: number
    tuitionPerTerm: number
    examFee: number
    perTermTotal: number
  }
  related: PublicCourse[]
}

export type Campus = {
  id: string
  code: string
  name: string
  location: string
  description: string
  image: string
  phone: string
  email: string
  facilities: string
  facilitiesList: string[]
  sortOrder: number
}

export type NewsPost = {
  id: string
  title: string
  excerpt: string
  body: string
  image: string
  category: string
  author: string
  published: boolean
  publishedAt: string
}

export type EventItem = {
  id: string
  title: string
  description: string
  date: string
  venue: string
  image: string | null
}

export type GalleryItem = {
  id: string
  title: string
  image: string
  caption: string | null
}

export type Testimonial = {
  id: string
  name: string
  role: string
  course: string
  quote: string
  rating: number
}

export type FAQ = {
  id: string
  question: string
  answer: string
  category: string // Admissions | Fees | Courses | Exams | General
  sortOrder: number
  active: boolean
}

export type DownloadResource = {
  id: string
  title: string
  description: string
  category: string // Forms | Fees | Academic | Guides
  fileLabel: string
  fileUrl: string
  sortOrder: number
  published: boolean
  createdAt: string
}

export type Application = {
  id: string
  applicantName: string
  email: string
  phone: string
  courseId: string
  campusId: string
  kcseGrade: string
  kcseYear: number
  status: string
  adminNote?: string | null
  createdAt: string
  course?: { title: string; code: string }
  campus?: { name: string }
  /** present on submission responses */
  reference?: string
  nextSteps?: string[]
}
