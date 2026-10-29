/**
 * KIP COLLEGE — Seed DATA (pure, side-effect-free)
 *
 * Realistic Kenyan tertiary college data: 3 campuses, 28 courses with full
 * unit curricula, staff, students (with fees/payments/results/timetables),
 * applications, announcements, news, events, gallery, testimonials,
 * contact messages and study materials.
 *
 * Consumed by src/lib/provision.ts (runtime auto-provisioning on PostgreSQL)
 * and by prisma/seed.ts (local SQLite CLI reseeding). No imports, no side
 * effects — deterministic and tree-shakeable.
 */

// ---------- helpers ----------
export const gradeFor = (marks: number): string =>
  marks >= 80 ? 'A' : marks >= 65 ? 'B' : marks >= 50 ? 'C' : marks >= 40 ? 'D' : 'E'

export const remarkFor = (grade: string): string =>
  grade === 'A' ? 'Distinction' : grade === 'B' ? 'Credit' : grade === 'E' ? 'Fail' : 'Pass'

export const iso = (s: string): Date => new Date(s)

// ============================================================
// CAMPUSES
// ============================================================
export type CampusSeed = {
  code: string
  name: string
  location: string
  description: string
  image: string
  phone: string
  email: string
  facilities: string
  sortOrder: number
}

export const campuses: CampusSeed[] = [
  {
    code: 'MAIN',
    name: 'Main Campus',
    location: '100m from Wikililye, Mulango Road, Kitui',
    description:
      "KIP College's flagship campus on Mulango Road, 100 metres from Wikililye centre and minutes from Kitui Town. It specialises in full-time technical training — engineering workshops, ICT laboratories, the training kitchen and the Learning Resource Centre — and is the only campus with student hostels. Open Monday–Friday 8.00 am–5.00 pm and Saturday 8.00 am–1.00 pm.",
    image: '/images/campus-main.webp',
    phone: '0703 710 879',
    email: 'main@kipskitui.com',
    facilities:
      'Modern ICT Labs,Engineering Workshops,Library,Hostels,Sports Ground,Student Centre',
    sortOrder: 1,
  },
  {
    code: 'TOWN',
    name: 'Town Campus',
    location: 'Muli Mall Building, Kitui CBD',
    description:
      'Located at the Muli Mall building in the heart of Kitui CBD, Town Campus specialises in KASNEB professional studies (CPA, ATD, CAMS, CS, CIFA) and business programmes, with morning, evening (5.30–8.30 pm) and Saturday classes built around students who work in town. Open Monday–Friday 8.00 am–8.30 pm and Saturday 8.00 am–4.00 pm.',
    image: '/images/campus-town.webp',
    phone: '0703 710 879',
    email: 'town@kipskitui.com',
    facilities: 'Computer Labs,Study Rooms,Library Section,Student Lounge,Cafeteria',
    sortOrder: 2,
  },
  {
    code: 'MWINGI',
    name: 'Mwingi Campus',
    location: 'Sunrise Building, Mwingi Town',
    description:
      'Our Mwingi Campus at the Sunrise Building brings tertiary training closer to home for Mwingi town and the greater Mwingi region — business and ICT certificates and diplomas, KASNEB evening classes, and the hairdressing, beauty and catering studios, so learners from Mwingi North and Central need not travel to Kitui daily. Open Monday–Friday 8.00 am–5.00 pm and Saturday 8.00 am–1.00 pm.',
    image: '/images/campus-mwingi.webp',
    phone: '0703 710 879',
    email: 'mwingi@kipskitui.com',
    facilities: 'Computer Lab,Business Classrooms,Beauty & Hairdressing Studio,Library Corner',
    sortOrder: 3,
  },
]

// ============================================================
// COURSES + UNITS (28 courses, real Kenyan curricula)
// ============================================================
export type UnitSeed = { name: string; weekHours?: number }
export type CourseSeed = {
  code: string
  title: string
  category: 'KASNEB' | 'BUSINESS' | 'TECHNICAL'
  level: string
  examBody: string
  durationMonths: number
  tuitionPerTerm: number
  registrationFee: number
  examFee: number
  description: string
  requirements: string
  isFeatured?: boolean
  sortOrder: number
  stageLabels: string[]
  units: UnitSeed[][]
}

export const INTAKES = 'January,May,September'
export const categoryImage = (c: string) =>
  c === 'KASNEB' ? '/images/cat-kasneb.webp' : c === 'BUSINESS' ? '/images/cat-business.webp' : '/images/cat-technical.webp'

export const courses: CourseSeed[] = [
  // ---------------- KASNEB (5) ----------------
  {
    code: 'CPA',
    title: 'Certified Public Accountant (CPA)',
    category: 'KASNEB',
    level: 'Professional',
    examBody: 'KASNEB',
    durationMonths: 24,
    tuitionPerTerm: 15000,
    registrationFee: 3000,
    examFee: 6600,
    description:
      'Graduates qualify as accountants, auditors, tax practitioners and finance officers, eligible for ICPAK membership — and for the jobs that demand it in practice firms, banks, SACCOs, county treasuries and NGOs. You sit the KASNEB CPA examinations at Levels I, II and III in the May and November/December sittings until you earn the full certificate. Classes run in the evening (5.30–8.30 pm) and on Saturdays at Town Campus so you can keep working, and every candidate sits weekly mock papers and past-paper revision with our CPA (K) lecturers before each sitting.',
    requirements:
      'KCSE mean grade C+ (or equivalent) with C+ in Mathematics and English/Kiswahili; OR two A-Level principal passes; OR KASNEB CAMS certificate (bridging route); OR a relevant university degree. Duration: 24–36 months across three levels, examined by KASNEB every May and November/December.',
    isFeatured: true,
    sortOrder: 1,
    stageLabels: ['Level I', 'Level II', 'Level III'],
    units: [
      [
        { name: 'Fundamentals of Business Law', weekHours: 4 },
        { name: 'Financial Accounting', weekHours: 6 },
        { name: 'Entrepreneurship & Communication Skills', weekHours: 4 },
        { name: 'Economics', weekHours: 4 },
        { name: 'Quantitative Analysis', weekHours: 5 },
        { name: 'Fundamentals of Finance', weekHours: 4 },
      ],
      [
        { name: 'Financial Reporting', weekHours: 6 },
        { name: 'Commercial Law', weekHours: 4 },
        { name: 'Corporate Finance', weekHours: 5 },
        { name: 'Management Accounting', weekHours: 5 },
        { name: 'Public Finance & Taxation', weekHours: 4 },
        { name: 'Audit & Assurance', weekHours: 5 },
      ],
      [
        { name: 'Advanced Financial Reporting', weekHours: 6 },
        { name: 'Advanced Audit & Assurance', weekHours: 5 },
        { name: 'Advanced Taxation', weekHours: 4 },
        { name: 'Advanced Management Accounting', weekHours: 5 },
        { name: 'Corporate Governance & Ethics', weekHours: 4 },
        { name: 'Advanced Financial Management', weekHours: 4 },
      ],
    ],
  },
  {
    code: 'CAMS',
    title: 'Certificate in Accounting and Management Skills (CAMS)',
    category: 'KASNEB',
    level: 'Certificate',
    examBody: 'KASNEB',
    durationMonths: 12,
    tuitionPerTerm: 9000,
    registrationFee: 3000,
    examFee: 5500,
    description:
      'CAMS gets you office-ready as an accounts assistant, bookkeeper or office administrator — able to keep a full set of books, handle payroll records and draft basic business correspondence. You earn the KASNEB Certificate in Accounting and Management Skills over two examined levels (May and November/December sittings), and it is the recognised bridging route into CPA for learners below the direct C+ entry grade. Day classes run at Town and Mwingi campuses with an evening track for working students, at KES 9,000 tuition per term.',
    requirements:
      'KCSE mean grade D+ (or equivalent). CAMS also serves as the bridging qualification for learners who wish to pursue CPA but do not meet the direct entry requirements.',
    isFeatured: true,
    sortOrder: 2,
    stageLabels: ['Level I', 'Level II'],
    units: [
      [
        { name: 'Fundamentals of Accounting', weekHours: 6 },
        { name: 'Fundamentals of Business Mathematics', weekHours: 5 },
        { name: 'Fundamentals of Business Law', weekHours: 4 },
        { name: 'Entrepreneurship & Communication Skills', weekHours: 4 },
      ],
      [
        { name: 'Fundamentals of Finance', weekHours: 5 },
        { name: 'Fundamentals of Management Accounting', weekHours: 4 },
        { name: 'Fundamentals of Marketing', weekHours: 4 },
        { name: 'Fundamentals of Purchasing & Supply', weekHours: 4 },
      ],
    ],
  },
  {
    code: 'CS',
    title: 'Certified Secretaries (CS)',
    category: 'KASNEB',
    level: 'Professional',
    examBody: 'KASNEB',
    durationMonths: 36,
    tuitionPerTerm: 14000,
    registrationFee: 3000,
    examFee: 6600,
    description:
      'Graduates advise boards and keep organisations compliant as company secretaries, governance officers and registry administrators — roles every registered company, SACCO and county corporation in Kenya is required by law to fill. You earn the KASNEB Certified Secretaries qualification across three examined levels, with sittings every May and November/December. Because most CS students study alongside work, the programme runs in evening and Saturday classes at Town Campus, with governance case studies marked to KASNEB standards throughout.',
    requirements:
      'KCSE mean grade C+ (or equivalent) with C+ in Mathematics and English/Kiswahili; OR KASNEB CAMS/CPA Level I; OR a relevant degree or diploma. Duration: 36 months across three levels.',
    sortOrder: 3,
    stageLabels: ['Level I', 'Level II', 'Level III'],
    units: [
      [
        { name: 'Financial Accounting', weekHours: 5 },
        { name: 'Business Communication', weekHours: 4 },
        { name: 'Business Law', weekHours: 4 },
        { name: 'Economics', weekHours: 4 },
      ],
      [
        { name: 'Company Law', weekHours: 5 },
        { name: 'Taxation', weekHours: 4 },
        { name: 'Management Accounting', weekHours: 5 },
        { name: 'Office Administration & Secretarial Practice', weekHours: 4 },
      ],
      [
        { name: 'Corporate Governance', weekHours: 5 },
        { name: 'Corporate Secretarial Practice', weekHours: 5 },
        { name: 'Insolvency & Restructuring', weekHours: 4 },
        { name: 'Corporate Finance', weekHours: 4 },
      ],
    ],
  },
  {
    code: 'CIFA',
    title: 'Certified Investment and Financial Analysts (CIFA)',
    category: 'KASNEB',
    level: 'Professional',
    examBody: 'KASNEB',
    durationMonths: 36,
    tuitionPerTerm: 15000,
    registrationFee: 3000,
    examFee: 6600,
    description:
      'CIFA prepares you for analyst and treasury roles in banks, stockbrokers, SACCOs, insurers and asset managers — valuing portfolios, drafting investment reports and pricing risk. You earn the KASNEB Certified Investment and Financial Analysts qualification across three examined levels (May and November/December sittings), with exemptions available for CPA holders. Teaching leans on live Nairobi Securities Exchange data and spreadsheet modelling labs, so you graduate with a portfolio of worked valuations rather than notes alone.',
    requirements:
      'KCSE mean grade C+ (or equivalent) with C+ in Mathematics and English/Kiswahili; OR KASNEB CAMS certificate; OR a relevant degree. Duration: 36 months across three levels.',
    sortOrder: 4,
    stageLabels: ['Level I', 'Level II', 'Level III'],
    units: [
      [
        { name: 'Financial Accounting', weekHours: 5 },
        { name: 'Economics', weekHours: 4 },
        { name: 'Quantitative Analysis', weekHours: 5 },
        { name: 'Fundamentals of Finance', weekHours: 4 },
        { name: 'Fundamentals of Business Law', weekHours: 4 },
        { name: 'Entrepreneurship & Communication Skills', weekHours: 3 },
      ],
      [
        { name: 'Financial Reporting', weekHours: 5 },
        { name: 'Commercial Law', weekHours: 4 },
        { name: 'Corporate Finance', weekHours: 5 },
        { name: 'Investment Analysis', weekHours: 5 },
        { name: 'Portfolio Management', weekHours: 4 },
        { name: 'Management Accounting', weekHours: 4 },
      ],
      [
        { name: 'Advanced Corporate Finance', weekHours: 5 },
        { name: 'Advanced Portfolio Management', weekHours: 5 },
        { name: 'Fixed Income Securities', weekHours: 4 },
        { name: 'Derivatives & Risk Management', weekHours: 4 },
        { name: 'Financial Modelling & Data Analysis', weekHours: 4 },
        { name: 'Alternative Investments', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DICT',
    title: 'Diploma in Information Communication Technology (DICT)',
    category: 'KASNEB',
    level: 'Diploma',
    examBody: 'KASNEB',
    durationMonths: 24,
    tuitionPerTerm: 12000,
    registrationFee: 3000,
    examFee: 5500,
    description:
      'Graduates come out able to code, build and query databases, configure computer networks and support business systems — ready for ICT support, systems administration and developer-trainee roles, or progression into related degrees with exemptions. You earn the KASNEB Diploma in ICT after two examined levels, sat in the May and November/December sittings. Weekly programming and networking practicals run in the computer labs at Town and Mwingi, and an evening track is available for working students.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 24 months over two levels, examined by KASNEB.',
    sortOrder: 5,
    stageLabels: ['Level I', 'Level II'],
    units: [
      [
        { name: 'Fundamentals of ICT', weekHours: 5 },
        { name: 'Computer Applications & the Internet', weekHours: 4 },
        { name: 'Business Communication Skills', weekHours: 3 },
        { name: 'Fundamentals of Business Mathematics', weekHours: 4 },
      ],
      [
        { name: 'Structured Programming', weekHours: 6 },
        { name: 'Database Design & Development', weekHours: 5 },
        { name: 'Data Communication & Computer Networks', weekHours: 5 },
        { name: 'Systems Analysis & Design', weekHours: 4 },
      ],
    ],
  },

  // ---------------- BUSINESS (7) ----------------
  {
    code: 'DIP-BM',
    title: 'Diploma in Business Management',
    category: 'BUSINESS',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 12000,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'This diploma prepares you for supervisory and management roles in private firms, SACCOs, NGOs and county offices — planning work, managing people, keeping proper books and marketing what you sell. You earn the KNEC Diploma in Business Management after three examined modules, a qualification that also earns university degree exemptions. A three-month industrial attachment in a real Kitui organisation is arranged in Module II/III, and the programme runs in day, evening and weekend modes.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 36 months (three KNEC modules). Graduates may progress to degree programmes with exemptions.',
    isFeatured: true,
    sortOrder: 6,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Business Mathematics', weekHours: 5 },
        { name: 'Business Communication I', weekHours: 4 },
        { name: 'Entrepreneurship Education', weekHours: 3 },
        { name: 'Life Skills & Citizenship Education', weekHours: 2 },
      ],
      [
        { name: 'Financial Accounting', weekHours: 5 },
        { name: 'Business Law', weekHours: 4 },
        { name: 'Human Resource Management', weekHours: 4 },
        { name: 'Commerce & Office Practice', weekHours: 3 },
      ],
      [
        { name: 'Business Finance', weekHours: 4 },
        { name: 'Marketing Management', weekHours: 4 },
        { name: 'Office Administration & Management', weekHours: 4 },
        { name: 'Company Law & Practice', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DIP-HRM',
    title: 'Diploma in Human Resource Management',
    category: 'BUSINESS',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 12000,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'Graduates recruit, onboard and manage staff as HR assistants and personnel officers in firms, SACCOs, schools and county departments — with labour law and industrial relations at the core, which is exactly what employers test at HR interviews. You earn the KNEC Diploma in Human Resource Management after three examined modules. The college arranges your attachment in an HR or personnel department around Kitui, and lecturers review your logbook every month while you are out on placement.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 36 months (three KNEC modules).',
    sortOrder: 7,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Business Communication', weekHours: 4 },
        { name: 'Business Mathematics', weekHours: 4 },
        { name: 'Entrepreneurship Education', weekHours: 3 },
        { name: 'Information Communication Technology', weekHours: 3 },
      ],
      [
        { name: 'Human & Public Relations', weekHours: 4 },
        { name: 'Labour Law', weekHours: 4 },
        { name: 'Accounting & Budgeting', weekHours: 4 },
        { name: 'Fundamentals of Psychology & Sociology', weekHours: 3 },
      ],
      [
        { name: 'Advanced Human Resource Management', weekHours: 5 },
        { name: 'Industrial Relations', weekHours: 4 },
        { name: 'Compensation & Reward Management', weekHours: 4 },
        { name: 'Organisational Behaviour', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DIP-SCM',
    title: 'Diploma in Supply Chain Management',
    category: 'BUSINESS',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 12000,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'Graduates run stores, procurement and distribution as supplies officers, storekeepers and procurement assistants — positions every government office, school, NGO and manufacturer must fill. You earn the KNEC Diploma in Supply Chain Management after three examined modules, ending in an assessed industrial attachment. Stock-control and procurement practicals in our computer labs follow the same records and software routines used by county stores offices.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 36 months (three KNEC modules).',
    sortOrder: 8,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Business Mathematics', weekHours: 4 },
        { name: 'Business Communication', weekHours: 4 },
        { name: 'Entrepreneurship Education', weekHours: 3 },
        { name: 'Information Communication Technology', weekHours: 3 },
      ],
      [
        { name: 'Purchasing & Supply Principles', weekHours: 5 },
        { name: 'Warehousing & Inventory Management', weekHours: 4 },
        { name: 'Business Law', weekHours: 3 },
        { name: 'Financial Accounting', weekHours: 4 },
      ],
      [
        { name: 'Procurement Management', weekHours: 5 },
        { name: 'Logistics & Transport Management', weekHours: 4 },
        { name: 'Contract Management', weekHours: 4 },
        { name: 'Negotiation Skills', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DIP-SM',
    title: 'Diploma in Sales & Marketing Management',
    category: 'BUSINESS',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 11500,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'This programme produces sales executives, marketing assistants and customer-relations officers for FMCG, banking, insurance and retail employers. You earn the KNEC Diploma in Sales & Marketing Management after three examined modules, including a supervised attachment. Every term includes live field-selling projects with Kitui town businesses — you pitch, close and report on real orders, not classroom simulations.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 36 months (three KNEC modules).',
    sortOrder: 9,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Business Mathematics', weekHours: 4 },
        { name: 'Business Communication', weekHours: 4 },
        { name: 'Entrepreneurship Education', weekHours: 3 },
        { name: 'Information Communication Technology', weekHours: 3 },
      ],
      [
        { name: 'Principles of Marketing', weekHours: 5 },
        { name: 'Personal Selling', weekHours: 4 },
        { name: 'Consumer Behaviour', weekHours: 4 },
        { name: 'Business Law', weekHours: 3 },
      ],
      [
        { name: 'Marketing Management', weekHours: 4 },
        { name: 'International Marketing', weekHours: 3 },
        { name: 'Advertising & Sales Promotion', weekHours: 4 },
        { name: 'Marketing Research', weekHours: 4 },
      ],
    ],
  },
  {
    code: 'DIP-PM',
    title: 'Diploma in Project Management',
    category: 'BUSINESS',
    level: 'Diploma',
    examBody: 'TVET-CDACC',
    durationMonths: 24,
    tuitionPerTerm: 12500,
    registrationFee: 3000,
    examFee: 3800,
    description:
      'Graduates plan and deliver projects on time and on budget as project assistants and M&E officers — the exact skills county governments, NGOs and contractors hire for. Assessment is competence-based through TVET-CDACC: you are graded on real deliverables such as project charters, budgets and M&E plans rather than a single final exam. Your final research project can be attached to a live community or county initiative with lecturer supervision.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 24 months, assessed by TVET-CDACC through competence-based evaluation.',
    sortOrder: 10,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Fundamentals of Project Management', weekHours: 4 },
        { name: 'Business Communication', weekHours: 3 },
        { name: 'Entrepreneurship', weekHours: 3 },
        { name: 'ICT Applications', weekHours: 3 },
      ],
      [
        { name: 'Project Planning & Scheduling', weekHours: 5 },
        { name: 'Cost Estimation & Budgeting', weekHours: 4 },
        { name: 'Project Risk Management', weekHours: 4 },
        { name: 'Procurement & Contract Management', weekHours: 4 },
      ],
      [
        { name: 'Monitoring & Evaluation', weekHours: 4 },
        { name: 'Project Quality Management', weekHours: 4 },
        { name: 'Leadership & Stakeholder Management', weekHours: 3 },
        { name: 'Research Project', weekHours: 5 },
      ],
    ],
  },
  {
    code: 'CERT-BM',
    title: 'Certificate in Business Management',
    category: 'BUSINESS',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 18,
    tuitionPerTerm: 8000,
    registrationFee: 2000,
    examFee: 2800,
    description:
      'This certificate makes you office-ready for clerical, bookkeeping and shop-supervision roles in businesses and county offices — and it is the standard stepping stone into the Diploma in Business Management. You earn the KNEC certificate after two examined modules. At KES 8,000 tuition per term with instalment plans available, it is the most affordable full office-skills route we offer.',
    requirements:
      'KCSE mean grade D (or equivalent). Duration: 18 months (two KNEC modules).',
    sortOrder: 11,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Business Mathematics', weekHours: 4 },
        { name: 'Business Communication', weekHours: 4 },
        { name: 'Entrepreneurship', weekHours: 3 },
        { name: 'Life Skills', weekHours: 2 },
      ],
      [
        { name: 'Financial Accounting', weekHours: 4 },
        { name: 'Business Law', weekHours: 3 },
        { name: 'Commerce', weekHours: 3 },
        { name: 'Office Administration', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'CERT-HRM',
    title: 'Certificate in Human Resource Management',
    category: 'BUSINESS',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 18,
    tuitionPerTerm: 8000,
    registrationFee: 2000,
    examFee: 2800,
    description:
      'Graduates take up HR clerk, personnel assistant and front-office administration roles, or progress directly into the Diploma in Human Resource Management. The KNEC certificate is earned over two examined modules covering personnel management, labour law, human relations and office practice. Evening classes are available for students who work during the day, and lecturers remain reachable after class hours for coursework support.',
    requirements:
      'KCSE mean grade D (or equivalent). Duration: 18 months (two KNEC modules).',
    sortOrder: 12,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Business Communication', weekHours: 4 },
        { name: 'Business Mathematics', weekHours: 4 },
        { name: 'Entrepreneurship', weekHours: 3 },
        { name: 'ICT Basics', weekHours: 3 },
      ],
      [
        { name: 'Human Resource Management', weekHours: 4 },
        { name: 'Labour Law', weekHours: 3 },
        { name: 'Human & Public Relations', weekHours: 3 },
        { name: 'Office Administration', weekHours: 3 },
      ],
    ],
  },

  // ---------------- TECHNICAL (9) ----------------
  {
    code: 'DIP-ICT',
    title: 'Diploma in Information Communication Technology',
    category: 'TECHNICAL',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 13000,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'Across six terms you learn to code, design databases, wire and administer networks and deploy working web applications — graduating into ICT support, network administration and developer roles, or into university degrees with exemptions. The KNEC Diploma in ICT is examined module by module, and the final two terms include industrial attachment and a supervised research project. Computer-lab practicals start in week one, and attachments are placed through our partner firms in Kitui — banks, county offices, schools and IT service providers.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 36 months (three KNEC modules). Industrial attachment is undertaken in Term 5–6.',
    isFeatured: true,
    sortOrder: 13,
    stageLabels: ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5', 'Term 6'],
    units: [
      [
        { name: 'Introduction to ICT', weekHours: 5 },
        { name: 'Computer Mathematics I', weekHours: 4 },
        { name: 'Communication Skills', weekHours: 3 },
        { name: 'Entrepreneurship', weekHours: 3 },
      ],
      [
        { name: 'Computer Applications', weekHours: 4 },
        { name: 'Structured Programming', weekHours: 6 },
        { name: 'Computer Mathematics II', weekHours: 4 },
        { name: 'Business Information Systems', weekHours: 3 },
      ],
      [
        { name: 'Operating Systems', weekHours: 5 },
        { name: 'Data Structures & Algorithms', weekHours: 5 },
        { name: 'Systems Analysis & Design', weekHours: 4 },
        { name: 'Quantitative Methods', weekHours: 4 },
      ],
      [
        { name: 'Object Oriented Programming', weekHours: 6 },
        { name: 'Database Design & Management', weekHours: 5 },
        { name: 'Data Communication & Networks', weekHours: 4 },
        { name: 'Web Design & Internet Applications', weekHours: 5 },
      ],
      [
        { name: 'Management Information Systems', weekHours: 4 },
        { name: 'Principles & Practice of Management', weekHours: 3 },
        { name: 'Principles of Accounting', weekHours: 4 },
        { name: 'Computational Techniques', weekHours: 4 },
      ],
      [
        { name: 'Project Management', weekHours: 4 },
        { name: 'Industrial Attachment', weekHours: 3 },
        { name: 'E-Commerce', weekHours: 4 },
        { name: 'Research Project', weekHours: 5 },
      ],
    ],
  },
  {
    code: 'CERT-ICT',
    title: 'Certificate in Information Communication Technology',
    category: 'TECHNICAL',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 18,
    tuitionPerTerm: 9000,
    registrationFee: 2000,
    examFee: 3000,
    description:
      'Graduates install and support computer systems, produce professional documents and build basic websites — skills in steady demand in offices, schools and cyber cafés across the county. The KNEC Certificate in ICT is earned over two examined modules and leads directly into the Diploma in ICT. Hands-on computer time is guaranteed from the first week; no prior computer experience is required.',
    requirements:
      'KCSE mean grade D (or equivalent). Duration: 18 months (two KNEC modules).',
    sortOrder: 14,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Introduction to ICT', weekHours: 4 },
        { name: 'Computer Mathematics I', weekHours: 4 },
        { name: 'Communication Skills', weekHours: 3 },
        { name: 'Entrepreneurship', weekHours: 3 },
      ],
      [
        { name: 'Computer Applications', weekHours: 4 },
        { name: 'Structured Programming', weekHours: 5 },
        { name: 'Operating Systems', weekHours: 4 },
        { name: 'Web Design Basics', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DIP-EEE',
    title: 'Diploma in Electrical & Electronic Engineering (Power Option)',
    category: 'TECHNICAL',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 15000,
    registrationFee: 3000,
    examFee: 4000,
    description:
      'Graduates qualify as electrical technologists for Kenya Power and its contractors, manufacturing plants, solar installers and building-services firms — installing, testing and maintaining power systems. You earn the KNEC Diploma in Electrical & Electronic Engineering (Power Option) across three examined modules. Workshop practice is central to every module — real installation boards, motor-control panels and fault-finding rigs — and Module III attachment is arranged with electrical contractors in the region.',
    requirements:
      'KCSE mean grade C- (or equivalent) with at least C- in Mathematics and Physics/Physical Sciences. Duration: 36 months (three KNEC modules).',
    isFeatured: true,
    sortOrder: 15,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Engineering Mathematics I', weekHours: 5 },
        { name: 'Engineering Drawing & CAD I', weekHours: 4 },
        { name: 'Electrical Engineering Principles I', weekHours: 5 },
        { name: 'Communication Skills', weekHours: 3 },
        { name: 'Workshop Technology & Practice', weekHours: 4 },
      ],
      [
        { name: 'Engineering Mathematics II', weekHours: 5 },
        { name: 'Electrical Machines I', weekHours: 4 },
        { name: 'Analogue Electronics I', weekHours: 4 },
        { name: 'Measurement & Instrumentation', weekHours: 4 },
        { name: 'Electrical Installation Technology II', weekHours: 4 },
      ],
      [
        { name: 'Power Transmission & Distribution', weekHours: 5 },
        { name: 'Electrical Machines II', weekHours: 4 },
        { name: 'Power System Protection', weekHours: 4 },
        { name: 'Industrial Electronics & Control', weekHours: 4 },
        { name: 'Research Project', weekHours: 5 },
      ],
    ],
  },
  {
    code: 'CERT-EEE',
    title: 'Certificate in Electrical & Electronic Engineering',
    category: 'TECHNICAL',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 24,
    tuitionPerTerm: 10000,
    registrationFee: 2500,
    examFee: 3200,
    description:
      'This certificate trains installation electricians who can wire domestic and small commercial premises safely, test their work and find faults under supervision. It is examined by KNEC over two modules and leads directly into the engineering diploma. Most of your week is spent in the wiring workshop on actual installation circuits, and graduates commonly move into wireman jobs — or self-employment — before upgrading to the diploma.',
    requirements:
      'KCSE mean grade D (or equivalent) with at least D in Mathematics and Physics/Physical Sciences. Duration: 24 months (two KNEC modules).',
    sortOrder: 16,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Engineering Mathematics I', weekHours: 4 },
        { name: 'Engineering Drawing', weekHours: 4 },
        { name: 'Electrical Principles I', weekHours: 4 },
        { name: 'Communication Skills', weekHours: 3 },
        { name: 'Workshop Practice', weekHours: 4 },
      ],
      [
        { name: 'Electrical Installation Technology', weekHours: 5 },
        { name: 'Basic Electronics', weekHours: 4 },
        { name: 'Electrical Machines', weekHours: 4 },
        { name: 'Measurement & Instrumentation', weekHours: 3 },
        { name: 'Entrepreneurship', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DIP-BCT',
    title: 'Diploma in Building Construction Technology',
    category: 'TECHNICAL',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 14000,
    registrationFee: 3000,
    examFee: 3800,
    description:
      'Graduates supervise work on site as construction technicians, clerk-of-works assistants and estimating officers — keeping buildings measured, correctly costed and properly built. You earn the KNEC Diploma in Building Construction Technology across three examined modules. Site visits to live construction projects around Kitui are built into every year, together with an attachment with a building contractor in Module III.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 36 months (three KNEC modules).',
    sortOrder: 17,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Building Mathematics', weekHours: 4 },
        { name: 'Technical Drawing I', weekHours: 4 },
        { name: 'Construction Materials & Methods I', weekHours: 4 },
        { name: 'Communication Skills', weekHours: 3 },
        { name: 'Surveying & Levelling I', weekHours: 4 },
      ],
      [
        { name: 'Building Construction II', weekHours: 5 },
        { name: 'Strength of Materials', weekHours: 4 },
        { name: 'Building Services — Plumbing & Sanitation', weekHours: 3 },
        { name: 'Estimating & Costing I', weekHours: 4 },
        { name: 'Site Organization & Management', weekHours: 3 },
      ],
      [
        { name: 'Building Construction III', weekHours: 5 },
        { name: 'Reinforced Concrete Fundamentals', weekHours: 4 },
        { name: 'Construction Contracts & Specifications', weekHours: 3 },
        { name: 'Estimating & Costing II', weekHours: 4 },
        { name: 'Research Project', weekHours: 5 },
      ],
    ],
  },
  {
    code: 'DIP-CAT',
    title: 'Diploma in Catering & Accommodation Management',
    category: 'TECHNICAL',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 30,
    tuitionPerTerm: 12000,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'Graduates go out kitchen-ready and service-ready for hotels, lodges, restaurants and institutional catering — cooking, running food and beverage service, controlling costs and supervising housekeeping. You earn the KNEC Diploma in Catering & Accommodation Management across three modules, including a supervised industrial attachment. Practical sessions in the training kitchen use real ingredients and real service at college functions, so hygiene and cost control are learned by doing.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 30 months including industrial attachment, examined by KNEC.',
    sortOrder: 18,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Food Production Theory & Practical I', weekHours: 6 },
        { name: 'Food & Beverage Service I', weekHours: 4 },
        { name: 'Nutrition & Dietetics', weekHours: 3 },
        { name: 'Communication Skills', weekHours: 3 },
        { name: 'Entrepreneurship Education', weekHours: 3 },
      ],
      [
        { name: 'Food Production Theory & Practical II', weekHours: 6 },
        { name: 'Food & Beverage Cost Control', weekHours: 3 },
        { name: 'Accommodation & Housekeeping Operations', weekHours: 4 },
        { name: 'Catering Hygiene & Safety', weekHours: 3 },
      ],
      [
        { name: 'Kitchen Management & Organisation', weekHours: 4 },
        { name: 'Front Office Operations', weekHours: 4 },
        { name: 'Accommodation Management', weekHours: 4 },
        { name: 'Menu Planning & Nutrition', weekHours: 3 },
        { name: 'Industrial Attachment & Research', weekHours: 5 },
      ],
    ],
  },
  {
    code: 'CERT-HBT',
    title: 'Certificate in Hairdressing & Beauty Therapy',
    category: 'TECHNICAL',
    level: 'Certificate',
    examBody: 'NITA',
    durationMonths: 12,
    tuitionPerTerm: 8500,
    registrationFee: 2000,
    examFee: 2500,
    description:
      'Graduates work as hairdressers and beauty therapists in established salons or open their own — plaiting and treatment work, facials, manicure and pedicure, plus salon bookkeeping and client care. Certification is through NITA trade tests (Grade III to I), which we register you for and prepare you for with graded practical mock assessments. Training happens on real clients at the campus salon studios at Mwingi and Main.',
    requirements:
      'KCSE mean grade D- (or equivalent). Duration: 12 months, assessed through NITA trade tests (Grades I–III).',
    sortOrder: 19,
    stageLabels: ['Grade I–III'],
    units: [
      [
        { name: 'Hairdressing Techniques', weekHours: 5 },
        { name: 'Beauty Therapy & Facial Treatment', weekHours: 4 },
        { name: 'Cosmetology & Skin Care', weekHours: 3 },
        { name: 'Manicure, Pedicure & Nail Technology', weekHours: 3 },
        { name: 'Salon Management & Entrepreneurship', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DIP-FDG',
    title: 'Diploma in Fashion Design & Garment Making',
    category: 'TECHNICAL',
    level: 'Diploma',
    examBody: 'TVET-CDACC',
    durationMonths: 30,
    tuitionPerTerm: 11500,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'Graduates cut, construct and finish garments to client specification — running tailoring businesses, working in production rooms or dressing clients for events. Assessment is competence-based through TVET-CDACC, graded on the garments and portfolios you actually produce. The programme climaxes with a personal collection presented at our annual fashion show, attended by Kitui tailoring and design businesses that hire and subcontract from it.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 30 months, assessed by TVET-CDACC.',
    sortOrder: 20,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Fashion Design Fundamentals', weekHours: 4 },
        { name: 'Textile Fibres & Fabrics', weekHours: 3 },
        { name: 'Garment Construction I', weekHours: 5 },
        { name: 'Pattern Making I', weekHours: 4 },
        { name: 'Communication Skills', weekHours: 3 },
      ],
      [
        { name: 'Garment Construction II', weekHours: 5 },
        { name: 'Pattern Making & Grading', weekHours: 4 },
        { name: 'Fashion Illustration', weekHours: 3 },
        { name: 'Textile Design & Decoration', weekHours: 3 },
        { name: 'Entrepreneurship', weekHours: 3 },
      ],
      [
        { name: 'Advanced Garment Construction', weekHours: 5 },
        { name: 'Fashion Marketing & Merchandising', weekHours: 3 },
        { name: 'Tailoring & Custom Fitting', weekHours: 4 },
        { name: 'Portfolio & Collection Development', weekHours: 4 },
        { name: 'Industrial Attachment', weekHours: 5 },
      ],
    ],
  },
  {
    code: 'ART-EI',
    title: 'Artisan Certificate in Electrical Installation',
    category: 'TECHNICAL',
    level: 'Artisan',
    examBody: 'NITA',
    durationMonths: 6,
    tuitionPerTerm: 6500,
    registrationFee: 1500,
    examFee: 2200,
    description:
      'In six months you become a working installation wireman: safe wiring of domestic installations, correct testing and basic fault-finding. Certification is by NITA trade test (Grades III to I), prepared for with the exact practical tasks the examiners set. Over sixty per cent of contact time is spent in the wiring workshop, and graduates typically move straight into jobs with local electricians and contractors — or into self-employment.',
    requirements:
      'KCSE mean grade D- (or equivalent). Duration: 6 months, assessed through NITA trade tests (Grades III–I).',
    sortOrder: 21,
    stageLabels: ['Trade Test Preparation'],
    units: [
      [
        { name: 'Electrical Safety & First Aid', weekHours: 2 },
        { name: 'Basic Electrical Theory', weekHours: 4 },
        { name: 'Wiring & Installation Practice', weekHours: 6 },
        { name: 'Tools, Materials & Testing', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'ATD',
    title: 'Accounting Technician Diploma (ATD)',
    category: 'KASNEB',
    level: 'Diploma',
    examBody: 'KASNEB',
    durationMonths: 24,
    tuitionPerTerm: 12000,
    registrationFee: 3000,
    examFee: 6200,
    description:
      'Graduates work as accounts assistants, credit officers and payroll clerks — and those who continue their studies join CPA directly at Level II. You earn the KASNEB Accounting Technician Diploma across three examined levels, sat every May and November/December. Classes run at Town Campus in the day with an evening track for working students, and the exams office walks every candidate through KASNEB registration, fee computation and exam entry at each sitting.',
    requirements:
      'KCSE mean grade C (or equivalent) with C- in Mathematics and English/Kiswahili; OR KASNEB CAMS certificate. Duration: 24 months across three levels, examined by KASNEB.',
    sortOrder: 22,
    stageLabels: ['Level I', 'Level II', 'Level III'],
    units: [
      [
        { name: 'Fundamentals of Financial Accounting', weekHours: 6 },
        { name: 'Fundamentals of Business Law', weekHours: 4 },
        { name: 'Computer Applications', weekHours: 4 },
        { name: 'Quantitative Analysis Methods', weekHours: 5 },
      ],
      [
        { name: 'Financial Accounting', weekHours: 6 },
        { name: 'Taxation', weekHours: 4 },
        { name: 'Management Accounting', weekHours: 5 },
        { name: 'Auditing Principles', weekHours: 4 },
      ],
      [
        { name: 'Advanced Financial Accounting', weekHours: 6 },
        { name: 'Public Finance & Taxation', weekHours: 4 },
        { name: 'Financial Management', weekHours: 5 },
        { name: 'Governance & Ethics', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DWE',
    title: 'Diploma in Water Engineering',
    category: 'TECHNICAL',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 36,
    tuitionPerTerm: 16000,
    registrationFee: 3000,
    examFee: 3500,
    description:
      'Graduates keep water flowing: designing small reticulation schemes, testing water quality, and maintaining pumps and boreholes for water companies, county water offices, NGOs and drilling contractors. You earn the KNEC Diploma in Water Engineering across three examined modules, with a sector attachment arranged in the final year. Fieldwork at local boreholes, treatment works and sand dams is built into every module — this course is learned as much in the field as in the laboratory.',
    requirements:
      'KCSE mean grade C- (or equivalent) with C- in Mathematics and Physics/Chemistry. Duration: 36 months (3 years) plus industrial attachment, examined by KNEC.',
    sortOrder: 23,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Water Supply & Sanitation Basics', weekHours: 5 },
        { name: 'Hydraulics', weekHours: 5 },
        { name: 'Technical Drawing', weekHours: 4 },
        { name: 'Mathematics I', weekHours: 4 },
        { name: 'Communication Skills', weekHours: 3 },
      ],
      [
        { name: 'Water Quality & Treatment', weekHours: 5 },
        { name: 'Hydrology & Groundwater', weekHours: 4 },
        { name: 'Pumping Machinery & Pipelines', weekHours: 5 },
        { name: 'Water Project Management', weekHours: 3 },
        { name: 'Surveying', weekHours: 4 },
      ],
      [
        { name: 'Waste Water Engineering', weekHours: 5 },
        { name: 'Irrigation & Drainage Technology', weekHours: 4 },
        { name: 'Water Resources Management', weekHours: 4 },
        { name: 'Entrepreneurship', weekHours: 3 },
        { name: 'Industrial Attachment', weekHours: 8 },
      ],
    ],
  },
  {
    code: 'CPL',
    title: 'Certificate in Plumbing Technology',
    category: 'TECHNICAL',
    level: 'Certificate',
    examBody: 'NITA',
    durationMonths: 12,
    tuitionPerTerm: 8500,
    registrationFee: 2000,
    examFee: 2500,
    description:
      'Graduates install and maintain cold and hot water systems, drainage and sanitary fixtures — a trade in near-permanent demand from builders and county water projects across the region. Certification is by NITA trade tests, which you sit after graded workshop practice on real pipe runs, fittings and fixtures. Tools and materials are provided, and most contact hours are spent in the plumbing workshop rather than the classroom.',
    requirements:
      'KCSE mean grade D (or equivalent). Duration: 12 months including workshop practice, assessed through NITA trade tests.',
    sortOrder: 24,
    stageLabels: ['Stage I', 'Stage II'],
    units: [
      [
        { name: 'Plumbing Tools & Materials', weekHours: 4 },
        { name: 'Basic Plumbing Science', weekHours: 3 },
        { name: 'Pipe Work & Fittings Practice', weekHours: 6 },
        { name: 'Workshop Safety', weekHours: 2 },
      ],
      [
        { name: 'Cold & Hot Water Systems', weekHours: 5 },
        { name: 'Drainage & Sanitation Systems', weekHours: 5 },
        { name: 'Fixtures Installation Practice', weekHours: 5 },
        { name: 'Estimating & Costing', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'CSK',
    title: 'Certificate in Storekeeping & Warehouse Operations',
    category: 'BUSINESS',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 12,
    tuitionPerTerm: 9000,
    registrationFee: 2000,
    examFee: 2500,
    description:
      'Graduates run a stores section: receiving, recording, issuing, stock-taking and warehouse safety — with practical work on the stock-records software employers actually use. The KNEC certificate is examined over two modules and leads directly into the Diploma in Supply Chain Management. It is one of the fastest routes into stores and supply jobs with county governments, schools, hospitals and NGOs.',
    requirements:
      'KCSE mean grade D+ (or equivalent). Duration: 12 months, examined by KNEC; also a direct entry route into the Diploma in Supply Chain Management.',
    sortOrder: 25,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Storekeeping Theory', weekHours: 5 },
        { name: 'Stock Records & Documentation', weekHours: 5 },
        { name: 'Business Communication', weekHours: 3 },
        { name: 'ICT Practical Applications', weekHours: 4 },
      ],
      [
        { name: 'Warehousing & Distribution', weekHours: 5 },
        { name: 'Purchasing & Supplies Principles', weekHours: 4 },
        { name: 'Stock Taking & Inventory Control', weekHours: 5 },
        { name: 'Entrepreneurship', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'CSM',
    title: 'Certificate in Salesmanship',
    category: 'BUSINESS',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 12,
    tuitionPerTerm: 9000,
    registrationFee: 2000,
    examFee: 2500,
    description:
      'Graduates sell professionally as sales representatives, shop supervisors and counter staff for FMCG, pharmaceutical, insurance and retail employers. The KNEC certificate covers two examined modules, from selling skills and customer psychology to sales records and merchandising. Role-play selling sessions and field visits to Kitui town businesses mean you face a real customer before your first job interview.',
    requirements:
      'KCSE mean grade D+ (or equivalent). Duration: 12 months, examined by KNEC. Progression: Diploma in Sales & Marketing Management.',
    sortOrder: 26,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Principles of Selling', weekHours: 5 },
        { name: 'Customer Behaviour & Psychology', weekHours: 4 },
        { name: 'Business Communication', weekHours: 3 },
        { name: 'Introduction to Marketing', weekHours: 4 },
      ],
      [
        { name: 'Salesmanship Practice & Role Play', weekHours: 6 },
        { name: 'Merchandising & Retail Operations', weekHours: 4 },
        { name: 'Customer Relationship Management', weekHours: 4 },
        { name: 'Sales Records & Documentation', weekHours: 3 },
      ],
    ],
  },
  {
    code: 'DCD',
    title: 'Diploma in Community & Social Development',
    category: 'BUSINESS',
    level: 'Diploma',
    examBody: 'KNEC',
    durationMonths: 30,
    tuitionPerTerm: 11000,
    registrationFee: 2500,
    examFee: 3000,
    description:
      'Graduates facilitate groups, plan community projects and write the reports funders require — working as community development assistants and social officers with county governments, NGOs, churches and CBOs. The KNEC diploma runs over three examined modules, including a supervised community attachment. Field projects are conducted in real Kitui communities, and the final research report often becomes a graduate\'s strongest portfolio at interviews.',
    requirements:
      'KCSE mean grade C- (or equivalent). Duration: 30 months (including attachment), examined by KNEC.',
    sortOrder: 27,
    stageLabels: ['Module I', 'Module II', 'Module III'],
    units: [
      [
        { name: 'Introduction to Sociology', weekHours: 4 },
        { name: 'Community Development Concepts', weekHours: 5 },
        { name: 'Communication & Report Writing', weekHours: 3 },
        { name: 'ICT Applications', weekHours: 4 },
      ],
      [
        { name: 'Social Development Project Planning', weekHours: 5 },
        { name: 'Gender & Development', weekHours: 4 },
        { name: 'Social Research Methods', weekHours: 4 },
        { name: 'Resource Mobilisation', weekHours: 3 },
      ],
      [
        { name: 'Community Capacity Building', weekHours: 5 },
        { name: 'Project Monitoring & Evaluation', weekHours: 4 },
        { name: 'Counselling & Guidance', weekHours: 3 },
        { name: 'Industrial & Community Attachment', weekHours: 8 },
      ],
    ],
  },
  {
    code: 'CSS',
    title: 'Certificate in Secretarial Studies',
    category: 'BUSINESS',
    level: 'Certificate',
    examBody: 'KNEC',
    durationMonths: 12,
    tuitionPerTerm: 9000,
    registrationFee: 2000,
    examFee: 2500,
    description:
      'Graduates are office-ready from day one: typing and formatting documents at speed, managing records and front-desk communication, and supporting executives as office administrators and personal assistants. The KNEC certificate is examined over two modules, with keyboarding speed and document formatting drilled weekly in the computer labs. It is also the natural first step toward the KASNEB Certified Secretaries (CS) governance qualification.',
    requirements:
      'KCSE mean grade D+ (or equivalent). Duration: 12 months, examined by KNEC.',
    sortOrder: 28,
    stageLabels: ['Module I', 'Module II'],
    units: [
      [
        { name: 'Office Practice & Administration', weekHours: 5 },
        { name: 'Business Communication I', weekHours: 4 },
        { name: 'Keyboarding & Document Processing', weekHours: 5 },
        { name: 'ICT Applications', weekHours: 4 },
      ],
      [
        { name: 'Shorthand & Transcription', weekHours: 5 },
        { name: 'Business Communication II', weekHours: 4 },
        { name: 'Office Records & Filing Systems', weekHours: 3 },
        { name: 'Entrepreneurship & Office Etiquette', weekHours: 3 },
      ],
    ],
  },
]

// ============================================================
// LECTURERS
// ============================================================
export type LecturerSeed = {
  email: string
  name: string
  phone: string
  staffNo: string
  title: string
  department: string
  specialization: string
  bio: string
}

export const lecturers: LecturerSeed[] = [
  {
    email: 'lecturer@kipskitui.com',
    name: 'Eng. David Kilonzo',
    phone: '+254 722 111 222',
    staffNo: 'KIP/STF/011',
    title: 'Senior Lecturer',
    department: 'Electrical & ICT',
    specialization: 'Computer Systems, Networking & Electrical Power',
    bio: 'BSc Electrical & Electronic Engineering (JKUAT), registered engineer (EBK). Has trained power and ICT technologists at KIP College since 2018, with a bias for hands-on workshop practice and project-based learning.',
  },
  {
    email: 'grace.wambua@kipskitui.com',
    name: 'Mrs. Grace Wambua',
    phone: '+254 733 222 333',
    staffNo: 'KIP/STF/002',
    title: 'Lecturer I',
    department: 'Business Studies',
    specialization: 'Management, Accounting & Entrepreneurship',
    bio: 'MBA (University of Nairobi), Bachelor of Education. Teaches management, accounting and entrepreneurship units across business and ICT programmes, and mentors student research projects.',
  },
  {
    email: 'joseph.kimani@kipskitui.com',
    name: 'CPA Joseph Kimani',
    phone: '+254 701 444 555',
    staffNo: 'KIP/STF/005',
    title: 'Head of Department — KASNEB',
    department: 'KASNEB Professional Studies',
    specialization: 'Accounting, Taxation & Auditing',
    bio: 'CPA (K), CIA. Heads the KASNEB Professional Studies department with over 12 years of KASNEB examination teaching experience and consistently high pass rates across CPA and CAMS classes.',
  },
  {
    email: 'lucy.ndinda@kipskitui.com',
    name: 'Ms. Lucy Ndinda',
    phone: '+254 745 666 777',
    staffNo: 'KIP/STF/023',
    title: 'Lecturer',
    department: 'Hospitality & Fashion',
    specialization: 'Catering, Hairdressing & Beauty Therapy',
    bio: 'Diploma in Catering & Accommodation (KNEC), NITA-graded beauty therapy trainer. Runs the hospitality and fashion studio programmes at the Main and Mwingi campuses.',
  },
]

// ============================================================
// STUDENTS (12 — 2 rich demo + 10 supporting)
// ============================================================
export type FeeSeed = { term: string; description: string; amount: number; type: string; dueDate?: string }
export type PaymentSeed = {
  amount: number
  method: string
  reference: string
  paidAt: string
  status?: string
  note?: string
  recordedBy?: string
}
export type ResultSeed = { courseCode: string; unitName: string; term: string; marks: number; examBody: string }
export type StudentSeed = {
  email: string
  name: string
  phone: string
  admissionNo: string
  courseCode: string
  campusCode: string
  yearOfStudy: number
  currentTerm: number
  status?: string
  kcseGrade?: string
  gender?: string
  dob?: string
  address?: string
  guardianName?: string
  guardianPhone?: string
  admittedAt: string
  fees: FeeSeed[]
  payments: PaymentSeed[]
  results: ResultSeed[]
}

export const students: StudentSeed[] = [
  // ----- RICH DEMO STUDENT: Brian Mutua (Dip ICT, Main, Stage/Term 6 in progress) -----
  {
    email: 'student@kipskitui.com',
    name: 'Brian Mutua',
    phone: '+254 701 234 567',
    admissionNo: 'KIP/2023/0458',
    courseCode: 'DIP-ICT',
    campusCode: 'MAIN',
    yearOfStudy: 2,
    currentTerm: 6,
    status: 'ACTIVE',
    kcseGrade: 'B-',
    gender: 'MALE',
    dob: '2004-03-14',
    address: 'P.O. Box 1234-90200, Kitui',
    guardianName: 'Peter Mutua',
    guardianPhone: '+254 711 223 344',
    admittedAt: '2023-05-08',
    // 6 consecutive terms: 2023/2024 T1 → 2024/2025 T3. Charges total 84,500.
    fees: [
      { term: '2023/2024 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2023-05-15' },
      { term: '2023/2024 T1', description: 'Tuition Fee', amount: 13000, type: 'TUITION', dueDate: '2023-05-30' },
      { term: '2023/2024 T1', description: 'KNEC Module I Examination Fee', amount: 3500, type: 'EXAM', dueDate: '2023-10-15' },
      { term: '2023/2024 T2', description: 'Tuition Fee', amount: 13000, type: 'TUITION', dueDate: '2023-09-30' },
      { term: '2023/2024 T3', description: 'Tuition Fee', amount: 13000, type: 'TUITION', dueDate: '2024-01-31' },
      { term: '2024/2025 T1', description: 'Tuition Fee', amount: 13000, type: 'TUITION', dueDate: '2024-05-31' },
      { term: '2024/2025 T2', description: 'Tuition Fee', amount: 13000, type: 'TUITION', dueDate: '2024-09-30' },
      { term: '2024/2025 T3', description: 'Tuition Fee', amount: 13000, type: 'TUITION', dueDate: '2025-01-31' },
    ],
    // 6 payments totalling 74,000 → balance 10,500
    payments: [
      { amount: 15000, method: 'MPESA', reference: 'MPESA7X2K9L4M', paidAt: '2023-05-12T10:32:00', note: 'Part payment — 2023/2024 T1 fees' },
      { amount: 12000, method: 'MPESA', reference: 'MPESA9K4T7R2P', paidAt: '2023-09-18T14:05:00', note: 'Part payment — 2023/2024 T2 tuition' },
      { amount: 20000, method: 'BANK', reference: 'EQB8842XKQ', paidAt: '2024-01-22T11:15:00', note: 'Equity Bank Kitui — teller deposit', recordedBy: 'Alice Mwangi' },
      { amount: 13000, method: 'MPESA', reference: 'MPESA3M8N5V7Q', paidAt: '2024-05-28T09:47:00', note: 'Full 2024/2025 T1 tuition' },
      { amount: 7000, method: 'MPESA', reference: 'MPESA6B2J8H4C', paidAt: '2024-09-15T16:20:00', note: 'Part payment — 2024/2025 T2 tuition' },
      { amount: 7000, method: 'MPESA', reference: 'MPESA5R9D3F6T', paidAt: '2025-01-18T12:58:00', note: 'Part payment — 2024/2025 T3 tuition' },
    ],
    // Published results for ALL Stage 1–5 units (20)
    results: [
      { courseCode: 'DIP-ICT', unitName: 'Introduction to ICT', term: '2023/2024 T1', marks: 78, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Computer Mathematics I', term: '2023/2024 T1', marks: 64, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Communication Skills', term: '2023/2024 T1', marks: 82, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Entrepreneurship', term: '2023/2024 T1', marks: 71, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Computer Applications', term: '2023/2024 T2', marks: 85, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Structured Programming', term: '2023/2024 T2', marks: 68, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Computer Mathematics II', term: '2023/2024 T2', marks: 58, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Business Information Systems', term: '2023/2024 T2', marks: 74, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Operating Systems', term: '2023/2024 T3', marks: 73, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Data Structures & Algorithms', term: '2023/2024 T3', marks: 66, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Systems Analysis & Design', term: '2023/2024 T3', marks: 77, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Quantitative Methods', term: '2023/2024 T3', marks: 54, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Object Oriented Programming', term: '2024/2025 T1', marks: 81, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Database Design & Management', term: '2024/2025 T1', marks: 84, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Data Communication & Networks', term: '2024/2025 T1', marks: 70, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Web Design & Internet Applications', term: '2024/2025 T1', marks: 86, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Management Information Systems', term: '2024/2025 T2', marks: 75, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Principles & Practice of Management', term: '2024/2025 T2', marks: 67, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Principles of Accounting', term: '2024/2025 T2', marks: 61, examBody: 'KNEC' },
      { courseCode: 'DIP-ICT', unitName: 'Computational Techniques', term: '2024/2025 T2', marks: 52, examBody: 'KNEC' },
    ],
  },
  // ----- DEMO STUDENT 2: Faith Mutune (CPA, Town Campus, Level/Stage 2 in progress) -----
  {
    email: 'mutune@kipskitui.com',
    name: 'Faith Mutune',
    phone: '+254 715 890 123',
    admissionNo: 'KIP/2024/0121',
    courseCode: 'CPA',
    campusCode: 'TOWN',
    yearOfStudy: 1,
    currentTerm: 2,
    status: 'ACTIVE',
    kcseGrade: 'B+',
    gender: 'FEMALE',
    dob: '2005-08-19',
    address: 'P.O. Box 445-90200, Kitui',
    guardianName: 'Mary Mutune',
    guardianPhone: '+254 720 345 678',
    admittedAt: '2024-09-02',
    fees: [
      { term: '2024/2025 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2024-09-15' },
      { term: '2024/2025 T1', description: 'Tuition Fee — CPA Level I', amount: 15000, type: 'TUITION', dueDate: '2024-10-15' },
      { term: '2024/2025 T1', description: 'KASNEB Level I Examination Fee', amount: 6600, type: 'EXAM', dueDate: '2024-10-31' },
      { term: '2024/2025 T2', description: 'Tuition Fee — CPA Level II', amount: 15000, type: 'TUITION', dueDate: '2025-02-15' },
      { term: '2024/2025 T2', description: 'KASNEB Level II Examination Fee', amount: 6600, type: 'EXAM', dueDate: '2025-02-28' },
    ],
    payments: [
      { amount: 12000, method: 'MPESA', reference: 'MPESA2F8K3M9R', paidAt: '2024-09-10T08:12:00', note: 'Part payment — 2024/2025 T1 fees' },
    ],
    results: [
      { courseCode: 'CPA', unitName: 'Fundamentals of Business Law', term: '2024/2025 T1', marks: 68, examBody: 'KASNEB' },
      { courseCode: 'CPA', unitName: 'Financial Accounting', term: '2024/2025 T1', marks: 74, examBody: 'KASNEB' },
      { courseCode: 'CPA', unitName: 'Entrepreneurship & Communication Skills', term: '2024/2025 T1', marks: 81, examBody: 'KASNEB' },
      { courseCode: 'CPA', unitName: 'Economics', term: '2024/2025 T1', marks: 62, examBody: 'KASNEB' },
      { courseCode: 'CPA', unitName: 'Quantitative Analysis', term: '2024/2025 T1', marks: 71, examBody: 'KASNEB' },
      { courseCode: 'CPA', unitName: 'Fundamentals of Finance', term: '2024/2025 T1', marks: 60, examBody: 'KASNEB' },
    ],
  },
  // ----- 10 SUPPORTING STUDENTS -----
  {
    email: 'kevin.musyoka@students.kipskitui.com',
    name: 'Kevin Musyoka',
    phone: '+254 701 546 238',
    admissionNo: 'KIP/2023/0212',
    courseCode: 'DIP-BM',
    campusCode: 'MAIN',
    yearOfStudy: 2,
    currentTerm: 4,
    status: 'ACTIVE',
    kcseGrade: 'C+',
    gender: 'MALE',
    dob: '2004-07-22',
    address: 'P.O. Box 318-90200, Kitui',
    guardianName: 'Boniface Musyoka',
    guardianPhone: '+254 712 654 098',
    admittedAt: '2023-09-04',
    fees: [
      { term: '2023/2024 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2023-09-15' },
      { term: '2023/2024 T1', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2023-10-15' },
      { term: '2024/2025 T1', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2024-10-15' },
    ],
    payments: [
      { amount: 15000, method: 'MPESA', reference: 'MPESA4J7W2N8X', paidAt: '2023-09-16T09:20:00', note: 'Part payment — 2023/2024 T1 fees' },
      { amount: 9000, method: 'MPESA', reference: 'MPESA8H3P5T2K', paidAt: '2024-06-04T13:40:00', note: 'Part payment — 2024/2025 T1 tuition' },
    ],
    results: [
      { courseCode: 'DIP-BM', unitName: 'Business Mathematics', term: '2023/2024 T1', marks: 68, examBody: 'KNEC' },
      { courseCode: 'DIP-BM', unitName: 'Business Communication I', term: '2023/2024 T1', marks: 74, examBody: 'KNEC' },
      { courseCode: 'DIP-BM', unitName: 'Entrepreneurship Education', term: '2023/2024 T1', marks: 71, examBody: 'KNEC' },
      { courseCode: 'DIP-BM', unitName: 'Life Skills & Citizenship Education', term: '2023/2024 T1', marks: 77, examBody: 'KNEC' },
    ],
  },
  {
    email: 'charity.kalondu@students.kipskitui.com',
    name: 'Charity Kalondu',
    phone: '+254 715 289 014',
    admissionNo: 'KIP/2026/0034',
    courseCode: 'DIP-BM',
    campusCode: 'TOWN',
    yearOfStudy: 1,
    currentTerm: 2,
    status: 'ACTIVE',
    kcseGrade: 'C',
    gender: 'FEMALE',
    dob: '2006-02-08',
    address: 'P.O. Box 88-90200, Kitui',
    guardianName: 'Agnes Kalondu',
    guardianPhone: '+254 726 118 340',
    admittedAt: '2026-05-11',
    fees: [
      { term: '2025/2026 T3', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2026-05-20' },
      { term: '2025/2026 T3', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2026-06-20' },
      { term: '2026/2027 T1', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2026-10-15' },
    ],
    payments: [
      { amount: 6000, method: 'MPESA', reference: 'MPESA9S1D4G7B', paidAt: '2026-05-20T10:05:00', note: 'Part payment — 2025/2026 T3 fees' },
    ],
    results: [
      { courseCode: 'DIP-BM', unitName: 'Business Mathematics', term: '2025/2026 T3', marks: 58, examBody: 'KNEC' },
      { courseCode: 'DIP-BM', unitName: 'Business Communication I', term: '2025/2026 T3', marks: 66, examBody: 'KNEC' },
    ],
  },
  {
    email: 'samuel.kilonzo@students.kipskitui.com',
    name: 'Samuel Kilonzo',
    phone: '+254 722 904 176',
    admissionNo: 'KIP/2022/0145',
    courseCode: 'DIP-EEE',
    campusCode: 'MAIN',
    yearOfStudy: 3,
    currentTerm: 9,
    status: 'GRADUATED',
    kcseGrade: 'B-',
    gender: 'MALE',
    dob: '2003-11-30',
    address: 'P.O. Box 502-90200, Kitui',
    guardianName: 'Joel Kilonzo',
    guardianPhone: '+254 733 899 415',
    admittedAt: '2022-09-05',
    fees: [
      { term: '2022/2023 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2022-09-15' },
      { term: '2022/2023 T1', description: 'Tuition Fee', amount: 15000, type: 'TUITION', dueDate: '2022-10-15' },
      { term: '2023/2024 T1', description: 'Tuition Fee', amount: 15000, type: 'TUITION', dueDate: '2023-10-15' },
      { term: '2024/2025 T1', description: 'Tuition Fee', amount: 15000, type: 'TUITION', dueDate: '2024-10-15' },
    ],
    payments: [
      { amount: 30000, method: 'MPESA', reference: 'MPESA2W8R4Y6P', paidAt: '2022-09-30T14:55:00', note: 'Part payment — first year fees' },
      { amount: 9000, method: 'BANK', reference: 'EQB3371QJS', paidAt: '2023-02-14T11:30:00', note: 'Equity Bank — instalment', recordedBy: 'Alice Mwangi' },
      { amount: 9000, method: 'MPESA', reference: 'MPESA7T2M9C3F', paidAt: '2023-07-12T09:10:00', note: 'Instalment — Module II fees' },
    ],
    results: [
      { courseCode: 'DIP-EEE', unitName: 'Electrical Machines I', term: '2023/2024 T1', marks: 72, examBody: 'KNEC' },
      { courseCode: 'DIP-EEE', unitName: 'Measurement & Instrumentation', term: '2023/2024 T1', marks: 68, examBody: 'KNEC' },
      { courseCode: 'DIP-EEE', unitName: 'Power Transmission & Distribution', term: '2024/2025 T1', marks: 76, examBody: 'KNEC' },
      { courseCode: 'DIP-EEE', unitName: 'Power System Protection', term: '2024/2025 T1', marks: 70, examBody: 'KNEC' },
      { courseCode: 'DIP-EEE', unitName: 'Electrical Machines II', term: '2024/2025 T1', marks: 82, examBody: 'KNEC' },
      { courseCode: 'DIP-EEE', unitName: 'Research Project', term: '2024/2025 T1', marks: 79, examBody: 'KNEC' },
    ],
  },
  {
    email: 'agnes.mwikali@students.kipskitui.com',
    name: 'Agnes Mwikali',
    phone: '+254 734 118 520',
    admissionNo: 'KIP/2026/0091',
    courseCode: 'DIP-EEE',
    campusCode: 'MWINGI',
    yearOfStudy: 1,
    currentTerm: 1,
    status: 'ACTIVE',
    kcseGrade: 'C+',
    gender: 'FEMALE',
    dob: '2007-01-05',
    address: 'P.O. Box 61-90400, Mwingi',
    guardianName: 'Mwikali Nzuki',
    guardianPhone: '+254 736 220 784',
    admittedAt: '2026-09-07',
    fees: [
      { term: '2026/2027 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2026-09-15' },
      { term: '2026/2027 T1', description: 'Tuition Fee', amount: 15000, type: 'TUITION', dueDate: '2026-10-15' },
      { term: '2026/2027 T1', description: 'KNEC Module I Examination Fee', amount: 4000, type: 'EXAM', dueDate: '2026-11-20' },
    ],
    payments: [
      { amount: 5000, method: 'MPESA', reference: 'MPESA5N8V2L6Q', paidAt: '2026-09-14T08:45:00', note: 'Part payment — 2026/2027 T1 fees' },
    ],
    results: [],
  },
  {
    email: 'peter.mutinda@students.kipskitui.com',
    name: 'Peter Mutinda',
    phone: '+254 704 672 091',
    admissionNo: 'KIP/2026/0266',
    courseCode: 'CAMS',
    campusCode: 'TOWN',
    yearOfStudy: 1,
    currentTerm: 2,
    status: 'ACTIVE',
    kcseGrade: 'C-',
    gender: 'MALE',
    dob: '2006-09-18',
    address: 'P.O. Box 210-90200, Kitui',
    guardianName: 'Mutinda Ngui',
    guardianPhone: '+254 705 441 963',
    admittedAt: '2026-05-11',
    fees: [
      { term: '2025/2026 T3', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2026-05-20' },
      { term: '2025/2026 T3', description: 'Tuition Fee — CAMS Level I', amount: 9000, type: 'TUITION', dueDate: '2026-06-20' },
      { term: '2025/2026 T3', description: 'KASNEB Level I Examination Fee', amount: 5500, type: 'EXAM', dueDate: '2026-06-30' },
      { term: '2026/2027 T1', description: 'Tuition Fee — CAMS Level II', amount: 9000, type: 'TUITION', dueDate: '2026-10-15' },
    ],
    payments: [
      { amount: 8000, method: 'MPESA', reference: 'MPESA3Q7Z1X5D', paidAt: '2026-05-09T12:15:00', note: 'Part payment — CAMS Level I fees' },
      { amount: 5000, method: 'MPESA', reference: 'MPESA6K4C8H2R', paidAt: '2026-06-22T16:40:00', note: 'Part payment — CAMS Level I fees' },
    ],
    results: [
      { courseCode: 'CAMS', unitName: 'Fundamentals of Accounting', term: '2025/2026 T3', marks: 75, examBody: 'KASNEB' },
      { courseCode: 'CAMS', unitName: 'Fundamentals of Business Mathematics', term: '2025/2026 T3', marks: 63, examBody: 'KASNEB' },
      { courseCode: 'CAMS', unitName: 'Fundamentals of Business Law', term: '2025/2026 T3', marks: 70, examBody: 'KASNEB' },
      { courseCode: 'CAMS', unitName: 'Entrepreneurship & Communication Skills', term: '2025/2026 T3', marks: 78, examBody: 'KASNEB' },
    ],
  },
  {
    email: 'susan.wanjiku@students.kipskitui.com',
    name: 'Susan Wanjiku',
    phone: '+254 720 883 245',
    admissionNo: 'KIP/2024/0391',
    courseCode: 'DIP-CAT',
    campusCode: 'MAIN',
    yearOfStudy: 2,
    currentTerm: 4,
    status: 'ACTIVE',
    kcseGrade: 'C',
    gender: 'FEMALE',
    dob: '2005-04-27',
    address: 'P.O. Box 76-90200, Kitui',
    guardianName: 'Wanjiku Kamau',
    guardianPhone: '+254 721 667 204',
    admittedAt: '2024-09-02',
    fees: [
      { term: '2024/2025 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2024-09-15' },
      { term: '2024/2025 T1', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2024-10-15' },
      { term: '2024/2025 T2', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2025-02-15' },
      { term: '2024/2025 T3', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2025-05-15' },
    ],
    payments: [
      { amount: 12000, method: 'MPESA', reference: 'MPESA1D5F9J3S', paidAt: '2024-09-27T10:30:00', note: 'Full 2024/2025 T1 tuition' },
      { amount: 12000, method: 'MPESA', reference: 'MPESA8B2N6T4V', paidAt: '2025-01-24T14:20:00', note: 'Full 2024/2025 T2 tuition' },
      { amount: 3000, method: 'CASH', reference: 'RCSH-2025-0311', paidAt: '2025-05-06T09:00:00', note: 'Part payment — 2024/2025 T3 tuition', recordedBy: 'Alice Mwangi' },
    ],
    results: [
      { courseCode: 'DIP-CAT', unitName: 'Food Production Theory & Practical I', term: '2024/2025 T1', marks: 81, examBody: 'KNEC' },
      { courseCode: 'DIP-CAT', unitName: 'Food & Beverage Service I', term: '2024/2025 T1', marks: 74, examBody: 'KNEC' },
      { courseCode: 'DIP-CAT', unitName: 'Food Production Theory & Practical II', term: '2024/2025 T2', marks: 78, examBody: 'KNEC' },
      { courseCode: 'DIP-CAT', unitName: 'Accommodation & Housekeeping Operations', term: '2024/2025 T2', marks: 72, examBody: 'KNEC' },
    ],
  },
  {
    email: 'collins.kioko@students.kipskitui.com',
    name: 'Collins Kioko',
    phone: '+254 796 340 217',
    admissionNo: 'KIP/2026/0108',
    courseCode: 'CERT-HBT',
    campusCode: 'MWINGI',
    yearOfStudy: 1,
    currentTerm: 2,
    status: 'ACTIVE',
    kcseGrade: 'D+',
    gender: 'MALE',
    dob: '2007-03-16',
    address: 'P.O. Box 134-90400, Mwingi',
    guardianName: 'Kioko Wambua',
    guardianPhone: '+254 792 118 530',
    admittedAt: '2026-05-11',
    fees: [
      { term: '2025/2026 T3', description: 'Registration Fee (One-time)', amount: 2000, type: 'REGISTRATION', dueDate: '2026-05-20' },
      { term: '2025/2026 T3', description: 'Tuition Fee', amount: 8500, type: 'TUITION', dueDate: '2026-06-20' },
      { term: '2026/2027 T1', description: 'Tuition Fee', amount: 8500, type: 'TUITION', dueDate: '2026-10-15' },
      { term: '2026/2027 T1', description: 'NITA Trade Test Grade III Examination Fee', amount: 2500, type: 'EXAM', dueDate: '2026-11-15' },
    ],
    payments: [
      { amount: 3000, method: 'MPESA', reference: 'MPESA7G5J1K9M', paidAt: '2026-05-25T11:50:00', note: 'Part payment — 2025/2026 T3 fees' },
    ],
    results: [
      { courseCode: 'CERT-HBT', unitName: 'Hairdressing Techniques', term: '2025/2026 T3', marks: 67, examBody: 'NITA' },
    ],
  },
  {
    email: 'esther.syombua@students.kipskitui.com',
    name: 'Esther Syombua',
    phone: '+254 718 509 334',
    admissionNo: 'KIP/2025/0177',
    courseCode: 'DIP-SCM',
    campusCode: 'MAIN',
    yearOfStudy: 2,
    currentTerm: 4,
    status: 'SUSPENDED',
    kcseGrade: 'C',
    gender: 'FEMALE',
    dob: '2005-12-03',
    address: 'P.O. Box 455-90200, Kitui',
    guardianName: 'Syombua Kivuva',
    guardianPhone: '+254 717 449 268',
    admittedAt: '2025-01-13',
    fees: [
      { term: '2024/2025 T2', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2025-02-15' },
      { term: '2024/2025 T2', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2025-03-15' },
      { term: '2024/2025 T3', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2025-05-15' },
      { term: '2025/2026 T1', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2025-10-15' },
    ],
    payments: [
      { amount: 10000, method: 'MPESA', reference: 'MPESA4T8C2F6N', paidAt: '2025-02-03T15:25:00', note: 'Part payment — 2024/2025 T2 fees' },
      { amount: 5000, method: 'MPESA', reference: 'MPESA9M3R7W2P', paidAt: '2025-05-19T09:35:00', note: 'Part payment — 2024/2025 T3 fees' },
    ],
    results: [
      { courseCode: 'DIP-SCM', unitName: 'Business Communication', term: '2024/2025 T2', marks: 69, examBody: 'KNEC' },
      { courseCode: 'DIP-SCM', unitName: 'Business Mathematics', term: '2024/2025 T2', marks: 55, examBody: 'KNEC' },
      { courseCode: 'DIP-SCM', unitName: 'Entrepreneurship Education', term: '2024/2025 T2', marks: 61, examBody: 'KNEC' },
    ],
  },
  {
    email: 'dennis.mwendwa@students.kipskitui.com',
    name: 'Dennis Mwendwa',
    phone: '+254 740 226 865',
    admissionNo: 'KIP/2025/0519',
    courseCode: 'DICT',
    campusCode: 'TOWN',
    yearOfStudy: 2,
    currentTerm: 4,
    status: 'ACTIVE',
    kcseGrade: 'C',
    gender: 'MALE',
    dob: '2005-06-09',
    address: 'P.O. Box 199-90200, Kitui',
    guardianName: 'Mwendwa Kyalo',
    guardianPhone: '+254 741 902 355',
    admittedAt: '2025-09-01',
    fees: [
      { term: '2025/2026 T1', description: 'Registration Fee (One-time)', amount: 3000, type: 'REGISTRATION', dueDate: '2025-09-15' },
      { term: '2025/2026 T1', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2025-10-15' },
      { term: '2025/2026 T2', description: 'Tuition Fee', amount: 12000, type: 'TUITION', dueDate: '2026-02-15' },
    ],
    payments: [
      { amount: 10000, method: 'MPESA', reference: 'MPESA2V6X4B8C', paidAt: '2025-09-19T13:05:00', note: 'Part payment — 2025/2026 T1 fees' },
    ],
    results: [
      { courseCode: 'DICT', unitName: 'Fundamentals of ICT', term: '2025/2026 T1', marks: 80, examBody: 'KASNEB' },
      { courseCode: 'DICT', unitName: 'Computer Applications & the Internet', term: '2025/2026 T1', marks: 72, examBody: 'KASNEB' },
    ],
  },
  {
    email: 'lydia.nduto@students.kipskitui.com',
    name: 'Lydia Nduto',
    phone: '+254 757 341 902',
    admissionNo: 'KIP/2026/0042',
    courseCode: 'CERT-ICT',
    campusCode: 'MWINGI',
    yearOfStudy: 1,
    currentTerm: 1,
    status: 'ACTIVE',
    kcseGrade: 'C-',
    gender: 'FEMALE',
    dob: '2007-05-21',
    address: 'P.O. Box 78-90400, Mwingi',
    guardianName: 'Nduto Mutua',
    guardianPhone: '+254 759 220 661',
    admittedAt: '2026-09-07',
    fees: [
      { term: '2026/2027 T1', description: 'Registration Fee (One-time)', amount: 2000, type: 'REGISTRATION', dueDate: '2026-09-15' },
      { term: '2026/2027 T1', description: 'Tuition Fee', amount: 9000, type: 'TUITION', dueDate: '2026-10-15' },
      { term: '2026/2027 T1', description: 'KNEC Module I Examination Fee', amount: 3000, type: 'EXAM', dueDate: '2026-11-20' },
    ],
    payments: [
      { amount: 4000, method: 'MPESA', reference: 'MPESA5H8S3J7N', paidAt: '2026-09-25T10:55:00', note: 'Part payment — 2026/2027 T1 fees' },
    ],
    results: [],
  },
]

// ============================================================
// TIMETABLE (Dip ICT Stage 6 + Dip EEE Module I + CPA Level II)
// ============================================================
export type TimetableSeed = {
  courseCode: string
  unitName: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
  campusCode: string
  lecturerEmail: string
}

export const timetables: TimetableSeed[] = [
  // Dip ICT — Stage 6 (current term), Main Campus, David Kilonzo & Grace Wambua
  { courseCode: 'DIP-ICT', unitName: 'E-Commerce', dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: 'Lab 2', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'Project Management', dayOfWeek: 1, startTime: '10:00', endTime: '12:00', room: 'Room 12', campusCode: 'MAIN', lecturerEmail: 'grace.wambua@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'Research Project', dayOfWeek: 2, startTime: '08:00', endTime: '11:00', room: 'Lab 1', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'E-Commerce', dayOfWeek: 3, startTime: '09:00', endTime: '11:00', room: 'Lab 2', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'Project Management', dayOfWeek: 3, startTime: '14:00', endTime: '16:00', room: 'Room 12', campusCode: 'MAIN', lecturerEmail: 'grace.wambua@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'Research Project', dayOfWeek: 4, startTime: '08:00', endTime: '10:00', room: 'Lab 1', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'Industrial Attachment', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', room: 'Room 12', campusCode: 'MAIN', lecturerEmail: 'grace.wambua@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'E-Commerce', dayOfWeek: 5, startTime: '08:00', endTime: '10:00', room: 'Lab 2', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-ICT', unitName: 'Research Project', dayOfWeek: 5, startTime: '10:00', endTime: '12:00', room: 'Lab 1', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  // Dip EEE — Module I, Main Campus, David Kilonzo
  { courseCode: 'DIP-EEE', unitName: 'Engineering Mathematics I', dayOfWeek: 2, startTime: '14:00', endTime: '16:00', room: 'Room 14', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-EEE', unitName: 'Electrical Engineering Principles I', dayOfWeek: 3, startTime: '11:00', endTime: '13:00', room: 'Room 14', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-EEE', unitName: 'Workshop Technology & Practice', dayOfWeek: 4, startTime: '10:00', endTime: '13:00', room: 'Engineering Workshop', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  { courseCode: 'DIP-EEE', unitName: 'Engineering Drawing & CAD I', dayOfWeek: 5, startTime: '14:00', endTime: '16:00', room: 'Room 14', campusCode: 'MAIN', lecturerEmail: 'lecturer@kipskitui.com' },
  // CPA — Level II (current), Town Campus, CPA Joseph Kimani
  { courseCode: 'CPA', unitName: 'Financial Reporting', dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: 'Room 4', campusCode: 'TOWN', lecturerEmail: 'joseph.kimani@kipskitui.com' },
  { courseCode: 'CPA', unitName: 'Public Finance & Taxation', dayOfWeek: 1, startTime: '10:00', endTime: '12:00', room: 'Room 4', campusCode: 'TOWN', lecturerEmail: 'joseph.kimani@kipskitui.com' },
  { courseCode: 'CPA', unitName: 'Audit & Assurance', dayOfWeek: 3, startTime: '08:00', endTime: '10:00', room: 'Room 5', campusCode: 'TOWN', lecturerEmail: 'joseph.kimani@kipskitui.com' },
  { courseCode: 'CPA', unitName: 'Corporate Finance', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', room: 'Room 5', campusCode: 'TOWN', lecturerEmail: 'joseph.kimani@kipskitui.com' },
]

// ============================================================
// APPLICATIONS (6 pending + 1 accepted + 1 rejected)
// ============================================================
export type ApplicationSeed = {
  applicantName: string
  email: string
  phone: string
  courseCode: string
  campusCode: string
  kcseGrade: string
  kcseYear: number
  gender?: string
  dob?: string
  guardianName?: string
  guardianPhone?: string
  message?: string
  status?: string
  adminNote?: string
  createdAt: string
  reviewedAt?: string
}

export const applications: ApplicationSeed[] = [
  {
    applicantName: 'Damaris Mwende',
    email: 'damaris.mwende@gmail.com',
    phone: '+254 726 884 512',
    courseCode: 'CPA',
    campusCode: 'MAIN',
    kcseGrade: 'B',
    kcseYear: 2025,
    gender: 'FEMALE',
    dob: '2006-04-02',
    guardianName: 'Annastacia Mwende',
    guardianPhone: '+254 726 884 700',
    message: 'I want to join the January intake for CPA Level 1. Kindly send me the fee structure and class timetable.',
    adminNote: 'Ref: KIP/APP/2026/7QK4M',
    createdAt: '2026-10-19T09:24:00',
  },
  {
    applicantName: 'Alex Mutinda',
    email: 'alexmutinda@yahoo.com',
    phone: '+254 735 909 214',
    courseCode: 'DIP-EEE',
    campusCode: 'MAIN',
    kcseGrade: 'C+',
    kcseYear: 2024,
    gender: 'MALE',
    dob: '2005-11-17',
    guardianName: 'Mutinda Kilui',
    guardianPhone: '+254 735 909 800',
    message: 'I am interested in the electrical engineering diploma (power option). When does the January intake begin, and are there hostel facilities?',
    adminNote: 'Ref: KIP/APP/2026/3XB9T',
    createdAt: '2026-10-16T14:02:00',
  },
  {
    applicantName: 'Beatrice Kavutha',
    email: 'kavutha.b@gmail.com',
    phone: '+254 718 226 730',
    courseCode: 'CERT-HBT',
    campusCode: 'MWINGI',
    kcseGrade: 'D',
    kcseYear: 2025,
    gender: 'FEMALE',
    dob: '2007-01-23',
    guardianName: 'Kavutha Nguli',
    guardianPhone: '+254 718 226 100',
    message: 'I want to join hairdressing and beauty therapy at Mwingi Campus in January. Do you offer evening classes?',
    adminNote: 'Ref: KIP/APP/2026/9JN2W',
    createdAt: '2026-10-12T11:47:00',
  },
  {
    applicantName: 'John Mwova',
    email: 'jmwova@gmail.com',
    phone: '+254 704 337 556',
    courseCode: 'DIP-CAT',
    campusCode: 'MAIN',
    kcseGrade: 'C-',
    kcseYear: 2024,
    gender: 'MALE',
    dob: '2005-06-30',
    guardianName: 'Mwova Nzuki',
    guardianPhone: '+254 704 337 900',
    message: 'Please send me the admission requirements and fee structure for the catering diploma. I would like to join the January intake.',
    adminNote: 'Ref: KIP/APP/2026/5TD8K',
    createdAt: '2026-10-08T16:31:00',
  },
  {
    applicantName: 'Penelope Musenya',
    email: 'penelope.musenya@gmail.com',
    phone: '+254 743 550 218',
    courseCode: 'DIP-SCM',
    campusCode: 'TOWN',
    kcseGrade: 'C',
    kcseYear: 2025,
    gender: 'FEMALE',
    dob: '2006-08-15',
    guardianName: 'Musenya David',
    guardianPhone: '+254 743 550 001',
    message: 'I want to join the January intake for supply chain management at the Town Campus. I work during the day — are there evening classes?',
    adminNote: 'Ref: KIP/APP/2026/2VM7C',
    createdAt: '2026-10-04T08:55:00',
  },
  {
    applicantName: 'Isaac Kasyoka',
    email: 'isaac.kasyoka@gmail.com',
    phone: '+254 791 642 083',
    courseCode: 'CAMS',
    campusCode: 'TOWN',
    kcseGrade: 'B-',
    kcseYear: 2024,
    gender: 'MALE',
    dob: '2005-02-11',
    guardianName: 'Kasyoka Munywoki',
    guardianPhone: '+254 791 642 000',
    message: 'I would like to bridge to CPA through CAMS. Is the January intake available, and what are the KASNEB examination dates?',
    adminNote: 'Ref: KIP/APP/2026/8HJ5R',
    createdAt: '2026-09-29T13:18:00',
  },
  {
    applicantName: 'Vicky Kalekye',
    email: 'vicky.kalekye@gmail.com',
    phone: '+254 733 118 409',
    courseCode: 'DIP-ICT',
    campusCode: 'MAIN',
    kcseGrade: 'B',
    kcseYear: 2025,
    gender: 'FEMALE',
    dob: '2006-05-25',
    guardianName: 'Kalekye Peter',
    guardianPhone: '+254 733 118 400',
    message: 'I applied online for the Diploma in ICT and I am ready to join in January. Thank you for the quick response.',
    status: 'ACCEPTED',
    adminNote:
      'Admitted to the January 2027 intake — Diploma in ICT, Main Campus (Ref: KIP/APP/2026/4W2KQ). Registration fee paid via M-Pesa; admission letter issued and portal login credentials sent by SMS.',
    createdAt: '2026-09-21T10:12:00',
    reviewedAt: '2026-09-24T09:30:00',
  },
  {
    applicantName: 'Bernard Kimeu',
    email: 'bkimeu@yahoo.com',
    phone: '+254 705 774 162',
    courseCode: 'DIP-BM',
    campusCode: 'MAIN',
    kcseGrade: 'D-',
    kcseYear: 2023,
    gender: 'MALE',
    dob: '2004-09-09',
    guardianName: 'Kimeu Katui',
    guardianPhone: '+254 705 774 100',
    message: 'I want to study business management. Please consider my application.',
    status: 'REJECTED',
    adminNote:
      'Below minimum entry requirements for diploma entry — KCSE D- (2023). Advised to apply for the Certificate in Business Management (minimum D plain) before the 15th December 2026 deadline. Ref: KIP/APP/2026/6RF3N.',
    createdAt: '2026-09-15T12:40:00',
    reviewedAt: '2026-09-18T10:15:00',
  },
]

// ============================================================
// ANNOUNCEMENTS
// ============================================================
export const announcements = [
  {
    title: 'January 2027 Intake Ongoing — Apply by 15th December',
    body: "Applications are open for the January 2027 intake (classes begin Monday, 11th January 2027) across all three campuses — Main (Wikililye, Mulango Road), Town (Muli Mall) and Mwingi (Sunrise Building). Applications close on 15th December 2026: apply online through the Admissions page or visit any campus for on-the-spot admission. KASNEB, business and technical programmes are all available, and hostel space at Main Campus is limited and allocated on a first-come basis.",
    audience: 'ALL',
    pinned: true,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-20T08:00:00',
  },
  {
    title: 'End-of-Term Examination Timetable Released',
    body: 'The September–December 2026 end-of-term examination timetable has been released and posted on campus notice boards and the student portal. KNEC module examinations run from Monday, 23rd November to Friday, 4th December 2026. Exam cards will be issued at the Examinations Office from 16th to 20th November to students who have cleared their fee balances — check your personal timetable and report any clashes immediately.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-18T09:00:00',
  },
  {
    title: 'Fee Clearance Deadline for End-of-Term Examinations',
    body: 'All fee balances for the September–December 2026 term must be cleared by Friday, 13th November 2026 for students to be admitted to the end-of-term examinations beginning 23rd November. Pay via M-Pesa Paybill 522 890 (Account: your Admission Number), by direct deposit at any Equity Bank branch, or at the finance office on any campus. Students facing genuine difficulties should see the Finance Officer before the deadline to agree a written instalment plan.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-15T09:00:00',
  },
  {
    title: 'KASNEB May 2027 Examination Registration — Register Early',
    body: 'CPA, CAMS, ATD, CS, CIFA and DICT students intending to sit the May 2027 KASNEB examinations should complete registration by 28th February 2027; late registration attracts KASNEB penalty charges. The Examinations Office runs registration clinics every Friday afternoon this term — bring your student ID, KCSE certificate and previous result slips. Confirm your examination fees with your class lecturer before making payment.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-10T09:00:00',
  },
  {
    title: 'Student ID Cards Ready for Collection — September 2026 Intake',
    body: 'Student ID cards for the September 2026 intake are ready for collection at the Registrar\u2019s office on each campus, Monday to Saturday. Bring your fee receipt and a copy of your national ID or birth certificate. You will need the ID card for end-of-term examinations, the library and attachment letters, so collect yours before 30th November 2026.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-08T10:00:00',
  },
  {
    title: 'Campus Closed for Jamhuri Day',
    body: 'All campuses and offices will be closed on Saturday, 12th December 2026, to mark Jamhuri Day — there will be no Saturday classes that weekend. Normal classes resume on Monday, 14th December 2026. We wish all our students and staff a restful holiday.',
    audience: 'ALL',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-01T11:00:00',
  },
]

// ============================================================
// NEWS POSTS
// ============================================================
export const newsPosts = [
  {
    title: 'May 2026 Intake Opens Monday 11th May — Apply by 24th April',
    excerpt:
      'Applications for the May 2026 intake close on Friday 24th April. Day, evening and weekend classes are available across all three campuses.',
    body: "Applications are now open for the May 2026 intake, which begins on Monday, 11th May 2026 and closes on Friday, 24th April 2026. Places in KASNEB classes and the engineering workshops are allocated on a first-come basis.\n\nThe May intake suits KCSE candidates who received their results in January: certificate and artisan programmes run alongside diploma and KASNEB Level I classes at all three campuses — Main (Wikililye, Mulango Road), Town (Muli Mall) and Mwingi (Sunrise Building).\n\nApply online through the Admissions page or visit any campus with your KCSE result slip and ID. Fees are payable in two or three instalments per term, and county bursary letters are accepted at the finance office.",
    image: '/images/campus-main.webp',
    category: 'Admissions',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-02-16T09:00:00',
  },
  {
    title: 'College Commissions New Workshop Equipment Worth KES 2.8 Million',
    excerpt:
      'New electrical installation boards, motor-control panels and plumbing rigs have been installed in the Main Campus workshops.',
    body: "KIP College has commissioned new training equipment worth KES 2.8 million for its technical workshops. The consignment includes fifteen electrical installation training boards, three three-phase motor-control panels, plumbing pipe-running rigs and upgraded catering kitchen equipment.\n\nThe investment follows what employers ask for: graduates who have already done the work with their own hands. Every wiring board added is one more student who practices on real circuits before touching a client installation.\n\nElectrical, plumbing and catering students began using the new equipment at the start of the May term, and evening workshop hours have been extended so students on attachment during the day can still complete their practical hours.",
    image: '/images/gallery-workshop.webp',
    category: 'Facilities',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-06-12T09:00:00',
  },
  {
    title: 'Mwingi Campus Opens New Wing Ahead of September Intake',
    excerpt:
      'Six new classrooms, a 40-station computer laboratory and an expanded beauty therapy studio open at Mwingi Campus for the September intake.',
    body: "A newly completed expansion at our Mwingi Campus (Sunrise Building) opens its doors this September: six additional classrooms, a 40-station computer laboratory and an expanded beauty therapy and hairdressing studio.\n\nThe expansion responds to growing demand from Mwingi North and Mwingi Central, allowing more learners to train close to home instead of commuting daily to Kitui town. The campus now runs business and ICT certificates and diplomas, KASNEB evening classes and the full hospitality and beauty programmes.\n\nSeptember 2026 intake classes begin on Monday, 7th September 2026, with applications closing on 21st August. A limited number of scholarship slots remain for top KCSE performers from the Mwingi sub-counties.",
    image: '/images/campus-mwingi.webp',
    category: 'Campus',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-08-14T09:00:00',
  },
  {
    title: 'KASNEB November 2026 Examinations: Registration Closes 30th September',
    excerpt:
      'Candidates for the November/December 2026 KASNEB sittings must complete registration and pay examination fees by 30th September.',
    body: "All CPA, CAMS, ATD, CS, CIFA and DICT candidates intending to sit the November/December 2026 KASNEB examinations must complete registration and pay their examination fees by Wednesday, 30th September 2026. KASNEB charges penalties for late entries, and the portal closes firmly thereafter.\n\nThe Examinations Office at each campus is open Monday to Saturday to verify documents, compute fees and submit portal entries. Bring your student ID, KCSE certificate and previous result slips; first-time candidates also need one passport photograph.\n\nCandidates who miss this window should register early for the May 2027 sitting instead — registration is already open, and evening revision classes continue through the term.",
    image: '/images/cat-kasneb.webp',
    category: 'Exams',
    author: 'Examinations Office',
    published: true,
    publishedAt: '2026-09-04T09:00:00',
  },
  {
    title: 'January 2027 Intake Open — Applications Close 15th December',
    excerpt:
      'Classes for the January 2027 intake begin Monday, 11th January 2027. Applications close on 15th December across all three campuses.',
    body: "Applications are open for the January 2027 intake, the largest of our three annual intakes. Classes begin on Monday, 11th January 2027, and applications close on Tuesday, 15th December 2026.\n\nThe intake covers all programmes: KASNEB professional courses (CPA, ATD, CAMS, CS, CIFA), business diplomas and certificates, and technical programmes in the workshops, kitchens and studios. KCSE 2026 candidates may apply with their result slips as soon as results are released.\n\nComing off a 100% CPA Level I pass rate in the May 2026 KASNEB sitting, the college has expanded evening and Saturday classes at Town Campus for working applicants. Apply online or visit any campus — Main (Wikililye), Town (Muli Mall) or Mwingi (Sunrise Building). Hostel space at Main Campus is limited and allocated on a first-come basis.",
    image: '/images/about-campus.webp',
    category: 'Admissions',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-10-14T09:00:00',
  },
  {
    title: 'Class of 2026 Graduation Ceremony — Friday, 11th December',
    excerpt:
      'Graduation for the Class of 2026 takes place on Friday, 11th December 2026 at the Main Campus graduation square. Gown collection runs 7th to 10th December.',
    body: "The Class of 2026 graduates on Friday, 11th December 2026, at the Main Campus graduation square. The ceremony covers all diploma, certificate, artisan and KASNEB graduands across the three campuses.\n\nGraduands should collect gowns and confirm their names on the graduation list at the Registrar\u2019s office between Monday, 7th and Thursday, 10th December. Guest entry is by ticket — two guests per graduand — issued together with the gown. Rehearsal takes place on Thursday, 10th December at 2.00 pm.\n\nThis notice is still in draft pending confirmation of the guest speaker and the final graduand list from the Registrar.",
    image: '/images/gallery-graduation.webp',
    category: 'Community',
    author: 'Communications Office',
    published: false,
    publishedAt: '2026-10-22T09:00:00',
  },
]

// ============================================================
// EVENTS (upcoming)
// ============================================================
export const events = [
  {
    title: 'Graduation Ceremony — Class of 2026',
    description:
      "KIP College's graduation ceremony for the Class of 2026 across all diploma, certificate, artisan and KASNEB programmes. Graduands and guests should be seated by 8.00 am; gowns and two guest tickets per graduand are collected from the Registrar's office between 7th and 10th December. Rehearsal on Thursday, 10th December at 2.00 pm.",
    date: '2026-12-11T09:00:00',
    venue: 'Main Campus Graduation Square, Wikililye',
    image: '/images/gallery-graduation.webp',
  },
  {
    title: 'Career & Entrepreneurship Week 2026',
    description:
      'Five days of career talks, CV clinics, mock interviews and employer exhibitions, with guest speakers from banking, engineering, ICT, hospitality and county government. Final-year students pitch business plans for seed capital on the Friday afternoon. Open to students, alumni and the public — bring your CV.',
    date: '2026-11-16T08:30:00',
    venue: 'Main Campus Grounds, Wikililye',
    image: null,
  },
  {
    title: 'KASNEB Registration Clinic — May 2027 Sitting',
    description:
      'One-on-one support for CPA, CAMS, ATD, CS, CIFA and DICT students registering for the May 2027 KASNEB examinations: portal walk-through, fee computation and document verification. Bring your student ID, KCSE certificate, previous result slips and one passport photo. Runs 10.00 am to 3.00 pm — no appointment needed.',
    date: '2026-11-07T10:00:00',
    venue: 'Town Campus, Room 4 (Muli Mall)',
    image: null,
  },
  {
    title: 'Open Day — All Campuses',
    description:
      'Prospective students and parents tour the workshops, computer labs, training kitchen and salon studios, meet lecturers, watch course demonstrations and receive on-the-spot admission ahead of the January 2027 intake (applications close 15th December). Running 9.00 am to 3.00 pm at Main (Wikililye), Town (Muli Mall) and Mwingi (Sunrise Building) — entry is free and no booking is required.',
    date: '2026-11-28T09:00:00',
    venue: 'All Campuses (Main, Town & Mwingi)',
    image: '/images/about-campus.webp',
  },
  {
    title: 'Fee Clearance & Exam Card Collection Deadline',
    description:
      'All fee balances for the September–December 2026 term must be cleared by Friday, 13th November for students to sit the end-of-term KNEC examinations beginning Monday, 23rd November. Pay via M-Pesa Paybill 522 890 (Account: Admission Number), Equity Bank or the campus finance office. Exam cards are issued to cleared students from 16th to 20th November.',
    date: '2026-11-13T08:00:00',
    venue: 'Finance & Examinations Offices — All Campuses',
    image: null,
  },
]

// ============================================================
// GALLERY
// ============================================================
export const galleryItems = [
  { title: 'Graduation Ceremony 2025', image: '/images/gallery-graduation.webp', caption: 'The Class of 2025 — 214 graduands across diploma, certificate, artisan and KASNEB programmes — celebrates with family at Main Campus.' },
  { title: 'Modern Computer Laboratory', image: '/images/gallery-computer-lab.webp', caption: 'Diploma in ICT students on structured programming practicals in Lab 1, Main Campus — programming labs run weekly from the first term.' },
  { title: 'The Learning Resource Centre', image: '/images/gallery-library.webp', caption: 'The library stocks course texts, KASNEB past papers and KNEC revision material, with quiet study space open on weekdays until 8.00 pm.' },
  { title: 'Engineering Workshops', image: '/images/gallery-workshop.webp', caption: 'Electrical engineering students wire three-phase motor-control panels in the Main Campus workshop — real boards, real circuits.' },
  { title: 'Catering Practical Sessions', image: '/images/gallery-catering.webp', caption: 'Catering students plate for a lunch service in the training kitchen — real menus, real costings, real guests.' },
  { title: 'Beauty & Hairdressing Studio', image: '/images/gallery-beauty.webp', caption: 'Beauty therapy students on client practice at the Mwingi Campus salon studio, preparing for NITA trade tests.' },
  { title: 'Main Campus — Wikililye', image: '/images/campus-main.webp', caption: 'The flagship Main Campus on Mulango Road, Wikililye — workshops, ICT labs, training kitchen, library and hostels.' },
  { title: 'Town Campus — Kitui CBD', image: '/images/campus-town.webp', caption: 'Town Campus at the Muli Mall building — home of the 5.30–8.30 pm evening and Saturday classes for working learners.' },
  { title: 'Mwingi Campus', image: '/images/campus-mwingi.webp', caption: 'Mwingi Campus at the Sunrise Building — business, ICT, KASNEB and beauty programmes for the greater Mwingi region.' },
]

// ============================================================
// TESTIMONIALS
// ============================================================
export const testimonials = [
  {
    name: 'Mercy Ngima',
    role: 'CPA Graduate (2023) — Accountant, Kitui County Government',
    course: 'Certified Public Accountant (CPA)',
    quote:
      'I studied CPA in evening classes at Town Campus while working as a shop attendant in Kitui town — the 5.30 to 8.30 pm timetable is the only reason I could afford to qualify. Our lecturer took us through every past paper until the concepts clicked. I finished Level III in two years and reported to my county job a month later.',
    rating: 5,
  },
  {
    name: 'Daniel Maingi',
    role: 'Diploma in ICT Graduate (2024) — IT Officer, Muli Mall, Kitui',
    course: 'Diploma in Information Communication Technology',
    quote:
      'The computer labs stayed open in the evenings, and my lecturer reviewed my final project code line by line. The attachment the college arranged became my first employer — I was retained after three months.',
    rating: 5,
  },
  {
    name: 'Winnie Kalekye',
    role: 'Diploma in HRM Graduate (2023) — HR Assistant, Kitui Teachers SACCO',
    course: 'Diploma in Human Resource Management',
    quote:
      'Paying fees in small instalments is what kept me in class — I paid from my kiosk earnings without ever being sent home. And the lecturers knew every student by name; they called when you missed a class.',
    rating: 4,
  },
  {
    name: 'Erastus Munywoki',
    role: 'Diploma in EEE Graduate (2022) — Technician, Kenya Power',
    course: 'Diploma in Electrical & Electronic Engineering (Power Option)',
    quote:
      'The workshop practice is the real deal — motors, panels, real installation boards. I walked into my Kenya Power interview confident because I had wired everything they asked about with my own hands.',
    rating: 5,
  },
  {
    name: 'Faith Mwikali',
    role: 'Certificate in Hairdressing Graduate (2024) — Founder, Mwikali Beauty Spot, Kitui Town',
    course: 'Certificate in Hairdressing & Beauty Therapy',
    quote:
      'I opened my own salon six months after passing my NITA trade test. They taught technique, client care and salon bookkeeping — my shop has never run at a loss.',
    rating: 5,
  },
  {
    name: 'Job Kilonzo',
    role: 'Diploma in Catering Graduate (2023) — Chef, Kanzalu Lodge, Machakos',
    course: 'Diploma in Catering & Accommodation Management',
    quote:
      'We cooked for real guests at college functions, so speed and cost control were learned by doing. The attachment placement office got me into Kanzalu Lodge, and I was retained after three months.',
    rating: 4,
  },
]

// ============================================================
// CONTACT MESSAGES
// ============================================================
export const contactMessages = [
  {
    name: 'Tabitha Kasyoka',
    email: 'tabitha.kasyoka@gmail.com',
    phone: '+254 719 456 234',
    subject: 'Admission enquiry — Diploma in ICT',
    message:
      'Hello, I completed KCSE in 2025 with a C plain and would like to join the Diploma in ICT in January. Kindly share the fee structure and admission requirements. Thank you.',
    status: 'NEW',
    createdAt: '2026-10-21T15:42:00',
  },
  {
    name: 'Peter Kivuva',
    email: 'pkivuva@gmail.com',
    phone: '+254 726 883 091',
    subject: 'Fee payment in instalments',
    message:
      'Good afternoon. Is it possible to pay tuition in two instalments within the term? My parent is a farmer and the harvest will be late this season.',
    status: 'READ',
    createdAt: '2026-10-14T12:08:00',
  },
  {
    name: 'Grace Mwonja',
    email: 'grace.mwonja@gmail.com',
    phone: '+254 733 209 887',
    subject: 'Request for attachment letter',
    message:
      'I am a Stage 4 ICT student and need an introduction letter for industrial attachment at the Kitui County Referral Hospital ICT department. Kindly advise on the process.',
    status: 'REPLIED',
    createdAt: '2026-09-28T09:35:00',
  },
]

// ============================================================
// STUDY MATERIALS (Dip ICT — Stages 4-6)
// ============================================================
export type MaterialSeed = {
  courseCode: string
  unitName: string
  title: string
  description: string
  type: string
  fileLabel: string
  createdAt?: string
}

export const materials: MaterialSeed[] = [
  {
    courseCode: 'DIP-ICT',
    unitName: 'Object Oriented Programming',
    title: 'OOP Course Notes — Weeks 1-6',
    description: 'Class notes covering encapsulation, inheritance, polymorphism and abstraction, with worked Java examples and exercises.',
    type: 'NOTES',
    fileLabel: 'OOP-Notes-Week1-6.pdf',
    createdAt: '2025-09-15T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'Database Design & Management',
    title: 'Database Design Lab Manual',
    description: 'Step-by-step lab exercises on ER modelling, normalisation and SQL queries using MySQL, with sample databases.',
    type: 'NOTES',
    fileLabel: 'DBD-Lab-Manual.pdf',
    createdAt: '2025-09-22T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'Data Communication & Networks',
    title: 'DCN Past Examination Paper — 2024',
    description: 'KNEC-style past examination paper with marking scheme highlights, ideal for end-of-term revision.',
    type: 'PAST_PAPER',
    fileLabel: 'DCN-PastPaper-2024.pdf',
    createdAt: '2025-10-02T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'Web Design & Internet Applications',
    title: 'Assignment 1 — Personal Portfolio Website',
    description: 'Build a responsive five-page portfolio website using HTML, CSS and JavaScript. Submission due end of week 10.',
    type: 'ASSIGNMENT',
    fileLabel: 'WebDesign-Assignment1.pdf',
    createdAt: '2025-10-06T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'Management Information Systems',
    title: 'MIS Course Notes — Weeks 1-8',
    description: 'Comprehensive notes on information systems, decision support systems and organisational IS strategy.',
    type: 'NOTES',
    fileLabel: 'MIS-Notes-Week1-8.pdf',
    createdAt: '2026-01-20T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'E-Commerce',
    title: 'Group Project Brief — Mini E-Commerce Site',
    description: 'Design and implement a mini e-commerce platform with a shopping cart and simulated M-Pesa checkout, in groups of three.',
    type: 'ASSIGNMENT',
    fileLabel: 'ECommerce-Project-Brief.pdf',
    createdAt: '2026-09-28T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'Research Project',
    title: 'Research Project Guidelines & Marking Rubric',
    description: 'Official project guidelines covering proposal format, chapter structure, APA 7th referencing and the marking rubric.',
    type: 'NOTES',
    fileLabel: 'Research-Project-Guidelines.pdf',
    createdAt: '2026-10-05T10:00:00',
  },
  {
    courseCode: 'DIP-ICT',
    unitName: 'Project Management',
    title: 'Project Management Past Paper — 2025',
    description: 'Internal examination past paper covering work breakdown structures, Gantt charts, CPM and risk management.',
    type: 'PAST_PAPER',
    fileLabel: 'PM-PastPaper-2025.pdf',
    createdAt: '2026-10-12T10:00:00',
  },
]

// ============================================================
// FAQs
// ============================================================
export const faqs = [
  {
    question: 'How do I apply, and when do intakes open?',
    answer:
      'We have three intakes a year — January, May and September — and applications close about two weeks before classes begin (for example, 15th December for the January intake). Apply online via the Apply page (it takes about 10 minutes) or visit any campus: Main (100m from Wikililye, Mulango Road), Town (Muli Mall) or Mwingi (Sunrise Building). Online applications are reviewed within 48 hours and you receive an application reference immediately.',
    category: 'Admissions',
    sortOrder: 1,
  },
  {
    question: 'What KCSE grade do I need for each level?',
    answer:
      'Artisan courses (e.g. Electrical Installation) take D- and above; certificate courses take D plain or D+; diplomas require C- (with C- in Mathematics and Physics/Physical Sciences for the engineering diplomas); KASNEB professional courses (CPA, CS, CIFA) require C+ with C+ in Mathematics and English/Kiswahili. If your grade is below the course you want, CAMS and ATD are recognised bridging routes into CPA. Bring your KCSE certificate and a copy of your ID when reporting.',
    category: 'Admissions',
    sortOrder: 2,
  },
  {
    question: 'What is the difference between KASNEB and KNEC programmes?',
    answer:
      'KASNEB courses (CPA, ATD, CAMS, CS, CIFA, DICT) are professional qualifications examined in May and November/December, level by level, with fees paid per sitting — ideal if you want to qualify while working. KNEC courses are modular certificates and diplomas (ICT, business, engineering, catering) examined at the end of each module, usually with attachment in the final module. NITA trade tests certify artisan courses such as electrical installation, plumbing and hairdressing, while TVET-CDACC courses are graded on practical competencies. All are nationally recognised; our admissions team will advise which route fits your grade and career.',
    category: 'Courses',
    sortOrder: 3,
  },
  {
    question: 'How much are the fees, and can I pay in instalments?',
    answer:
      'Tuition runs from about KES 6,500 per term for artisan courses, KES 8,000–10,000 for certificates (including CAMS), to KES 11,000–16,000 for diplomas and the higher KASNEB professional levels. Registration is a one-time KES 1,500–3,000, and examination fees are charged separately by the exam body (KNEC per module, KASNEB per sitting, NITA per trade test). Yes — most students pay tuition in two or three instalments within the term, via M-Pesa Paybill 522 890 (Account: your Admission Number), at the finance office, or through Equity Bank.',
    category: 'Fees',
    sortOrder: 4,
  },
  {
    question: 'Do you offer bursaries or scholarships?',
    answer:
      'Yes. Students use county government bursaries (Kitui and neighbouring counties), the national government affirmative action funds, church sponsorships and our internal merit bursaries for top performers each term. Bring your bursary letter to the finance office or call 0703 710 879 for guidance — bursary students follow the same instalment deadlines while letters are being processed.',
    category: 'Fees',
    sortOrder: 5,
  },
  {
    question: 'When are student ID cards and examination cards issued?',
    answer:
      'Student ID cards are issued within the first four weeks of your first term — collect yours at the Registrar\u2019s office with your fee receipt and a copy of your ID. End-of-term examination cards are issued about a week before exams, and only to students who have cleared their fee balances; KNEC, KASNEB and NITA candidates must also be registered with the exam body by the published deadline. Carry your ID card to every examination — lost cards are replaced at a small fee.',
    category: 'Exams',
    sortOrder: 6,
  },
  {
    question: 'Do you offer evening, weekend or holiday classes?',
    answer:
      'Yes. Town Campus (Muli Mall) specialises in evening classes from 5.30 to 8.30 pm on weekdays plus Saturday classes — the standard mode for KASNEB (CPA/ATD/CAMS) and most business programmes. Main and Mwingi campuses run full-time day classes, with Saturday options for some technical practicals. School leavers can also join full-time classes during the long holidays where spaces remain.',
    category: 'Courses',
    sortOrder: 7,
  },
  {
    question: 'Does the college help with attachment placement?',
    answer:
      'Yes. The Industrial Attachment Office places students with vetted organisations across Kitui County and beyond — banks, county offices, water companies, hotels, salons, schools and engineering contractors. Attachment normally comes in your final year (Module II/III for KNEC diplomas), and your logbook and supervisor assessment count toward your final grading. Apply through the office at least one term before you hope to be placed; final-year students should also attend the annual Career & Entrepreneurship Week, where employers recruit on campus.',
    category: 'General',
    sortOrder: 8,
  },
]

// ============================================================
// DOWNLOADS / RESOURCES
// ============================================================
export const downloads = [
  {
    title: 'KIP College Digital Platform — Proposal',
    description:
      'Full project proposal for the college digital platform: solution overview, live demo access with credentials, technology and security, investment (KES 64,000), delivery timeline and support terms.',
    category: 'Guides',
    fileLabel: 'PDF',
    fileUrl: '/downloads/KIP-College-System-Proposal.pdf',
    sortOrder: 1,
  },
  {
    title: 'KIP College Digital Platform — Presentation',
    description:
      'Stakeholder presentation: platform tour, live demo links and credentials, investment summary, recurring costs and next steps.',
    category: 'Guides',
    fileLabel: 'PPTX',
    fileUrl: '/downloads/KIP-College-System-Presentation.pptx',
    sortOrder: 2,
  },
]
