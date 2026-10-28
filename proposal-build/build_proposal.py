#!/usr/bin/env python3
"""KIP College System — Proposal PDF body builder (ReportLab, Report route).

Chapter numbering plan (Step 3.5 mapping — cover/TOC are NOT chapters):
    | Outline | Type    | Chapter | Title                                    |
    |---------|---------|---------|------------------------------------------|
    | 1       | cover   | —       | Cover (merged separately via pypdf)      |
    | 2       | toc     | —       | Table of Contents (roman i)              |
    | 3       | content | 1       | Executive Summary                        |
    | 4       | content | 2       | About Kitui Institute of Professionals   |
    | 5       | content | 3       | The Proposed Solution                    |
    | 6       | content | 4       | See It Live — Working Demonstration      |
    | 7       | content | 5       | Technology & Security                    |
    | 8       | content | 6       | Investment                               |
    | 9       | content | 7       | Delivery Timeline                        |
    | 10      | content | 8       | Hosting, Support & Maintenance           |
    | 11      | content | 9       | Next Steps & Contacts                    |

Palette: Template 07 "Crystal Blue" body palette (fixed, per typesetting/cover.md —
documents using Template 07 copy the body palette directly instead of palette.cascade).
"""
import hashlib
import os
import sys

PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, 'scripts'))

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (CondPageBreak, HRFlowable, KeepTogether,
                                PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------- fonts
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

from pdf import install_font_fallback  # noqa: E402  (skill helper)
install_font_fallback()

# ------------------------------------------------------- palette (Template 07 body)
PAGE_BG = colors.HexColor('#f5f8fc')      # XL — ultra-light blue-white
SECTION_BG = colors.HexColor('#edf2f9')   # XL — light blue-gray
CARD_BG = colors.HexColor('#e4ecf5')      # L  — soft blue card
TABLE_STRIPE = colors.HexColor('#eef3fa') # L  — subtle blue row
HEADER_FILL = colors.HexColor('#1a4a7a')  # M  — deep blue (bridges to cover)
BORDER = colors.HexColor('#c0d0e2')       # S  — blue-gray lines
ACCENT = colors.HexColor('#2d7ab3')       # XS — = cover glow color
TEXT_PRIMARY = colors.HexColor('#142840') # deep blue-black
TEXT_MUTED = colors.HexColor('#5a7a96')   # blue-gray secondary

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = TABLE_STRIPE

# ---------------------------------------------------------------- geometry
MARGIN = 62
PAGE_W, PAGE_H = A4
AVAIL_W = PAGE_W - 2 * MARGIN
TOP_MARGIN = 76
BOTTOM_MARGIN = 62
AVAIL_H = PAGE_H - TOP_MARGIN - BOTTOM_MARGIN
H1_THRESHOLD = AVAIL_H * 0.25

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'body.pdf')
DOC_TITLE = 'KIP College System — Technology Proposal'
DOC_CLIENT = 'Kitui Institute of Professionals'

# ---------------------------------------------------------------- styles
body_st = ParagraphStyle('Body', fontName='FreeSerif', fontSize=10.5, leading=17,
                         alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
                         spaceBefore=0, spaceAfter=8)
lead_st = ParagraphStyle('Lead', parent=body_st, fontSize=11, leading=18)
h1_st = ParagraphStyle('H1', fontName='FreeSerif', fontSize=20, leading=25,
                      textColor=HEADER_FILL, spaceBefore=6, spaceAfter=2)
h2_st = ParagraphStyle('H2', fontName='FreeSerif', fontSize=13.5, leading=18,
                      textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=6)
bullet_st = ParagraphStyle('Bullet', parent=body_st, alignment=TA_LEFT,
                           leftIndent=14, bulletIndent=2, spaceAfter=5,
                           bulletFontName='FreeSerif')
caption_st = ParagraphStyle('Caption', fontName='FreeSerif-Italic', fontSize=8.5,
                            leading=11, textColor=TEXT_MUTED, alignment=TA_CENTER,
                            spaceBefore=3, spaceAfter=6)
footnote_st = ParagraphStyle('Footnote', fontName='FreeSerif-Italic', fontSize=8.5,
                             leading=12, textColor=TEXT_MUTED, alignment=TA_LEFT,
                             spaceBefore=4, spaceAfter=0)
th_st = ParagraphStyle('TH', fontName='FreeSerif', fontSize=9.5, leading=12.5,
                       textColor=TABLE_HEADER_TEXT, alignment=TA_LEFT)
td_st = ParagraphStyle('TD', fontName='FreeSerif', fontSize=9.5, leading=13,
                       textColor=TEXT_PRIMARY, alignment=TA_LEFT)
td_c_st = ParagraphStyle('TDC', parent=td_st, alignment=TA_CENTER)
td_r_st = ParagraphStyle('TDR', parent=td_st, alignment=TA_CENTER)
stat_st = ParagraphStyle('Stat', fontName='FreeSerif', fontSize=19, leading=23,
                         textColor=ACCENT, alignment=TA_CENTER)
stat_label_st = ParagraphStyle('StatLabel', fontName='FreeSerif', fontSize=8.5,
                               leading=11, textColor=TEXT_MUTED, alignment=TA_CENTER)
url_st = ParagraphStyle('Url', fontName='FreeSerif', fontSize=14.5, leading=19,
                        textColor=ACCENT, alignment=TA_CENTER)
url_note_st = ParagraphStyle('UrlNote', fontName='FreeSerif', fontSize=8.5, leading=12,
                             textColor=TEXT_MUTED, alignment=TA_CENTER)
toc_l0 = ParagraphStyle('TOC0', fontName='FreeSerif', fontSize=11.5, leading=20,
                        textColor=TEXT_PRIMARY, leftIndent=6)
toc_title_st = ParagraphStyle('TOCTitle', fontName='FreeSerif', fontSize=20,
                              leading=25, textColor=HEADER_FILL, spaceAfter=14)


# ---------------------------------------------------------------- doc template
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

    def beforePage(self):
        c = self.canv
        c.saveState()
        # full-page light-blue background (Crystal Blue body)
        c.setFillColor(PAGE_BG)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # header
        c.setFillColor(TEXT_MUTED)
        c.setFont('FreeSerif', 7.5)
        c.drawString(MARGIN, PAGE_H - 40, DOC_TITLE)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - 40, DOC_CLIENT)
        c.setStrokeColor(ACCENT)
        c.setLineWidth(1.2)
        c.line(MARGIN, PAGE_H - 47, PAGE_W - MARGIN, PAGE_H - 47)
        # footer
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.line(MARGIN, 44, PAGE_W - MARGIN, 44)
        c.setFillColor(TEXT_MUTED)
        c.setFont('FreeSerif', 7.5)
        c.drawString(MARGIN, 32, 'October 2026')
        label = 'i' if self.page == 1 else str(self.page - 1)
        c.drawRightString(PAGE_W - MARGIN, 32, label)
        c.restoreState()


# ---------------------------------------------------------------- helpers
def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


def h1_block(text, first_flowable=None):
    """H1 + accent underline (+ optionally the first following flowable)."""
    rule = HRFlowable(width='100%', thickness=1.1, color=ACCENT,
                      spaceBefore=0, spaceAfter=10)
    group = [add_heading(text, h1_st, level=0), rule]
    if first_flowable is not None:
        group.append(first_flowable)
    return [CondPageBreak(H1_THRESHOLD), Spacer(1, 14), KeepTogether(group)]


def h2_block(text, first_flowable=None):
    group = [Paragraph('<b>%s</b>' % text, h2_st)]
    if first_flowable is not None:
        group.append(first_flowable)
    return [KeepTogether(group)]


def P(text, style=None):
    return Paragraph(text, style or body_st)


def bullets(items):
    return [Paragraph(t, bullet_st, bulletText='\u2022') for t in items]


def styled_table(header, rows, ratios, aligns=None, total_row=False):
    """Build a palette-compliant table. All cells are Paragraphs."""
    n = len(header)
    aligns = aligns or ['L'] * n
    col_w = [r * AVAIL_W for r in ratios]
    assert abs(sum(ratios) - 1.0) < 1e-6, 'ratios must sum to 1'
    assert sum(col_w) <= AVAIL_W + 0.5, 'table exceeds available width'
    amap = {'L': td_st, 'C': td_c_st, 'R': td_r_st}
    data = [[Paragraph('<b>%s</b>' % h, th_st) for h in header]]
    for row in rows:
        data.append([Paragraph(cell, amap[aligns[i]]) for i, cell in enumerate(row)])
    t = Table(data, colWidths=col_w, hAlign='CENTER', repeatRows=1)
    cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    if total_row:
        cmds += [
            ('BACKGROUND', (0, -1), (-1, -1), CARD_BG),
            ('LINEABOVE', (0, -1), (-1, -1), 1.0, HEADER_FILL),
        ]
    t.setStyle(TableStyle(cmds))
    return t


def stat_row(stats):
    """Row of three stat callout cards (Data-to-Ink rule)."""
    gap = 14
    card_w = (AVAIL_W - 2 * gap) / 3.0
    cards = []
    for value, label in stats:
        inner = Table(
            [[Paragraph('<b>%s</b>' % value, stat_st)],
             [Paragraph(label, stat_label_st)]],
            colWidths=[card_w])
        inner.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
            ('BOX', (0, 0), (-1, -1), 1, ACCENT),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
            ('TOPPADDING', (0, 1), (-1, 1), 0),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        cards.append(inner)
    outer = Table([[cards[0], '', cards[1], '', cards[2]]],
                  colWidths=[card_w, gap, card_w, gap, card_w], hAlign='CENTER')
    outer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return outer


def url_callout(url, note):
    box = Table([[Paragraph('<b>%s</b>' % url, url_st)],
                 [Paragraph(note, url_note_st)]],
                colWidths=[AVAIL_W * 0.86])
    box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1.4, ACCENT),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
        ('TOPPADDING', (0, 1), (-1, 1), 2),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    box.hAlign = 'CENTER'
    return box


def callout_box(text):
    box = Table([[Paragraph(text, ParagraphStyle(
        'CalloutText', parent=body_st, alignment=TA_LEFT, spaceAfter=0))]],
        colWidths=[AVAIL_W * 0.97])
    box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SECTION_BG),
        ('LINEBEFORE', (0, 0), (0, -1), 3, ACCENT),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    box.hAlign = 'CENTER'
    return box


# ---------------------------------------------------------------- story
story = []

# ---- TOC (front matter, roman i)
toc = TableOfContents()
toc.levelStyles = [toc_l0]
story.append(Paragraph('<b>Table of Contents</b>', toc_title_st))
story.append(HRFlowable(width='100%', thickness=1.1, color=ACCENT,
                        spaceBefore=0, spaceAfter=16))
story.append(toc)
story.append(PageBreak())

# ================================================================ 1. EXECUTIVE SUMMARY
story += h1_block('1. Executive Summary', P(
    'Kitui Institute of Professionals (KIP) is a growing tertiary college serving '
    'students across Kitui County and beyond. With three campuses, twenty-one '
    'programmes, and four national examining bodies, the college has reached the '
    'scale at which paper registers, spreadsheets, and walk-in enquiries can no '
    'longer keep pace with daily operations.', lead_st))
story.append(P(
    'This proposal presents the KIP College System: a complete digital campus '
    'platform that unifies the college website, admissions, student services, '
    'teaching operations, and administration in one secure online system. The '
    'platform is not a concept or a mock-up. It has already been designed, built, '
    'tested, and deployed to the internet, and it can be reviewed live today.'))
story.append(Spacer(1, 10))
story.append(stat_row([
    ('3', 'CAMPUSES IN KITUI COUNTY'),
    ('21', 'PROGRAMMES ACROSS 3 CATEGORIES'),
    ('KES 64,000', 'ONE-OFF PLATFORM INVESTMENT'),
]))
story.append(Spacer(1, 14))
story.append(P(
    'The total one-off investment is KES 64,000, covering design and branding, '
    'platform development, content and testing, and training with handover. '
    'Recurring costs are deliberately modest: KES 10,000 per year for hosting and '
    'KES 36,000 per year (KES 3,000 per month) for maintenance and support. '
    'Payment follows three clear milestones: 50% on sign-off, 25% on staging '
    'delivery, and 25% on go-live.'))
story.append(P(
    'Because the core platform is complete, the remaining delivery timeline is '
    'short: approximately six to eight weeks of branding, content loading, '
    'training, and go-live preparation. We invite the college management to explore '
    'the live demonstration described in Section 4 and to confirm the content and '
    'branding assets required for launch.'))

# ================================================================ 2. ABOUT KIP
story += h1_block('2. About Kitui Institute of Professionals', P(
    'Kitui Institute of Professionals is a tertiary college headquartered in Kitui '
    'Town, Kenya. The college delivers accessible, career-focused training through '
    'three campuses, each serving a distinct community of learners. Its academic '
    'portfolio spans twenty-one programmes organised into three categories: '
    'technical, business, and KASNEB professional courses.'))
story += h2_block('Campuses')
story.append(styled_table(
    ['Campus', 'Location'],
    [
        ['Main Campus', '100 metres from Wikililye, Mulango Road, Kitui'],
        ['Town Campus', 'Muli Mall Building, Kitui Central Business District'],
        ['Mwingi Campus', 'Sunrise Building, Mwingi Town'],
    ],
    [0.28, 0.72]))
story.append(Paragraph('Table 1 — KIP campus locations.', caption_st))
story.append(Spacer(1, 6))
story += h2_block('Academic portfolio')
story.append(P(
    'The breadth of the portfolio is central to this proposal. Technical courses '
    'cover information and communication technology, engineering trades, and '
    'hairdressing and beauty therapy. Business courses prepare students for '
    'commercial and administrative careers. KASNEB professional courses, including '
    'CPA, CAMS, and ATD, are examined by KASNEB, while other programmes are '
    'examined by KNEC, NITA, and TVET-CDACC.'))
story.append(styled_table(
    ['Category', 'Representative programmes', 'Examining bodies'],
    [
        ['Technical', 'ICT, engineering, hairdressing and beauty therapy, and related trades',
         'KNEC, NITA, TVET-CDACC'],
        ['Business', 'Business management and commercial studies',
         'KNEC, TVET-CDACC'],
        ['KASNEB professional', 'CPA, CAMS, ATD and other professional qualifications',
         'KASNEB'],
    ],
    [0.20, 0.52, 0.28]))
story.append(Paragraph('Table 2 — Programme categories and examining bodies.', caption_st))
story.append(Spacer(1, 4))
story.append(P(
    'A multi-campus college with this examination mix needs one dependable system '
    'of record: a single place where applications become enrolments, fees are '
    'tracked to the shilling, results follow a controlled publication workflow, '
    'and every campus reads the same timetable. That is precisely the role of the '
    'KIP College System.'))

# ================================================================ 3. THE PROPOSED SOLUTION
story += h1_block('3. The Proposed Solution', P(
    'The KIP College System is one integrated platform with six cooperating '
    'modules. Every user reaches the system through a single web address, signs in '
    'securely, and sees only the functions appropriate to their role. The table '
    'below summarises the platform at a glance.'))
story.append(styled_table(
    ['Module', 'What it does', 'Primary users'],
    [
        ['Public website',
         'College news and announcements, programme catalogue with fees, campus and '
         'gallery pages, frequently asked questions, and contact forms. Managed '
         'without a developer through the built-in content tools.',
         'Prospective students, parents, the public'],
        ['Online admissions',
         'Guided application wizard that validates every field, issues a unique '
         'reference number in the KIP/APP/YYYY/XXXXX format, blocks duplicates, and '
         'lands completed applications straight in the administrative inbox.',
         'Applicants, admissions staff'],
        ['Student portal',
         'Personal dashboard with fee statements and payment history, published '
         'results, class timetable, learning materials, announcements, and an AI '
         'study assistant for revision questions.',
         'Students'],
        ['Lecturer workspace',
         'Class rosters per teaching unit, marks entry with a draft-to-publish '
         'workflow, and a lecturer view of the master timetable.',
         'Lecturers'],
        ['Admin console',
         'Students and applications management, courses and course units, fees and '
         'payments, results moderation and publication, news and announcements '
         'publishing, and timetable administration with exports and reports.',
         'Registrar, accounts, management'],
        ['AI study assistant',
         'A guided study companion inside the student portal that answers revision '
         'questions and points students to the right learning materials.',
         'Students'],
    ],
    [0.16, 0.56, 0.28]))
story.append(Paragraph('Table 3 — Platform modules at a glance.', caption_st))
story.append(Spacer(1, 6))
story += h2_block('How the modules work together')
story.append(P(
    'The platform follows the natural life cycle of a student. An applicant '
    'completes the online application form and receives a reference number '
    'immediately. Admissions staff review the application in the admin console and, '
    'once accepted, the applicant becomes a student record with fees, course '
    'units, and a timetable. Lecturers record marks as drafts and publish them '
    'only after moderation, at which point results appear in the student portal. '
    'Throughout the cycle, the accounts office sees balances and payments in real '
    'time, and management publishes news that appears instantly on the public '
    'website.'))
story.append(P(
    'This single flow eliminates the fragmentation that normally exists between a '
    'website, a spreadsheet, and a filing cabinet. Information is entered once, '
    'validated at the point of entry, and reused everywhere it is needed.'))

# ================================================================ 4. SEE IT LIVE
story += h1_block('4. See It Live — Working Demonstration', P(
    'The platform is deployed and running on the internet right now. Management '
    'can explore every module before any commitment is made, using the demo '
    'address and the demo accounts below.'))
story.append(Spacer(1, 8))
story.append(url_callout(
    'https://kip-college-system.vercel.app',
    'Open this address in any browser — desktop or mobile. No installation required.'))
story.append(Spacer(1, 12))
story.append(P(
    'The demo runs on Vercel with a persistent PostgreSQL database (Prisma '
    'Postgres), so the data you enter during exploration is saved and visible '
    'across visits. All records on the demo site are demonstration data and will '
    'be replaced with official college records at go-live.'))
story += h2_block('Demo accounts')
story.append(styled_table(
    ['Role', 'Email address', 'Password'],
    [
        ['Administrator', 'admin@kipskitui.com', 'Admin@123'],
        ['Lecturer', 'lecturer@kipskitui.com', 'Lecturer@123'],
        ['Student', 'student@kipskitui.com', 'Student@123'],
    ],
    [0.26, 0.46, 0.28], aligns=['L', 'L', 'C']))
story.append(Paragraph('Table 4 — Demo login credentials for the live system.', caption_st))
story += h2_block('Suggested things to try')
story += bullets([
    '<b>As an administrator:</b> open the applications inbox and review a submitted '
    'application, record a fee payment, and publish a news announcement that '
    'appears instantly on the public website.',
    '<b>As a lecturer:</b> open a class roster, enter marks and save them as a '
    'draft, then publish the results so they become visible to students.',
    '<b>As a student:</b> review the fee statement and payment history, check the '
    'class timetable, view published results, and ask the AI study assistant a '
    'revision question.',
    '<b>As a member of the public:</b> browse the programme catalogue, then submit '
    'a demonstration application and watch the system issue a KIP/APP reference '
    'number on the confirmation screen.',
])
story.append(Spacer(1, 4))
story.append(P(
    'While exploring, note the reference-number format on applications, the '
    'draft-to-publish discipline on results, and the role-based menus: each '
    'account sees a workspace tailored to its responsibilities and nothing else.'))

# ================================================================ 5. TECHNOLOGY & SECURITY
story += h1_block('5. Technology and Security', P(
    'The platform is built on a modern, well-supported technology stack. These '
    'choices keep the system fast, secure, and inexpensive to operate, and they '
    'ensure that any competent developer can maintain it in the future without '
    'being locked into obscure tools.'))
story.append(styled_table(
    ['Layer', 'Technology', 'Why it matters'],
    [
        ['Application framework', 'Next.js 16',
         'The industry-standard React framework; fast page loads and a first-class '
         'deployment pipeline.'],
        ['Language', 'TypeScript',
         'Strict typing catches errors before release and keeps the codebase '
         'maintainable as the college grows.'],
        ['Interface', 'Tailwind CSS with shadcn/ui',
         'A polished, consistent, mobile-friendly interface that adapts to phones, '
         'tablets, and desktops.'],
        ['Database', 'PostgreSQL via Prisma Postgres',
         'A reliable relational database with automatic provisioning; fee and '
         'results arithmetic is computed in integer cents to avoid rounding '
         'errors.'],
        ['Hosting', 'Vercel',
         'Global content delivery, HTTPS by default, and automatic deployments '
         'with no servers for the college to own or maintain.'],
    ],
    [0.22, 0.26, 0.52]))
story.append(Paragraph('Table 5 — Technology stack.', caption_st))
story += h2_block('Security by design')
story.append(P(
    'The system handles personal data and financial records, so security is built '
    'into the application itself rather than bolted on afterwards.'))
story += bullets([
    '<b>Role-based access control:</b> administrator, lecturer, and student '
    'capabilities are strictly separated; every sensitive endpoint verifies the '
    'signed-in role before responding.',
    '<b>Rate limiting:</b> login attempts, password changes, application '
    'submissions, and contact forms are throttled to blunt automated attacks and '
    'form abuse.',
    '<b>Audit trail:</b> sign-ins, password changes, application decisions, and '
    'results publication are recorded with a timestamp so sensitive actions are '
    'traceable to an account.',
    '<b>Secure sessions:</b> hardened, signed session cookies with automatic '
    'expiry, plus origin checks on authenticated requests.',
    '<b>Validated inputs:</b> every form and API request is validated on the '
    'server before it touches the database.',
    '<b>Controlled results workflow:</b> marks remain drafts until deliberately '
    'published, protecting students from accidental or premature releases.',
])

# ================================================================ 6. INVESTMENT
story += h1_block('6. Investment', P(
    'The one-off investment covers everything required to take the platform from '
    'the working demonstration to a branded, content-complete production system in '
    'the college\'s own name. The breakdown is deliberately transparent so that '
    'management can see exactly what each shilling buys.'))
story.append(Spacer(1, 8))
story.append(url_callout('Total one-off investment: KES 64,000',
                         'Inclusive of design, development, content, testing, deployment, and training.'))
story.append(Spacer(1, 12))
story.append(styled_table(
    ['Component', 'Scope of work', 'Amount (KES)'],
    [
        ['Design and branding', 'College identity applied across the platform: colours, typography, '
         'imagery treatment, and print-ready document styling.', '15,000'],
        ['Platform development', 'Completion and refinement of all six modules, integrations, '
         'performance tuning, and production hardening.', '22,000'],
        ['Content, testing and deployment', 'Loading of programmes, fees, campuses, staff and student '
         'records; end-to-end testing; go-live deployment.', '18,000'],
        ['Training and handover', 'Hands-on training for administrators, lecturers, and students, '
         'plus documentation and administrative handover.', '9,000'],
        ['<b>Total one-off investment</b>', '<b>Everything required for go-live</b>', '<b>64,000</b>'],
    ],
    [0.26, 0.52, 0.22], aligns=['L', 'L', 'C'], total_row=True))
story.append(Paragraph('Table 6 — One-off investment breakdown.', caption_st))
story.append(Paragraph(
    'Note: fee figures are indicative and remain subject to final confirmation by '
    'the college owner.', footnote_st))
story += h2_block('Payment milestones')
story.append(styled_table(
    ['Milestone', 'Trigger event', 'Share', 'Amount (KES)'],
    [
        ['First payment', 'Proposal sign-off and project initiation', '50%', '32,000'],
        ['Second payment', 'Delivery of the staging site with college content loaded', '25%', '16,000'],
        ['Final payment', 'Go-live of the production system', '25%', '16,000'],
        ['<b>Total</b>', '<b>Full one-off investment</b>', '<b>100%</b>', '<b>64,000</b>'],
    ],
    [0.22, 0.46, 0.12, 0.20], aligns=['L', 'L', 'C', 'C'], total_row=True))
story.append(Paragraph('Table 7 — Payment milestone schedule.', caption_st))
story.append(Spacer(1, 4))
story.append(P(
    'The milestone structure means the college only pays the second and third '
    'instalments after seeing staged, working results. Recurring hosting and '
    'support costs are presented separately in Section 8.'))

# ================================================================ 7. DELIVERY TIMELINE
story += h1_block('7. Delivery Timeline', P(
    'Because the core platform is already built and running, the delivery calendar '
    'focuses on making it yours: branding, content, people, and launch. The '
    'schedule below spans approximately six to eight weeks from sign-off, with '
    'each phase producing a visible, verifiable output.'))
story.append(styled_table(
    ['Phase', 'Weeks', 'Focus and key activities'],
    [
        ['1. Discovery and branding', 'Week 1',
         'Confirm colours, logo usage, and identity; agree the content checklist; '
         'collect programme and fee data from the registrar and accounts office.'],
        ['2. Content and data loading', 'Weeks 2–3',
         'Load all twenty-one programmes, fee structures, campus details, staff '
         'accounts, and the initial news and gallery content.'],
        ['3. Staging review', 'Weeks 3–4',
         'Management walks through the fully populated staging site; feedback is '
         'collected, prioritised, and implemented.'],
        ['4. Training and handover', 'Weeks 4–5',
         'Role-based training for administrators, lecturers, and student '
         'representatives; delivery of documentation and admin credentials.'],
        ['5. Go-live', 'Week 6',
         'Connect the college domain, switch on production, seed official student '
         'and staff records, and announce the launch.'],
        ['6. Post-launch support', 'Weeks 6–8',
         'On-call assistance during the first weeks of real use, fixes, and tuning '
         'based on live feedback from staff and students.'],
    ],
    [0.22, 0.13, 0.65]))
story.append(Paragraph('Table 8 — Delivery phases from sign-off to steady-state operation.', caption_st))
story.append(Spacer(1, 4))
story.append(P(
    'The critical path is content availability: the faster official programme, '
    'fee, and staff data can be confirmed, the earlier the college can go live. '
    'No phase requires the college to procure hardware or software; everything '
    'runs on managed cloud infrastructure.'))

# ================================================================ 8. HOSTING & SUPPORT
story += h1_block('8. Hosting, Support and Maintenance', P(
    'Beyond the one-off investment, operating the platform involves two '
    'predictable recurring costs. Together they keep the system online, current, '
    'and supported, and they are structured so the college always knows its '
    'annual commitment in advance.'))
story.append(styled_table(
    ['Item', 'Frequency', 'Cost'],
    [
        ['Hosting (Vercel and managed PostgreSQL)', 'Per year', 'KES 10,000'],
        ['Maintenance and support', 'Per year — KES 3,000 per month', 'KES 36,000'],
        ['<b>Total recurring</b>', '<b>Annual commitment</b>', '<b>KES 46,000</b>'],
    ],
    [0.46, 0.28, 0.26], aligns=['L', 'L', 'C'], total_row=True))
story.append(Paragraph('Table 9 — Recurring costs.', caption_st))
story += h2_block('What the recurring costs cover')
story += bullets([
    'Continued hosting on Vercel with global content delivery, HTTPS, and '
    'automatic database provisioning and backups.',
    'Technical support for staff questions and incident response during business '
    'hours.',
    'Software updates, security patches, and compatibility maintenance for the '
    'platform and its dependencies.',
    'Minor content and feature adjustments as the college\'s needs evolve, within '
    'the monthly support allowance.',
])
story.append(Spacer(1, 4))
story.append(P(
    'There are no per-student charges and no hidden licence fees: the platform '
    'grows with the college at a flat, budgetable rate.'))

# ================================================================ 9. NEXT STEPS
story += h1_block('9. Next Steps and Contacts', P(
    'The distance between today and a live, branded KIP College System is short '
    'and mostly administrative. We recommend the following sequence:'))
story += bullets([
    '<b>1. Explore the live demo.</b> Visit https://kip-college-system.vercel.app and '
    'sign in with the three demo accounts in Section 4.',
    '<b>2. Confirm branding assets.</b> Provide the logo files, preferred colours, '
    'and any photography guidelines for application across the platform.',
    '<b>3. Nominate a content owner.</b> Identify the staff member who will confirm '
    'programme details, fees, campus information, and staff accounts.',
    '<b>4. Sign off and initiate.</b> Execute the agreement and the first milestone '
    'payment (KES 32,000) to open the delivery calendar.',
    '<b>5. Review staging and go live.</b> Walk through the staged system with your '
    'content loaded, then launch on the college\'s own domain.',
])
story.append(Spacer(1, 10))
story.append(callout_box(
    '<b>Contacts.</b> Email: info@kipskitui.com  ·  '
    'Telephone: +254 703 710 879 (to be verified by owner)  ·  '
    'Live demo: https://kip-college-system.vercel.app'))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Note: telephone numbers and fee figures quoted in this proposal are pending '
    'final verification by the college owner and will be confirmed before sign-off.',
    footnote_st))
story.append(Spacer(1, 6))
story.append(P(
    'We thank the management of Kitui Institute of Professionals for the '
    'opportunity to present this proposal, and we look forward to handing over the '
    'keys to a platform that will serve the college\'s students and staff for '
    'years to come.'))

# ---------------------------------------------------------------- build
doc = TocDocTemplate(
    OUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
    title=DOC_TITLE, author='Z.ai', creator='Z.ai',
    subject='Technology proposal for the KIP College System digital campus platform')
doc.multiBuild(story)
print('body pages written to', OUT)
