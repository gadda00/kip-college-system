import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role, schoolName, town } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const normalized = email.toLowerCase().trim()
    const existing = await db.user.findUnique({ where: { email: normalized } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalized,
        passwordHash: bcrypt.hashSync(password, 10),
        phone: phone || null,
        role: role === 'SCHOOL' ? 'SCHOOL' : 'CUSTOMER',
        schoolName: role === 'SCHOOL' ? schoolName || null : null,
        town: town || null,
      },
    })
    await createSession(user.id)
    return NextResponse.json({
      user: {
        id: user.id, email: user.email, name: user.name, phone: user.phone,
        role: user.role, loyaltyPoints: user.loyaltyPoints, schoolName: user.schoolName,
        address: user.address, town: user.town,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
