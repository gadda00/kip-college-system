import type { Prisma } from '@prisma/client'

/** Shared include for timetable entries with unit/course/campus/lecturer context. */
export const timetableInclude = {
  unit: { select: { id: true, code: true, name: true, stage: true, stageLabel: true } },
  course: { select: { id: true, code: true, title: true } },
  campus: { select: { id: true, name: true } },
  lecturer: { select: { id: true, staffNo: true, user: { select: { id: true, name: true } } } },
} satisfies Prisma.TimetableEntryInclude

export type TimetableEntryWithRelations = Prisma.TimetableEntryGetPayload<{
  include: typeof timetableInclude
}>

/** Flatten a timetable entry into the JSON shape consumed by the frontend. */
export function mapTimetableEntry(e: TimetableEntryWithRelations) {
  return {
    id: e.id,
    courseId: e.courseId,
    dayOfWeek: e.dayOfWeek,
    startTime: e.startTime,
    endTime: e.endTime,
    room: e.room,
    unitId: e.unitId,
    unitName: e.unit?.name ?? null,
    unitCode: e.unit?.code ?? null,
    stageLabel: e.unit?.stageLabel ?? null,
    courseCode: e.course.code,
    courseTitle: e.course.title,
    campusId: e.campusId,
    campusName: e.campus?.name ?? null,
    lecturerId: e.lecturerId,
    lecturerName: e.lecturer?.user?.name ?? null,
  }
}
