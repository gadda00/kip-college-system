import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAdmin, requireAdminOnly, HttpError } from '@/lib/auth'

/** GET /api/admin/staff — staff directory with profiles */
export async function GET() {
  try {
    await requireAdmin()
    const staff = await db.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN'] } },
      orderBy: { createdAt: 'asc' },
      include: { staffProfile: true },
    })
    return NextResponse.json({
      staff: staff.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        profile: s.staffProfile,
      })),
    })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load staff' }, { status: 500 })
  }
}

/** POST /api/admin/staff — add a staff member */
export async function POST(req: NextRequest) {
  try {
    await requireAdminOnly()
    const { name, email, phone, position, department, shift, salary, password } = await req.json()
    if (!name || !email || !position || !password) {
      return NextResponse.json({ error: 'Name, email, position and password are required' }, { status: 400 })
    }
    const normalized = email.toLowerCase().trim()
    const exists = await db.user.findUnique({ where: { email: normalized } })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    const user = await db.user.create({
      data: {
        name,
        email: normalized,
        phone: phone || null,
        passwordHash: bcrypt.hashSync(password, 10),
        role: 'STAFF',
        staffProfile: {
          create: {
            position,
            department: department || 'Sales',
            shift: shift || 'MORNING',
            salary: parseFloat(salary) || null,
          },
        },
      },
      include: { staffProfile: true },
    })
    return NextResponse.json({ staff: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, profile: user.staffProfile } })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 })
  }
}

/** PATCH /api/admin/staff — update staff profile (body: {id, position, department, shift, salary, status}) */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const { id, position, department, shift, salary, status } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const data: any = {}
    if (position) data.position = position
    if (department) data.department = department
    if (shift) data.shift = shift
    if (salary !== undefined) data.salary = parseFloat(salary) || null
    if (status) data.status = status
    await db.staffProfile.upsert({
      where: { userId: id },
      update: data,
      create: { userId: id, position: position || 'Staff', department: department || 'Sales', ...data },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
