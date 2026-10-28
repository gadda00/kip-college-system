/**
 * KIP COLLEGE — Seed DATA (pure, side-effect-free)
 *
 * Realistic Kenyan tertiary college data: 3 campuses, 21 courses with full
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
      "KIP College's flagship campus set in the quiet Wikililye neighbourhood along Mulango Road, minutes from Kitui Town. Home to our engineering workshops, modern ICT laboratories, library and hostels — the centre of student life.",
    image: '/images/campus-main.png',
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
      'Conveniently located at the Muli Mall building in the heart of Kitui Central Business District, the Town Campus offers day, evening and weekend classes ideal for working professionals pursuing KASNEB and business programmes.',
    image: '/images/campus-town.png',
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
      'Bringing quality tertiary education closer to the people of Mwingi and the greater Mwingi region. The campus offers business, ICT, KASNEB and hospitality programmes in a modern, friendly learning environment.',
    image: '/images/campus-mwingi.png',
    phone: '0703 710 879',
    email: 'mwingi@kipskitui.com',
    facilities: 'Computer Lab,Business Classrooms,Beauty & Hairdressing Studio,Library Corner',
    sortOrder: 3,
  },
]

// ============================================================
// COURSES + UNITS (21 courses, real Kenyan curricula)
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
  c === 'KASNEB' ? '/images/cat-kasneb.png' : c === 'BUSINESS' ? '/images/cat-business.png' : '/images/cat-technical.png'

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
      'The CPA qualification is the gold standard for professional accountants in Kenya and beyond, examined by KASNEB. The programme covers financial accounting, taxation, auditing, financial management and governance across three levels, preparing candidates for careers as accountants, auditors, tax consultants and finance managers. Our CPA classes are taught by qualified accountants with consistently excellent KASNEB pass rates.',
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
      'The KASNEB Certificate in Accounting and Management Skills is the ideal foundation for careers in accounting, finance, office administration and management. Learners gain practical bookkeeping, business mathematics, business law and communication skills — and a direct bridging route into the CPA programme.',
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
      'The KASNEB Certified Secretaries qualification prepares governance, compliance and corporate administration professionals. The programme covers company law, corporate secretarial practice, corporate governance and insolvency across three levels, opening careers as company secretaries, governance officers and board administrators in both private and public sectors.',
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
      'The KASNEB CIFA programme is the specialist qualification for investment, treasury and financial analysis careers. Learners cover economics, quantitative analysis, portfolio management, corporate finance, derivatives and financial modelling — preparing for roles in asset management, stockbroking, banking, insurance and treasury.',
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
      'The KASNEB Diploma in ICT blends technical computing with business skills. Learners progress through programming, databases, computer networks, systems analysis and design, and e-business — and may proceed to professional qualifications or related degree programmes with exemptions.',
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
      "This KNEC diploma develops all-round business managers for Kenya's growing economy. Modules cover business communication, accounting, human resource management, marketing and company law, with practical projects and industrial attachment that prepare learners for supervisory and management roles in private firms, SACCOs and county governments.",
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
      'The KNEC Diploma in Human Resource Management prepares professionals who can recruit, develop and manage talent. Learners study labour law, industrial relations, compensation and reward management and organisational behaviour, with attachment placements in HR departments across Kitui and beyond.',
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
      "Supply chain professionals keep Kenya's goods moving. This KNEC diploma covers procurement principles, warehousing and inventory management, logistics and transport, contract management and negotiation skills — preparing learners for careers in procurement and supplies in government, NGOs, SACCOs and the private sector.",
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
      "The KNEC Diploma in Sales & Marketing develops persuasive, customer-focused professionals. Modules include personal selling, consumer behaviour, marketing research, advertising and strategic marketing — with hands-on field projects in Kitui's vibrant trading environment.",
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
      'This TVET-CDACC competence-based diploma equips learners to plan, execute and close projects on time and on budget. Units cover project planning and scheduling, cost estimation and budgeting, risk management, procurement and monitoring & evaluation — skills in high demand across devolved government, NGOs and construction.',
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
      'The KNEC Certificate in Business Management is a solid foundation in business operations — bookkeeping, business law, commerce and office administration. Graduates proceed to the diploma level or take up clerical and supervisory roles in businesses and county offices.',
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
      'The KNEC Certificate in Human Resource Management introduces personnel management, labour law, human relations and office administration — preparing learners for HR clerk and office administration roles, with progression to the diploma level.',
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
      'The KNEC Diploma in ICT is our most popular technical programme. Across six terms and three modules, learners master structured and object-oriented programming, database design, networking, operating systems, web development, e-commerce and a final research project with industrial attachment — producing job-ready IT professionals for Kenya’s digital economy.',
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
      'The KNEC Certificate in ICT builds practical computing skills — computer applications, structured programming, operating systems and web design. It is ideal for learners upgrading to the diploma level or seeking ICT support and data-entry roles in offices and businesses.',
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
      'The KNEC Diploma in Electrical & Electronic Engineering (Power Option) trains power engineering technologists. Learners cover electrical principles, machines, electronics, power transmission and distribution, protection and control — with extensive workshop practice that leads to careers with Kenya Power, contractors and manufacturing firms.',
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
      'The KNEC Certificate in Electrical & Electronic Engineering builds foundational skills in electrical installation, basic electronics, measurement and electrical machines, with progression to the diploma level for learners who attain the entry requirements.',
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
      'The KNEC Diploma in Building Construction Technology prepares site technicians and quantity surveying assistants. Learners study construction materials and methods, strength of materials, building services, estimating and costing, contracts and site management — with site visits and attachment on live construction projects.',
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
      'The KNEC Diploma in Catering & Accommodation Management blends culinary artistry with hospitality management. Learners train in food production, food and beverage service and control, housekeeping and front office operations in our modern training kitchen — ready for hotels, lodges and the region’s growing hospitality sector.',
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
      'This NITA-graded certificate develops professional hairdressers and beauty therapists. Training covers hairdressing techniques, facials and skin care, manicure and pedicure, salon management and client care — with hands-on practice on real clients in our campus salon studios.',
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
      'The TVET-CDACC Diploma in Fashion Design & Garment Making nurtures creative fashion entrepreneurs. Learners master pattern making and grading, garment construction, textile science, fashion illustration and merchandising — culminating in a personal portfolio collection presented at our annual fashion show.',
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
      'The NITA Artisan Certificate in Electrical Installation equips learners with practical wiring and installation skills — safety, basic electrical theory, wiring systems, testing and fault finding. Graduates are ready for employment as installation artisans or self-employment in the booming construction sector.',
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
      'The KASNEB Accounting Technician Diploma equips learners with competencies in accounting, taxation, auditing and management information. It is a respected stand-alone qualification for accounts assistants and credit officers, and also provides a pathway into the CPA programme — ATD graduates progress directly into CPA Level II.',
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
      'The KNEC Diploma in Water Engineering trains water resource technicians for Kenya\'s vital water sector. Learners cover water supply systems, hydrology, water quality analysis, waste water treatment, irrigation technology and project management — with extensive fieldwork and laboratory practice. Graduates work with water companies, county governments, NGOs and borehole contractors.',
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
      'The Certificate in Plumbing Technology delivers hands-on skills in pipe fitting, water systems installation, drainage, sanitation fixtures, gas piping and basic sheet-metal work. With Kenya\'s construction boom and county water projects, qualified plumbers are in constant demand — most of our graduates move straight into jobs or profitable self-employment.',
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
      'The KNEC Certificate in Storekeeping & Warehouse Operations prepares store clerks, warehouse assistants and stock controllers. Learners gain skills in stock records management, storekeeping procedures, receiving and issuing, stock taking, warehousing safety and basic supply chain software — the backbone of every manufacturing, retail and government store.',
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
      'The Certificate in Salesmanship develops persuasive, professional sellers for retail, wholesale, pharmaceuticals, insurance and FMCG sectors. Learners master selling techniques, customer psychology, customer relationship management, merchandising and sales documentation — with role-play practice in our simulated sales lab.',
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
      'The KNEC Diploma in Community & Social Development trains development workers, social officers and community mobilisers. Learners study sociology, community development methods, project planning, gender and development, social research and counselling — then apply them in real community field projects. Graduates serve with county governments, NGOs, churches and CBOs across Kenya.',
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
      'The KNEC Certificate in Secretarial Studies prepares modern office administrators and personal assistants. Training blends office practice, business communication, shorthand, typing and ICT applications (word processing, spreadsheets, presentations) with professional etiquette — graduates are office-ready from day one, with a progression path to the KASNEB CS qualification.',
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
      'Admitted to the January 2027 intake — Diploma in ICT, Main Campus. Registration fee paid via M-Pesa. Admission letter issued and login credentials sent by SMS.',
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
    adminNote: 'Below minimum entry requirements — advised to apply for certificate level.',
    createdAt: '2026-09-15T12:40:00',
    reviewedAt: '2026-09-18T10:15:00',
  },
]

// ============================================================
// ANNOUNCEMENTS
// ============================================================
export const announcements = [
  {
    title: 'January 2027 Intake Ongoing — Apply Now',
    body: "Applications are open for the January 2027 intake across all our campuses (Main, Town and Mwingi). Programmes are available in KASNEB professional studies, business and technical courses. Apply online through the Admissions page or visit any campus for guidance and on-the-spot admission. Limited hostel space at Main Campus is allocated on a first-come basis.",
    audience: 'ALL',
    pinned: true,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-20T08:00:00',
  },
  {
    title: 'KASNEB May 2027 Examination Registration Deadline',
    body: 'All CPA, CAMS, CS, CIFA and DICT students intending to sit the May 2027 KASNEB examinations must complete registration and pay examination fees by 28th February 2027. Late registration attracts KASNEB penalty charges. Visit the Examinations Office or consult your class lecturer for guidance on the registration portal.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-16T09:00:00',
  },
  {
    title: 'Tuition Fee Payment Deadline for 2026/2027 T1',
    body: 'This is a reminder that tuition fees for the September–December 2026 term fall due on 30th November 2026. Kindly settle your balance via M-Pesa Paybill 522533 (Account: Admission Number) or by direct bank deposit at any Equity Bank branch. Students with outstanding balances will not be admitted to end-of-term examinations.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-10T09:00:00',
  },
  {
    title: 'Industrial Attachment Reports Due',
    body: 'All Diploma students currently on industrial attachment (Stage 5 and 6) must submit their attachment reports, logbooks and supervisor assessment forms to their course coordinators by 20th November 2026. Late submission will affect your Research Project grading. Attachment letters for the next placement are available at the Registrar\u2019s office.',
    audience: 'STUDENTS',
    pinned: false,
    active: true,
    authorName: 'Registrar',
    createdAt: '2026-10-05T10:30:00',
  },
  {
    title: 'Campus Closed for Public Holiday',
    body: 'All campuses and offices will be closed on Friday, 12th December 2026, to mark Jamhuri Day. Normal classes resume on Monday, 15th December 2026. We wish all our students and staff a happy holiday.',
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
    title: 'KIP College Celebrates 100% CPA Level 1 Pass Rate',
    excerpt:
      'All 24 candidates who sat the May 2026 KASNEB CPA Level I examinations at KIP College passed, with six scoring distinctions.',
    body: "KIP College is celebrating a historic milestone after all 24 candidates who sat the May 2026 KASNEB CPA Level I examinations passed, recording a 100% pass rate. Six candidates scored distinctions, led by Faith Mutune of our Town Campus with 85 marks in Financial Accounting.\n\nThe Head of the KASNEB Professional Studies Department, CPA Joseph Kimani, attributed the results to a disciplined revision programme, weekly mock examinations and personalised coaching for every candidate ahead of each KASNEB sitting. \u201CWe treat every candidate as our own child \u2014 nobody is left behind,\u201D he said.\n\nThe Principal congratulated the CPA class, their lecturers and parents, and encouraged candidates registering for the May 2027 Level II examinations to maintain the same momentum. Registration for the next sitting is ongoing at all campuses.",
    image: '/images/gallery-graduation.png',
    category: 'Academics',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-10-09T09:00:00',
  },
  {
    title: 'New Mwingi Campus Wing Officially Opened',
    excerpt:
      'A newly completed two-storey wing at Mwingi Campus adds modern classrooms, a computer laboratory and a beauty therapy studio.',
    body: "The new wing at our Mwingi Campus (Sunrise Building) was officially opened on Friday, adding six modern classrooms, a 40-station computer laboratory and a fully equipped beauty therapy and hairdressing studio.\n\nSpeaking during the opening, the Principal noted that the expansion responds to growing demand for tertiary education in the greater Mwingi region, allowing more programmes to be offered closer to home. The campus now offers business, ICT, KASNEB and hospitality programmes.\n\nEnrolment for the January 2027 intake at Mwingi Campus is ongoing, with limited scholarship slots available for top KCSE performers from Mwingi North and Mwingi Central sub-counties.",
    image: '/images/campus-mwingi.png',
    category: 'Campus',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-09-25T09:00:00',
  },
  {
    title: 'State-of-the-Art Computer Lab Launched at Main Campus',
    excerpt: 'A new 60-station computer laboratory with fibre internet has been commissioned at the Main Campus ICT block.',
    body: "KIP College has commissioned a new 60-station computer laboratory at the Main Campus ICT block, complete with fibre-optic internet, interactive smart boards and modern ergonomic workstations.\n\nThe laboratory serves the growing number of ICT students across the Diploma in ICT, Certificate in ICT and DICT programmes, supporting programming, networking and web development practicals — including evening sessions for working students.\n\nThe project is part of the college\u2019s wider ICT infrastructure upgrade that includes campus-wide Wi-Fi, a new learning management portal and digital library resources.",
    image: '/images/gallery-computer-lab.png',
    category: 'Facilities',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-09-11T09:00:00',
  },
  {
    title: 'KIP College Partners with Kitui Industries for Student Attachment',
    excerpt: 'A new MoU with Kitui Industries and 12 other firms guarantees industrial attachment places for diploma students.',
    body: "KIP College has signed a memorandum of understanding with Kitui Industries and twelve other leading employers in the region, guaranteeing industrial attachment opportunities for diploma students in engineering, business and ICT programmes.\n\nUnder the partnership, students will be placed in structured three-month attachment programmes with mentorship, supervision and assessment linked to their course curricula. Outstanding attachees will be considered for internships and employment after graduation.\n\nThe Principal thanked the partner firms for opening their doors, noting that practical exposure remains the strongest bridge between college and employment for Eastern Kenya\u2019s youth.",
    image: '/images/cat-kasneb.png',
    category: 'Partnerships',
    author: 'Communications Office',
    published: true,
    publishedAt: '2026-08-28T09:00:00',
  },
]

// ============================================================
// EVENTS (upcoming)
// ============================================================
export const events = [
  {
    title: '2026 Graduation Ceremony',
    description:
      "KIP College's annual graduation ceremony for the Class of 2026 across all diploma, certificate, artisan and KASNEB programmes. Graduands and guests should be seated by 8:00 AM; gowns are collected from the Registrar's office from 7th December.",
    date: '2026-12-11T09:00:00',
    venue: 'Main Campus Graduation Square, Wikililye',
    image: '/images/gallery-graduation.png',
  },
  {
    title: 'Career & Entrepreneurship Week',
    description:
      'A week of career talks, CV clinics, employer exhibitions and business-plan competitions featuring guest speakers from banking, engineering, ICT and county government. Open to students and the public.',
    date: '2026-11-16T08:30:00',
    venue: 'Main Campus Grounds, Wikililye',
    image: null,
  },
  {
    title: 'KASNEB Registration Clinic',
    description:
      'One-on-one support for CPA, CAMS, CS, CIFA and DICT students registering for the May 2027 KASNEB examinations — portal walk-through, fee computation and document verification. Bring your student ID and previous result slips.',
    date: '2026-11-07T10:00:00',
    venue: 'Town Campus, Room 4 (Muli Mall)',
    image: null,
  },
  {
    title: 'Open Day — All Campuses',
    description:
      'Prospective students and parents tour facilities, meet lecturers, view course demonstrations and receive on-the-spot admission guidance at all three campuses. Entry is free; parking is available at all campuses.',
    date: '2026-11-28T09:00:00',
    venue: 'All Campuses (Main, Town & Mwingi)',
    image: '/images/about-campus.png',
  },
]

// ============================================================
// GALLERY
// ============================================================
export const galleryItems = [
  { title: 'Graduation Ceremony 2025', image: '/images/gallery-graduation.png', caption: 'Graduands celebrate with family and friends during the 2025 graduation ceremony at Main Campus.' },
  { title: 'Modern Computer Laboratory', image: '/images/gallery-computer-lab.png', caption: 'Students undertaking practical programming exercises in one of our ICT laboratories.' },
  { title: 'The Learning Resource Centre', image: '/images/gallery-library.png', caption: 'Our well-stocked library offers quiet study space, course texts and past examination papers.' },
  { title: 'Engineering Workshops', image: '/images/gallery-workshop.png', caption: 'Electrical engineering students on practical wiring and machines lessons in the Main Campus workshop.' },
  { title: 'Catering Practical Sessions', image: '/images/gallery-catering.png', caption: 'Hospitality students perfecting culinary techniques in the training kitchen.' },
  { title: 'Beauty & Hairdressing Studio', image: '/images/gallery-beauty.png', caption: 'Hairdressing and beauty therapy students during client practice sessions at Mwingi Campus.' },
  { title: 'Main Campus — Wikililye', image: '/images/campus-main.png', caption: 'The flagship Main Campus along Mulango Road, Wikililye.' },
  { title: 'Town Campus — Kitui CBD', image: '/images/campus-town.png', caption: 'The Town Campus at the Muli Mall building, ideal for evening and weekend learners.' },
  { title: 'Mwingi Campus', image: '/images/campus-mwingi.png', caption: 'The Sunrise Building campus serving the greater Mwingi region.' },
]

// ============================================================
// TESTIMONIALS
// ============================================================
export const testimonials = [
  {
    name: 'Mercy Ngima',
    role: 'CPA Graduate — Accountant, Kitui County Government',
    course: 'Certified Public Accountant (CPA)',
    quote:
      'The CPA classes at KIP College were thorough and practical. Our lecturer took us through every past paper until the concepts clicked. I completed Level III in record time and got my job at the County even before graduation.',
    rating: 5,
  },
  {
    name: 'Daniel Maingi',
    role: 'Diploma in ICT Graduate — IT Officer, Muli Mall Kitui',
    course: 'Diploma in Information Communication Technology',
    quote:
      'From wiring networks in the lab to deploying my first web application, the training was hands-on from day one. The industrial attachment organised by the college became my first employer.',
    rating: 5,
  },
  {
    name: 'Winnie Kalekye',
    role: 'Diploma in HRM Graduate — HR Assistant, Kitui Teachers SACCO',
    course: 'Diploma in Human Resource Management',
    quote:
      'The lecturers knew every student by name and pushed us to finish. I also liked that fees could be paid in flexible instalments — that is what kept me in class.',
    rating: 4,
  },
  {
    name: 'Erastus Munywoki',
    role: 'Diploma in EEE Graduate — Technician, Kenya Power',
    course: 'Diploma in Electrical & Electronic Engineering (Power Option)',
    quote:
      'The workshop practice at KIP is the real deal — motors, panels, installation. I walked into my Kenya Power interview confident because I had done it all with my own hands.',
    rating: 5,
  },
  {
    name: 'Faith Mwikali',
    role: 'Certificate in Hairdressing Graduate — Founder, Mwikali Beauty Spot, Kitui Town',
    course: 'Certificate in Hairdressing & Beauty Therapy',
    quote:
      'I opened my own salon six months after graduating. The training covered technique, client care and salon money management. It was the best decision I ever made.',
    rating: 5,
  },
  {
    name: 'Job Kilonzo',
    role: 'Diploma in Catering Graduate — Chef, Kanzalu Lodge, Machakos',
    course: 'Diploma in Catering & Accommodation Management',
    quote:
      'Great kitchens, patient chef-instructors and real guests to cook for during college functions. The attachment placement support was excellent.',
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
    question: 'How do I apply for admission at KIP College?',
    answer:
      'You can apply online through this website (Apply Now — takes about 10 minutes) or visit any of our three campuses — Main Campus (100m from Wikililye, Mulango Road), Town Campus (Muli Mall) or Mwingi Campus (Sunrise Building). Online applications are reviewed within 48 hours.',
    category: 'Admissions',
    sortOrder: 1,
  },
  {
    question: 'What are the entry requirements?',
    answer:
      'Requirements vary by programme: Diploma courses require KCSE mean grade C- or above; Certificate courses require D+ / D; Artisan courses (e.g. Electrical Installation) accept D-; KASNEB professional courses (CPA, CS, CIFA) require C+ with C+ in Mathematics and English, with bridging routes via CAMS/ATD. Bring your KCSE certificate and a copy of your ID when reporting.',
    category: 'Admissions',
    sortOrder: 2,
  },
  {
    question: 'When are the intakes?',
    answer:
      'KIP College has three intakes every year — January, May and September. KASNEB examination classes also align with the May and November/December examination sittings. Late applications are considered where spaces remain.',
    category: 'Admissions',
    sortOrder: 3,
  },
  {
    question: 'How much are the fees, and can I pay in instalments?',
    answer:
      'Fees vary by course (from about KES 6,500 per term for artisan programmes to KES 16,000 for engineering diplomas). We offer flexible instalment plans — most students pay fees in two or three instalments per term. Pay by M-Pesa Paybill 522 890 (Account: your Admission Number), at the finance office, or via bank.',
    category: 'Fees',
    sortOrder: 4,
  },
  {
    question: 'Do you offer bursaries or scholarships?',
    answer:
      'Yes. We support students through county government bursaries (Kitui & Mwingi), the national government affirmative action funds, church sponsorships and our own internal merit bursaries for top performers. Visit the admissions office with your bursary letter or call 0703 710 879 for guidance.',
    category: 'Fees',
    sortOrder: 5,
  },
  {
    question: 'Which examination bodies certify your courses?',
    answer:
      'KIP College programmes are examined by KNEC (technical & business diplomas/certificates), KASNEB (CPA, ATD, CAMS, CS, CIFA), TVET-CDACC (competency-based courses) and NITA (artisan trade tests). All our programmes are fully accredited.',
    category: 'Courses',
    sortOrder: 6,
  },
  {
    question: 'Do you offer evening and weekend classes?',
    answer:
      'Yes — our Town Campus at Muli Mall specialises in evening, weekend and holiday classes for working professionals, especially KASNEB (CPA/ATD/CAMS) and business programmes. Main and Mwingi campuses run full-time day programmes.',
    category: 'Courses',
    sortOrder: 7,
  },
  {
    question: 'Is there accommodation/hostel available?',
    answer:
      'Main Campus has hostels for both male and female students, with 24/7 security. We also assist Town and Mwingi campus students to find safe, affordable private hostels near the campuses. Contact the student affairs office for current rates and availability.',
    category: 'General',
    sortOrder: 8,
  },
  {
    question: 'How do I get my KASNEB examination registration done?',
    answer:
      'Our Examinations Office handles KASNEB registration for all candidates — we verify documents, submit the portal entries and follow up until your exam card is issued. Bring your KCSE certificate, ID and one passport photo. We also run a free KASNEB Registration Clinic every term (check Events).',
    category: 'Exams',
    sortOrder: 9,
  },
  {
    question: 'Does the college assist with attachment and job placement?',
    answer:
      'Yes. The Industrial Attachment Office places students in vetted organisations across Kitui County and beyond — banks, county offices, water companies, hotels, salons and engineering firms. We also run an annual Career & Entrepreneurship Week and maintain an active alumni network that advertises job openings.',
    category: 'General',
    sortOrder: 10,
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
