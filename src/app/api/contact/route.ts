import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** POST /api/contact — contact form */
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()
    if (!name || !subject || !message) {
      return NextResponse.json({ error: 'Name, subject and message are required' }, { status: 400 })
    }
    await db.contactMessage.create({
      data: { name, email: email || null, phone: phone || null, subject, message },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
