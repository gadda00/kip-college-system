'use client'

import { useMemo } from 'react'
import { CalendarDays, Clock, MapPin, Printer, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/kip/components/empty-state'
import { WEEKDAYS, fmtTimeSlot, todayDowClient } from '@/components/kip/portal/shared'
import type { TimetableEntryDTO } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

/** Campus colour dots used across timetable grids. */
const CAMPUS_DOT: Record<string, string> = {
  'Main Campus': 'bg-primary',
  'Town Campus': 'bg-amber-500',
  'Mwingi Campus': 'bg-emerald-500',
}

function campusDot(campusName: string | null): string {
  if (!campusName) return 'bg-muted-foreground/60'
  return CAMPUS_DOT[campusName] ?? 'bg-muted-foreground/60'
}

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function sortKey(e: TimetableEntryDTO): number {
  return toMinutes(e.startTime)
}

/**
 * Weekly Mon–Fri timetable card shared by the student and lecturer portals.
 * Desktop: 5-column slot grid; mobile: day tabs with lists. Today is
 * highlighted and a print button is included.
 */
export function WeeklyTimetableCard({ entries }: { entries: TimetableEntryDTO[] }) {
  const today = todayDowClient()
  const defaultDay = today >= 1 && today <= 5 ? today : 1

  // unique time slots sorted by start time
  const slots = useMemo(() => {
    const seen = new Map<string, { start: string; end: string }>()
    for (const e of entries) {
      if (!seen.has(e.startTime)) seen.set(e.startTime, { start: e.startTime, end: e.endTime })
    }
    return [...seen.values()].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  }, [entries])

  const campuses = [...new Set(entries.map((e) => e.campusName).filter(Boolean))] as string[]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
          Weekly schedule
          {today >= 1 && today <= 5 && (
            <Badge className="bg-amber-400/15 text-amber-700 hover:bg-amber-400/15 dark:text-amber-400">
              Today is {WEEKDAYS[today - 1]}
            </Badge>
          )}
        </CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {campuses.length > 0 && (
            <div className="flex flex-wrap items-center gap-4" aria-hidden="true">
              {campuses.map((c) => (
                <span key={c} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn('h-2.5 w-2.5 rounded-full', campusDot(c))} />
                  {c}
                </span>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" className="min-h-9 print:hidden" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
            Printable
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop grid */}
        <div className="hidden overflow-x-auto lg:block">
          <div role="table" aria-label="Weekly class grid" className="min-w-[880px]">
            <div role="row" className="grid grid-cols-[110px_repeat(5,minmax(0,1fr))] gap-2">
              <div role="columnheader" className="pb-2 text-xs font-semibold text-muted-foreground">
                Time
              </div>
              {WEEKDAYS.map((day, i) => {
                const isToday = today === i + 1
                return (
                  <div
                    key={day}
                    role="columnheader"
                    className={cn(
                      'rounded-lg px-2 pb-2 text-center text-xs font-semibold',
                      isToday
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                        : 'text-muted-foreground',
                    )}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
            {slots.map((slot) => {
              const slotEntries = entries.filter((e) => e.startTime === slot.start)
              return (
                <div
                  key={slot.start}
                  role="row"
                  className="mt-2 grid grid-cols-[110px_repeat(5,minmax(0,1fr))] gap-2"
                >
                  <div
                    role="cell"
                    className="flex flex-col items-center justify-center rounded-lg bg-muted/60 px-1 py-2 text-center"
                  >
                    <span className="text-xs font-bold">{fmtTimeSlot(slot.start)}</span>
                    <span className="text-[10px] text-muted-foreground">to {fmtTimeSlot(slot.end)}</span>
                  </div>
                  {WEEKDAYS.map((day, i) => {
                    const dayEntries = slotEntries.filter((e) => e.dayOfWeek === i + 1)
                    const isToday = today === i + 1
                    return (
                      <div key={day} role="cell" className="min-h-16">
                        {dayEntries.length === 0 ? (
                          <div className="h-full min-h-16 rounded-lg border border-dashed/60" />
                        ) : (
                          <ul className="space-y-2">
                            {dayEntries.map((e) => (
                              <li
                                key={e.id}
                                className={cn(
                                  'h-full rounded-lg border border-primary/20 bg-primary/5 p-2.5',
                                  isToday && 'ring-2 ring-primary/40',
                                )}
                              >
                                <p className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                  <span
                                    className={cn('h-2 w-2 shrink-0 rounded-full', campusDot(e.campusName))}
                                    aria-hidden="true"
                                  />
                                  {e.campusName ?? 'Campus TBA'}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug">
                                  {e.unitName ?? 'General session'}
                                </p>
                                <p className="mt-1 font-mono text-[10px] text-primary">{e.unitCode}</p>
                                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3 w-3" aria-hidden="true" />
                                    {e.room}
                                  </span>
                                  {e.lecturerName && (
                                    <span className="inline-flex items-center gap-1">
                                      <UserRound className="h-3 w-3" aria-hidden="true" />
                                      {e.lecturerName}
                                    </span>
                                  )}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile / tablet: day tabs */}
        <Tabs defaultValue={String(defaultDay)} className="lg:hidden">
          <TabsList className="w-full overflow-x-auto custom-scrollbar">
            {WEEKDAYS.map((day, i) => {
              const count = entries.filter((e) => e.dayOfWeek === i + 1).length
              const isToday = today === i + 1
              return (
                <TabsTrigger
                  key={day}
                  value={String(i + 1)}
                  className="min-h-9 flex-1 text-xs"
                  aria-label={`${day}${count > 0 ? `, ${count} classes` : ', no classes'}${
                    isToday ? ' — today' : ''
                  }`}
                >
                  {day.slice(0, 3)}
                  {isToday && (
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {WEEKDAYS.map((day, i) => {
            const dayEntries = entries
              .filter((e) => e.dayOfWeek === i + 1)
              .sort((a, b) => sortKey(a) - sortKey(b))
            return (
              <TabsContent key={day} value={String(i + 1)} className="mt-4">
                {dayEntries.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title={`No classes on ${day}`}
                    hint="Check another day of the week."
                    className="py-10"
                  />
                ) : (
                  <ul className="space-y-3">
                    {dayEntries.map((e) => (
                      <li
                        key={e.id}
                        className={cn(
                          'rounded-xl border p-4',
                          today === i + 1 && 'border-primary/40 ring-1 ring-primary/20',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-snug">
                              {e.unitName ?? 'General session'}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-primary">{e.unitCode}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {fmtTimeSlot(e.startTime)}–{fmtTimeSlot(e.endTime)}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={cn('h-2 w-2 rounded-full', campusDot(e.campusName))}
                              aria-hidden="true"
                            />
                            {e.campusName ?? 'Campus TBA'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            Room {e.room}
                          </span>
                          {e.lecturerName && (
                            <span className="inline-flex items-center gap-1">
                              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                              {e.lecturerName}
                            </span>
                          )}
                          {e.stageLabel && (
                            <Badge variant="outline" className="text-[10px]">
                              {e.stageLabel}
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
