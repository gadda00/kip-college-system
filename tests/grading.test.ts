import { describe, expect, test } from 'bun:test'
import { gradeFor, gradePoints, timeToMinutes, todayDow, currentTermLabel } from '@/lib/api-helpers'

describe('grading scale — KIP boundaries (A≥80, B 65–79, C 50–64, D 40–49, E<40)', () => {
  test('exact grade boundaries', () => {
    expect(gradeFor(100)).toEqual({ grade: 'A', remark: 'Excellent' })
    expect(gradeFor(80)).toEqual({ grade: 'A', remark: 'Excellent' })
    expect(gradeFor(79.99)).toEqual({ grade: 'B', remark: 'Good' })
    expect(gradeFor(79)).toEqual({ grade: 'B', remark: 'Good' })
    expect(gradeFor(65)).toEqual({ grade: 'B', remark: 'Good' })
    expect(gradeFor(64.99)).toEqual({ grade: 'C', remark: 'Credit' })
    expect(gradeFor(50)).toEqual({ grade: 'C', remark: 'Credit' })
    expect(gradeFor(49.99)).toEqual({ grade: 'D', remark: 'Pass' })
    expect(gradeFor(40)).toEqual({ grade: 'D', remark: 'Pass' })
    expect(gradeFor(39.99)).toEqual({ grade: 'E', remark: 'Fail' })
    expect(gradeFor(0)).toEqual({ grade: 'E', remark: 'Fail' })
  })

  test('GPA point mapping', () => {
    expect(gradePoints('A')).toBe(4)
    expect(gradePoints('B')).toBe(3)
    expect(gradePoints('C')).toBe(2)
    expect(gradePoints('D')).toBe(1)
    expect(gradePoints('E')).toBe(0)
    expect(gradePoints('X')).toBe(0)
  })
})

describe('timetable time parsing', () => {
  test('valid times parse to minutes', () => {
    expect(timeToMinutes('08:00')).toBe(480)
    expect(timeToMinutes('17:30')).toBe(1050)
    expect(timeToMinutes('9:05')).toBe(545)
  })
  test('invalid times return null', () => {
    expect(timeToMinutes('25:00')).toBeNull()
    expect(timeToMinutes('12:60')).toBeNull()
    expect(timeToMinutes('noon')).toBeNull()
    expect(timeToMinutes('')).toBeNull()
  })
})

describe('term + day helpers', () => {
  test('todayDow is ISO 1..7', () => {
    expect(todayDow()).toBeGreaterThanOrEqual(1)
    expect(todayDow()).toBeLessThanOrEqual(7)
  })
  test('currentTermLabel shape is YYYY/YYYY TN', () => {
    expect(currentTermLabel()).toMatch(/^20\d{2}\/20\d{2} T[123]$/)
  })
})
