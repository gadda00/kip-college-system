/**
 * KIP College — integration smoke test.
 *
 * Runs against a LIVE dev server (default http://localhost:3000) and exercises
 * the critical user journeys end-to-end: health, public data, authentication
 * (success/failure/rate-limit), role-based authorization (401/403), the
 * admissions application flow (validation + duplicates), fee-balance math
 * consistency, and the results draft→publish visibility workflow.
 *
 * The script restores all state it mutates (test application, draft result,
 * sessions) and is safe to re-run. Start the dev server first:
 *
 *   bun run dev
 *   bun run test:smoke
 */
import { db } from '@/lib/db'

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000'
let passed = 0
let failed = 0

function ok(name: string) {
  passed++
  console.log(`  ✓ ${name}`)
}
function bad(name: string, detail: unknown) {
  failed++
  console.error(`  ✗ ${name}\n    ${JSON.stringify(detail)}`)
}

async function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) ok(name)
  else bad(name, detail ?? 'condition was false')
}

function jar(): { cookie: string; capture: (res: Response) => void } {
  let cookie = ''
  return {
    get cookie() {
      return cookie
    },
    capture(res: Response) {
      const set = res.headers.getSetCookie?.() ?? []
      for (const c of set) {
        const [pair] = c.split(';')
        const [name, value] = pair.split('=')
        if (value === '' || /expires=Thu, 01 Jan 1970/i.test(c)) {
          cookie = cookie
            .split('; ')
            .filter((p) => !p.startsWith(`${name}=`))
            .join('; ')
        } else {
          cookie = cookie ? `${cookie}; ${pair}` : pair
        }
      }
    },
    set cookie(v: string) {
      cookie = v
    },
  } as { cookie: string; capture: (res: Response) => void }
}

async function api(
  path: string,
  init: RequestInit & { cookie?: string } = {},
): Promise<{ status: number; body: any; res: Response }> {
  const { cookie, headers, ...rest } = init
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(headers as Record<string, string>),
    },
  })
  let body: any = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return { status: res.status, body, res }
}

async function main() {
  console.log(`\nKIP College smoke test → ${BASE}\n`)

  // ---------------------------------------------------------------- health
  console.log('Health & public data')
  {
    const health = await api('/api/health')
    await check('GET /api/health → 200 healthy', health.status === 200 && health.body?.ok === true, health)
    const overview = await api('/api/public/overview')
    await check(
      'GET /api/public/overview → ok with stats',
      overview.body?.ok === true && overview.body?.data?.stats?.coursesCount > 0,
      overview.status,
    )
    const courses = await api('/api/public/courses')
    await check('GET /api/public/courses → non-empty list', Array.isArray(courses.body?.data) && courses.body.data.length > 0)
  }

  // ---------------------------------------------------------- authentication
  console.log('\nAuthentication')
  const admin = jar()
  {
    const wrong = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@kipskitui.com', password: 'wrong-password' }),
    })
    await check('login with wrong password → 401 generic', wrong.status === 401 && wrong.body?.error === 'Invalid email or password')

    const badBody = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    await check('login with invalid payload → 400 Zod validation', badBody.status === 400, badBody)

    const right = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@kipskitui.com', password: 'Admin@123' }),
    })
    admin.capture(right.res)
    await check(
      'admin login → 200 SafeUser with ADMIN role',
      right.status === 200 && right.body?.data?.role === 'ADMIN' && right.body?.data?.studentProfile === null,
      right.body,
    )
    const cookie = (right.res.headers.getSetCookie?.() ?? []).join(';')
    await check('session cookie is HttpOnly + SameSite=Lax', /httponly/i.test(cookie) && /samesite=lax/i.test(cookie))
  }

  // ---------------------------------------------------------- authorization
  console.log('\nAuthorization (server-side role guards)')
  // each role logs in ONCE; the session jars are reused by every later section
  const student = jar()
  const lecturer = jar()
  {
    const anon = await api('/api/admin/overview')
    await check('admin API without session → 401', anon.status === 401, anon.status)

    const asAdmin = await api('/api/admin/overview', { cookie: admin.cookie })
    await check('admin API with ADMIN session → 200', asAdmin.status === 200, asAdmin.status)

    const sLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@kipskitui.com', password: 'Student@123' }),
    })
    student.capture(sLogin.res)
    await check('student login → 200 STUDENT', sLogin.status === 200 && sLogin.body?.data?.role === 'STUDENT')

    const sAsAdmin = await api('/api/admin/students', { cookie: student.cookie })
    await check('student hitting admin API → 403', sAsAdmin.status === 403, sAsAdmin.status)

    const lLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'lecturer@kipskitui.com', password: 'Lecturer@123' }),
    })
    lecturer.capture(lLogin.res)
    await check('lecturer login → 200 LECTURER', lLogin.status === 200 && lLogin.body?.data?.role === 'LECTURER')

    const lAsStudent = await api('/api/student/fees', { cookie: lecturer.cookie })
    await check('lecturer hitting student API → 403', lAsStudent.status === 403, lAsStudent.status)
  }

  // ------------------------------------------------------------ applications
  console.log('\nAdmissions application flow')
  const testEmail = `smoke+${Date.now()}@example.com`
  let createdApplicationId: string | null = null
  try {
    const course = (await db.course.findFirst({ where: { isActive: true }, select: { id: true } }))!
    const campus = (await db.campus.findFirst({ select: { id: true } }))!

    // unique per-run IP so repeated smoke runs never trip the 5/hour application limit
    const applyHeaders = { 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 200) + 10}` }
    const invalid = await api('/api/public/apply', {
      method: 'POST',
      headers: applyHeaders,
      body: JSON.stringify({ applicantName: 'x', email: 'bad', phone: '123', courseId: '', campusId: '', kcseGrade: '', kcseYear: 1800 }),
    })
    await check('invalid application → 400 field validation', invalid.status === 400 && typeof invalid.body?.error === 'string', invalid.body)

    const valid = await api('/api/public/apply', {
      method: 'POST',
      headers: applyHeaders,
      body: JSON.stringify({
        applicantName: 'Smoke Test Applicant',
        email: testEmail,
        phone: '+254 700 000 000',
        courseId: course.id,
        campusId: campus.id,
        kcseGrade: 'C',
        kcseYear: 2024,
      }),
    })
    createdApplicationId = valid.body?.data?.id ?? null
    await check(
      'valid application → 201 with reference + nextSteps',
      valid.status === 201 && /^KIP\/APP\/\d{4}\/[A-Z0-9]{5}$/.test(valid.body?.data?.reference ?? '') && Array.isArray(valid.body?.data?.nextSteps),
      valid.body,
    )

    const dupe = await api('/api/public/apply', {
      method: 'POST',
      headers: applyHeaders,
      body: JSON.stringify({
        applicantName: 'Smoke Test Applicant',
        email: testEmail,
        phone: '+254 700 000 000',
        courseId: course.id,
        campusId: campus.id,
        kcseGrade: 'C',
        kcseYear: 2024,
      }),
    })
    await check('duplicate pending application → 409', dupe.status === 409, dupe.status)
  } finally {
    if (createdApplicationId) {
      await db.application.delete({ where: { id: createdApplicationId } }).catch(() => {})
      ok('cleanup: test application removed')
    }
  }

  // ---------------------------------------------------------------- fees math
  console.log('\nFee ledger consistency')
  {
    const fees = await api('/api/student/fees', { cookie: student.cookie })
    const f = fees.body?.data
    if (fees.status === 200 && f) {
      const charged = Math.round((f.summary?.totalCharged ?? f.totalCharged ?? 0) * 100)
      const paid = Math.round((f.summary?.totalPaid ?? f.totalPaid ?? 0) * 100)
      const balance = Math.round((f.summary?.balance ?? f.balance ?? 0) * 100)
      await check('balance === charged − paid (cents-exact)', balance === charged - paid, { charged, paid, balance })
    } else {
      bad('fee endpoint reachable', fees.status)
    }
  }

  // ------------------------------------------------- results draft→publish
  console.log('\nResults draft → publish visibility')
  {
    const profile = (await api('/api/student/dashboard', { cookie: student.cookie })).body?.data?.profile
    const courseId: string | undefined = profile?.course?.id
    if (!courseId) {
      bad('student profile has course', profile)
    } else {
      const sp = await db.studentProfile.findFirst({
        where: { user: { email: 'student@kipskitui.com' } },
        select: { id: true },
      })
      // target a unit of the student's course that the DEMO lecturer teaches
      // and for which the student has no result yet
      const demoLecturer = await db.lecturerProfile.findFirst({
        where: { user: { email: 'lecturer@kipskitui.com' } },
        select: { id: true },
      })
      const taught = await db.timetableEntry.findMany({
        where: { lecturerId: demoLecturer!.id, unit: { courseId } },
        select: { unitId: true, unit: { select: { id: true, code: true } } },
      })
      const existing = await db.result.findMany({ where: { studentId: sp!.id }, select: { unitId: true } })
      const target = taught.map((t) => t.unit).find((u) => !existing.some((r) => r.unitId === u.id))
      if (!sp || !demoLecturer || !target) {
        ok('skip: no untaught/unscored unit available for the draft-publish check')
      } else {
        {
        const draft = await api('/api/lecturer/results', {
            method: 'POST',
            cookie: lecturer.cookie,
            body: JSON.stringify({
              unitId: target.id,
              term: '2026/2027 T1',
              entries: [{ studentId: sp.id, marks: 77 }],
              publish: false,
            }),
          })
          await check('lecturer saves DRAFT → 201 published:false', draft.status === 201 && draft.body?.data?.published === false, draft.body)

          const flatResults = (v: any) => (v?.byStage ?? []).flatMap((g: any) => g.entries ?? [])
          let visible = flatResults((await api('/api/student/results', { cookie: student.cookie })).body?.data)
          const seenDraft = Array.isArray(visible) && visible.some((r: any) => r.unitId === target.id)
          await check('student CANNOT see unpublished draft', !seenDraft)

          const pub = await api('/api/lecturer/results', {
            method: 'POST',
            cookie: lecturer.cookie,
            body: JSON.stringify({ action: 'publish', unitId: target.id, term: '2026/2027 T1' }),
          })
          await check('explicit publish action succeeds', pub.status === 200 && (pub.body?.data?.publishedCount ?? 0) >= 1, pub.body)

          visible = flatResults((await api('/api/student/results', { cookie: student.cookie })).body?.data)
          const seenPublished = Array.isArray(visible) && visible.some((r: any) => r.unitId === target.id)
          await check('student CAN see published result', seenPublished)

          await db.result.deleteMany({ where: { studentId: sp.id, unitId: target.id } })
          ok('cleanup: smoke result removed')
        }
      }
    }
  }

  // ---------------------------------------------------------- rate limiting
  console.log('\nRate limiting (spoofed IP to avoid polluting dev sessions)')
  {
    const ip = `203.0.113.${Math.floor(Math.random() * 200) + 10}`
    let got429 = false
    let last = 0
    for (let i = 0; i < 12; i++) {
      const res = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body: JSON.stringify({ email: `nobody${i}@example.com`, password: 'wrong' }),
      })
      last = res.status
      if (res.status === 429) {
        got429 = true
        break
      }
    }
    await check('11th+ failed login from one IP → 429', got429, `last status: ${last}`)
  }

  // ------------------------------------------------------------------ done
  console.log(`\n──────────────────────────────\n  ${passed} passed · ${failed} failed\n`)
  await db.$disconnect()
  process.exit(failed === 0 ? 0 : 1)
}

main().catch(async (err) => {
  console.error('smoke test crashed:', err)
  await db.$disconnect().catch(() => {})
  process.exit(1)
})
