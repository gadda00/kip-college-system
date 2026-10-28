import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/announcements — active announcements */
export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    return NextResponse.json({ announcements })
  } catch {
    return NextResponse.json({ announcements: [] })
  }
}
