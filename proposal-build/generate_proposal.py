#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KIP College System — Proposal PDF generator (body + cover merge).

Pipeline (per pdf skill / briefs/report.md):
  1. Body PDF via ReportLab (TocDocTemplate + multiBuild, auto TOC, no cover in story)
  2. Cover PDF pre-rendered separately via html2poster.js (Template 07 Crystal Blue)
  3. Merge cover as page 0 via pypdf (normalize to A4) -> final single PDF

Palette: Template 07 "Crystal Blue" fixed body palette (typesetting/cover.md).
Template 07 spec: "the palette is fixed (not auto-generated). Copy the body
palette values directly from the table above." -> blue institutional theme.

Chapter numbering plan (Step 3.5, report.md):
  | Outline | Type    | Chapter | Title                                    |
  | 1       | cover   |   -     | Cover (separate PDF, merged as page 0)   |
  | 2       | toc     |   -     | Table of Contents                        |
  | 3       | content |   1     | Executive Summary                        |
  | 4       | content |   2     | About Kitui Institute of Professionals   |
  | 5       | content |   3     | The Proposed Solution                    |
  | 6       | content |   4     | See It Live: Try the Platform Today      |
  | 7       | content |   5     | Technology & Security                    |
  | 8       | content |   6     | Investment & Payment Schedule            |
  | 9       | content |   7     | Recurring Costs: Hosting & Support       |
  | 10      | content |   8     | Delivery Timeline                        |
  | 11      | content |   9     | Next Steps & Contacts                    |
"""
import hashlib
import os
import sys

from PIL import Image as PILImage

SKILL_SCRIPTS = '/home/z/my-project/skills/pdf/scripts'
if SKILL_SCRIPTS not in sys.path:
    sys.path.insert(0, SKILL_SCRIPTS)

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (CondPageBreak, HRFlowable, Image as RLImage,
                                KeepTogether, PageBreak, Paragraph,
                                SimpleDocTemplate, Spacer, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------- fonts
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
try:
    pdfmetrics.registerFont(TTFont('Noto Sans SC', f'{FONT_DIR}/truetype/chinese/NotoSansSC[wght].ttf'))
    pdfmetrics.registerFont(TTFont('Noto Sans SC Bold', f'{FONT_DIR}/truetype/chinese/NotoSansSC[wght].ttf'))
except Exception:
    pass
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

from pdf import install_font_fallback  # noqa: E402  (skill helper)
install_font_fallback()

# ------------------------------------------------- palette (Template 07)
PAGE_BG      = colors.HexColor('#f5f8fc')   # XL ultra-light blue-white
SECTION_BG   = colors.HexColor('#edf2f9')   # XL light blue-gray
CARD_BG      = colors.HexColor('#e4ecf5')   # L  soft blue card
TABLE_STRIPE = colors.HexColor('#eef3fa')   # L  subtle blue row
HEADER_FILL  = colors.HexColor('#1a4a7a')   # M  deep blue (bridges to cover)
BORDER       = colors.HexColor('#c0d0e2')   # S  blue-gray lines
ACCENT       = colors.HexColor('#2d7ab3')   # XS accent (= cover glow color)
TEXT_PRIMARY = colors.HexColor('#142840')   # deep blue-black
TEXT_MUTED   = colors.HexColor('#5a7a96')   # blue-gray secondary
TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ---------------------------------------------------------------- layout
PAGE_W, PAGE_H = A4
MARGIN = 54.0                      # symmetric left/right (overflow.md 1.5)
TOP_MARGIN, BOTTOM_MARGIN = 66.0, 58.0
AVAIL_W = PAGE_W - 2 * MARGIN      # ~487pt
AVAIL_H = PAGE_H - TOP_MARGIN - BOTTOM_MARGIN
H1_COND_BREAK = AVAIL_H * 0.25     # pagination.md rule 4

DOC_TITLE = 'KIP College System Proposal'
PREPARED_FOR = 'Prepared for Kitui Institute of Professionals'

# ---------------------------------------------------------------- styles
body = ParagraphStyle('Body', fontName='FreeSerif', fontSize=10.5, leading=17,
                      alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
                      spaceBefore=0, spaceAfter=8)
lead = ParagraphStyle('Lead', parent=body, fontSize=11, leading=18)
h1 = ParagraphStyle('H1x', fontName='FreeSerif', fontSize=22, leading=27,
                    textColor=HEADER_FILL, spaceBefore=6, spaceAfter=2)
h2 = ParagraphStyle('H2x', fontName='FreeSerif', fontSize=15, leading=20,
                    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=7)
h3 = ParagraphStyle('H3x', fontName='FreeSerif', fontSize=11.5, leading=16,
                    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6)
bullet = ParagraphStyle('Bullet', parent=body, alignment=TA_LEFT,
                        leftIndent=16, bulletIndent=4, spaceAfter=5,
                        bulletFontName='FreeSerif', bulletFontSize=10.5)
numbered = ParagraphStyle('Numbered', parent=body, alignment=TA_LEFT,
                          leftIndent=20, bulletIndent=4, spaceAfter=6,
                          bulletFontName='FreeSerif', bulletFontSize=10.5)
caption = ParagraphStyle('Caption', fontName='FreeSerif', fontSize=8.5,
                         leading=12, textColor=TEXT_MUTED, alignment=TA_CENTER,
                         spaceBefore=3, spaceAfter=6)
quote = ParagraphStyle('Quote', fontName='FreeSerif-Italic', fontSize=11,
                       leading=17.5, textColor=HEADER_FILL, alignment=TA_LEFT,
                       leftIndent=10, spaceAfter=0)
footnote = ParagraphStyle('Footnote', fontName='FreeSerif-Italic', fontSize=8.5,
                          leading=12.5, textColor=TEXT_MUTED, alignment=TA_LEFT)
tbl_head = ParagraphStyle('TblHead', fontName='FreeSerif', fontSize=9.5,
                          leading=13, textColor=TABLE_HEADER_TEXT,
                          alignment=TA_CENTER)
tbl_cell = ParagraphStyle('TblCell', fontName='FreeSerif', fontSize=9.5,
                          leading=13, textColor=TEXT_PRIMARY,
                          alignment=TA_LEFT)
tbl_cell_c = ParagraphStyle('TblCellC', parent=tbl_cell, alignment=TA_CENTER)
tbl_cell_r = ParagraphStyle('TblCellR', parent=tbl_cell, alignment=TA_RIGHT)
tbl_cell_mono = ParagraphStyle('TblCellMono', parent=tbl_cell, fontSize=9.5)
stat_big = ParagraphStyle('StatBig', fontName='FreeSerif', fontSize=17,
                          leading=21, textColor=ACCENT, alignment=TA_CENTER)
stat_lbl = ParagraphStyle('StatLbl', fontName='FreeSerif', fontSize=8.5,
                          leading=11, textColor=TEXT_MUTED, alignment=TA_CENTER)
url_big = ParagraphStyle('UrlBig', fontName='FreeSerif', fontSize=16, leading=20,
                         textColor=ACCENT, alignment=TA_CENTER)
toc_l0 = ParagraphStyle('TOCH1', fontName='FreeSerif', fontSize=11.5,
                        leading=20, leftIndent=6, textColor=TEXT_PRIMARY)
toc_l1 = ParagraphStyle('TOCH2', fontName='FreeSerif', fontSize=10,
                        leading=16, leftIndent=26, textColor=TEXT_MUTED)
toc_title = ParagraphStyle('TOCTitle', fontName='FreeSerif', fontSize=22,
                           leading=27, textColor=HEADER_FILL, spaceAfter=4)

MAX_KEEP_HEIGHT = A4[1] * 0.4


def safe_keep_together(elements):
    """Cap KeepTogether height (report.md anti-tear rule)."""
    total_h = 0
    for el in elements:
        try:
            _, hgt = el.wrap(AVAIL_W, PAGE_H)
        except Exception:
            hgt = 0
        total_h += hgt
    if total_h <= MAX_KEEP_HEIGHT:
        return [KeepTogether(elements)]
    if len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)


def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


def h1_block(text, first_flowable=None):
    """H1 + accent underline rule (+ optionally the first following flowable)."""
    rule = HRFlowable(width='100%', thickness=1.2, color=ACCENT,
                      spaceBefore=2, spaceAfter=10)
    group = [add_heading(text, h1, level=0), rule]
    if first_flowable is not None:
        group.append(first_flowable)
    return [CondPageBreak(H1_COND_BREAK)] + safe_keep_together(group)


def h2_block(text, first_flowable=None):
    """H2 sub-heading (level-1 TOC entry) kept with its first flowable."""
    group = [add_heading(text, h2, level=1)]
    if first_flowable is not None:
        group.append(first_flowable)
    return safe_keep_together(group)


def make_table(header_row, rows, ratios, aligns=None, total_row=None):
    """Standard skill-compliant table: Paragraph cells, centered, striped."""
    n = len(header_row)
    aligns = aligns or ['L'] * n
    stylemap = {'L': tbl_cell, 'C': tbl_cell_c, 'R': tbl_cell_r}
    col_widths = [r * AVAIL_W for r in ratios]
    assert sum(col_widths) <= AVAIL_W + 0.5, 'table exceeds available width'
    data = [[Paragraph('<b>%s</b>' % c, tbl_head) for c in header_row]]
    for row in rows:
        data.append([Paragraph(c, stylemap[aligns[i]]) for i, c in enumerate(row)])
    if total_row is not None:
        data.append([Paragraph('<b>%s</b>' % c, stylemap[aligns[i]])
                     for i, c in enumerate(total_row)])
    t = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('BOX', (0, 0), (-1, -1), 0.9, HEADER_FILL),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    n_body = len(rows)
    for i in range(1, n_body + 1):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style.append(('BACKGROUND', (0, i), (-1, i), bg))
    if total_row is not None:
        style.append(('BACKGROUND', (0, -1), (-1, -1), CARD_BG))
        style.append(('LINEABOVE', (0, -1), (-1, -1), 1.0, HEADER_FILL))
    t.setStyle(TableStyle(style))
    return t


def callout(flowables, width_ratio=1.0, pad=12):
    """Accent-left-border callout box on a light tint background."""
    t = Table([[flowables]], colWidths=[AVAIL_W * width_ratio], hAlign='CENTER')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('LINEBEFORE', (0, 0), (0, -1), 3, ACCENT),
        ('LEFTPADDING', (0, 0), (-1, -1), pad + 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), pad),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t


def stat_row(stats):
    """Row of metric callout cells (data-to-ink rule, report.md)."""
    cells, widths = [], []
    for value, label in stats:
        inner = [Paragraph('<b>%s</b>' % value, stat_big),
                 Paragraph(label, stat_lbl)]
        cells.append(inner)
        widths.append(AVAIL_W / len(stats))
    t = Table([cells], colWidths=widths, hAlign='CENTER')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.9, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


def bulletize(items, style=bullet, numbered_list=False):
    out = []
    for i, it in enumerate(items):
        marker = ('%d.' % (i + 1)) if numbered_list else '\u2022'
        out.append(Paragraph(it, style, bulletText=marker))
    return out


# ------------------------------------------------- live-site screenshot plates
SHOTS_DIR = '/home/z/my-project/proposal-build/screenshots-final'


def _shot_image(fname, width):
    """Framed screenshot (thin border, white matte) at the given width."""
    path = os.path.join(SHOTS_DIR, fname)
    with PILImage.open(path) as im:
        w, h = im.size
    ih = width * h / float(w)
    img = RLImage(path, width=width - 6, height=ih * (width - 6) / float(width))
    frm = Table([[img]], colWidths=[width])
    frm.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))
    return frm


def shot_cell(fname, caption_text, width):
    """One screenshot + its caption, as a list of flowables for a table cell."""
    return [_shot_image(fname, width), Paragraph(caption_text, caption)]


def shot_row(pairs, gap=16):
    """Row of framed screenshots (2- or 3-up) as a single flowable."""
    n = len(pairs)
    w = (AVAIL_W - gap * (n - 1)) / float(n)
    cells = [shot_cell(f, c, w) for f, c in pairs]
    t = Table([cells], colWidths=[w + (gap if i < n - 1 else 0) for i in range(n)])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t


def shot_plate(pairs, gap=16, lead_paragraph=None):
    """A keep-together plate: optional lead + one row of screenshots."""
    parts = ([lead_paragraph] if lead_paragraph else []) + [shot_row(pairs, gap)]
    return KeepTogether(parts)


# ------------------------------------------------- doc template (TOC gate)
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            # TOC shows the VISIBLE page number (body Arabic numbering resets
            # to 1 after the roman-numbered TOC page, pagination.md section 6).
            self.notify('TOCEntry', (level, text, self.page - 1, key))


def page_furniture(canvas, doc):
    """Page background + header + footer (report.md component reference).

    Pagination scheme (pagination.md section 6): body-PDF page 1 is the TOC
    (front matter, roman 'i'); content pages show Arabic numbers reset to 1.
    The cover is merged in front afterwards and carries no number.
    """
    canvas.saveState()
    # Layer 0: page background (Template 07 light-blue body)
    canvas.setFillColor(PAGE_BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Header: title left + accent rule
    canvas.setFont('FreeSerif', 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, PAGE_H - 40, DOC_TITLE.upper())
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(MARGIN, PAGE_H - 46, PAGE_W - MARGIN, PAGE_H - 46)
    # Footer: light rule + author left + page number right
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 44, PAGE_W - MARGIN, 44)
    canvas.setFont('FreeSerif', 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, 32, PREPARED_FOR)
    if doc.page == 1:
        num = 'i'                      # TOC page (front matter)
    else:
        num = str(doc.page - 1)        # body resets to Arabic 1
    canvas.drawRightString(PAGE_W - MARGIN, 32, num)
    canvas.restoreState()


# ---------------------------------------------------------------- content
LIVE_URL = 'https://kip-college-system.vercel.app'
story = []

# ---- Table of Contents (front matter, roman i)
toc = TableOfContents()
toc.levelStyles = [toc_l0, toc_l1]
story.append(Paragraph('<b>Table of Contents</b>', toc_title))
story.append(HRFlowable(width='100%', thickness=1.2, color=ACCENT,
                        spaceBefore=2, spaceAfter=14))
story.append(toc)
story.append(PageBreak())

# ============================================================ 1. Executive Summary
p = Paragraph(
    'Kitui Institute of Professionals (KIP) is a growing tertiary college in '
    'Kitui County, Kenya, delivering more than 21 examinable programmes across '
    'three campuses in Kitui Town, the Kitui CBD and Mwingi Town. As enrolment '
    'grows, the college coordination that once fit in a register book and a '
    'filing cabinet now strains under its own weight: applications arrive by '
    'phone and in person, fee balances are reconciled manually, results move '
    'between campuses on paper, and families cannot see progress without '
    'travelling to a campus. Each of these frictions slows staff down and '
    'weakens the college presentation to prospective students.', lead)
story.extend(h1_block('1. Executive Summary', p))
story.append(Paragraph(
    'This proposal puts forward a complete, integrated college management '
    'system for KIP: a public website, online admissions with unique '
    'application reference numbers, a student portal, a lecturer workspace, a '
    'full administrative console, and an AI study assistant. Crucially, this '
    'is not a promise of software to come. The platform has already been '
    'built, deployed and is running live on the internet at the address shown '
    'below, backed by a managed PostgreSQL database. Every feature described '
    'in this document can be inspected and tested today, before any '
    'commitment is made.', body))
story.append(Spacer(1, 8))
story.append(stat_row([
    ('21+', 'Programmes across 3 categories'),
    ('3', 'Campuses, one central system'),
    ('KES 64,000', 'Total one-off investment'),
    ('6\u20138', 'Weeks to full handover'),
]))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'The sections that follow introduce the institution, walk through the '
    'platform module by module, provide live demo credentials for each user '
    'role, describe the technology and security foundation, and set out the '
    'investment: a one-off cost of KES 64,000, recurring hosting of KES '
    '10,000 per year, and maintenance and support at KES 36,000 per year '
    '(KES 3,000 per month). A six-phase delivery plan of roughly six to eight '
    'weeks takes the college from sign-off to a fully branded, staff-trained '
    'go-live.', body))
story.append(Spacer(1, 4))
story.extend(h2_block('1.1 What changes for each stakeholder'))
story.append(Paragraph(
    'A platform is only worth owning if it improves the daily experience of '
    'the people who use it. The table below summarises the practical change '
    'each group of stakeholders will feel in the first term after go-live.',
    body))
story.append(Spacer(1, 6))
stake_tbl = make_table(
    ['Stakeholder', 'What changes for them'],
    [
        ['Prospective students & families',
         'Discover programmes and apply online from any phone; receive an '
         'application reference number instantly instead of travelling to a '
         'campus to hand in forms'],
        ['Students',
         'Check fees, results, timetable and learning materials themselves '
         'anytime, with an AI study assistant for revision'],
        ['Lecturers',
         'Marks entered once, saved safely as drafts, published when ready; '
         'class rosters always current'],
        ['Administration & finance',
         'One console for applications, students, fees, payments, results '
         'moderation, news and timetables across all three campuses'],
        ['Management',
         'A single source of truth and an audit trail that shows who did '
         'what, and when'],
    ],
    ratios=[0.28, 0.72], aligns=['L', 'L'])
story.extend(safe_keep_together([stake_tbl, Paragraph(
    'Table 1: Stakeholder outcomes after go-live.', caption)]))

# ============================================================ 2. About KIP
p = Paragraph(
    'Kitui Institute of Professionals serves eastern Kenya with practical, '
    'industry-facing tertiary education. The college prepares students for '
    'credentials examined by several national and professional bodies, and it '
    'operates from three locations, each serving a distinct community. This '
    'footprint is a strength in the market, but it multiplies administrative '
    'work: every additional campus adds another place where applications, '
    'fee records, timetables and results must be collected, reconciled and '
    'shared.', body)
story.extend(h1_block('2. About Kitui Institute of Professionals', p))
story.append(Spacer(1, 6))
campus_tbl = make_table(
    ['Campus', 'Location', 'Setting'],
    [
        ['Main Campus', '100 m from Wikililye, Mulango Road, Kitui', 'Kitui Town'],
        ['Town Campus', 'Muli Mall Building, Kitui CBD', 'Central business district'],
        ['Mwingi Campus', 'Sunrise Building, Mwingi Town', 'Mwingi Town'],
    ],
    ratios=[0.22, 0.50, 0.28], aligns=['L', 'L', 'L'])
story.extend(safe_keep_together([campus_tbl, Paragraph(
    'Table 2: KIP campuses served by the platform.', caption)]))
story.append(Paragraph(
    'The academic offering spans three categories and more than 21 '
    'programmes. <b>Technical</b> programmes cover ICT, engineering, '
    'hairdressing and beauty, and related craft and trade skills. '
    '<b>Business</b> programmes cover commercial and office practice '
    'disciplines. <b>KASNEB professional</b> programmes cover the CPA '
    'qualification together with CAMS and ATD, examined by KASNEB. '
    'Beyond KASNEB, courses are examined by KNEC, NITA and TVET-CDACC, '
    'which means records, grading and certification workflows must respect '
    'several examining bodies at once. A central digital system is the '
    'practical answer for a multi-campus, multi-exam-body college: one '
    'source of truth for students, staff and management, accessible from '
    'every campus and from home.', body))
story.extend(h2_block('2.1 Why now'))
story.append(Paragraph(
    'Today’s students and parents do most of their lives on a phone: '
    'money, news, school fees and government services included. A college '
    'that can only be reached in person during office hours competes with '
    'institutions that answer questions at midnight and accept applications '
    'on a Sunday. The gap is not about prestige; it is about expectations. '
    'At the same time, staff time is the college’s scarcest resource, and '
    'every hour spent re-copying marks or reconciling a fee ledger is an '
    'hour not spent teaching or recruiting. Moving these processes online '
    'frees that time immediately, and the timing is good: the platform is '
    'already built and demonstrable, so the college can act this term rather '
    'than budget for a multi-year custom build.', body))

# ============================================================ 3. The Proposed Solution
p = Paragraph(
    'The proposed platform is one integrated system rather than a loose '
    'collection of tools. Every module shares a single database and a single '
    'sign-on, so an application submitted online becomes a student record, '
    'which carries fees, results, a timetable and learning materials without '
    'any re-typing. Access is role-based: students, lecturers and '
    'administrators each see exactly the workspace appropriate to their '
    'responsibilities, and nothing else. The table below summarises the six '
    'modules and who uses them.', body)
story.extend(h1_block('3. The Proposed Solution', p))
story.append(Spacer(1, 6))
feature_tbl = make_table(
    ['Module', 'What it delivers', 'Primary users'],
    [
        ['Public website',
         'Programme catalogue, campus and contact information, news and '
         'announcements, admission calls-to-action',
         'Prospective students, parents, the public'],
        ['Online admissions',
         'Guided application wizard with validation, unique application '
         'reference numbers for every submission, duplicate prevention, '
         'next-steps guidance',
         'Applicants, admissions / registrar'],
        ['Student portal',
         'Personal dashboard, fee statements and balances, published '
         'results, timetable, learning materials',
         'Students'],
        ['Lecturer workspace',
         'Class rosters, marks entry with a draft-to-publish workflow that '
         'keeps incomplete marks hidden from students',
         'Lecturers, heads of department'],
        ['Admin console',
         'Students, applications, courses, fees and payments, results '
         'moderation, news and announcements content management, timetable '
         'management',
         'Administrators, registrar, finance'],
        ['AI study assistant',
         'An on-demand study helper inside the portal that answers course '
         'questions and guides revision',
         'Students'],
    ],
    ratios=[0.20, 0.50, 0.30], aligns=['L', 'L', 'L'])
story.extend(safe_keep_together([feature_tbl, Paragraph(
    'Table 3: Platform modules at a glance.', caption)]))
story.append(Paragraph(
    'Two design decisions deserve emphasis. First, results follow a strict '
    '<b>draft-to-publish</b> workflow: a lecturer can save work in progress, '
    'but students only ever see marks that have been reviewed and published. '
    'Second, news and announcements are managed centrally through a small '
    'content management system, so one notice posted by the administration '
    'appears consistently across all three campuses. Together these keep '
    'academic records trustworthy and keep every campus on the same page.', body))
story.extend(h2_block('3.1 The student journey, end to end'))
story.append(Paragraph(
    'One journey illustrates how the modules connect. A prospective student '
    'finds the college through the public website, browses the programme '
    'catalogue and starts the online application. The wizard validates every '
    'answer as it is entered, prevents duplicate submissions, and on '
    'completion issues a unique application reference number that the '
    'applicant can quote at any campus. When the admissions office accepts '
    'the application in the admin console, the applicant becomes a student '
    'record in the same database, ready for fees, a timetable and course '
    'enrolment. The student then logs into the portal to see a personal '
    'dashboard: fee statement and balance, published results as each batch '
    'is approved, the class timetable, and learning materials posted by '
    'lecturers. Lecturers work in parallel in their own workspace, entering '
    'marks as drafts and publishing them once checked, while the '
    'administration watches payments, moderates results and posts '
    'announcements for all campuses. Nothing is re-typed anywhere in the '
    'chain, and every step leaves a record in the audit trail.', body))

# ============================================================ 4. See It Live
p = Paragraph(
    'The platform is deployed on Vercel and is running now, with a '
    'persistent PostgreSQL database keeping all records safe between visits. '
    'The plates in Section 4.2 show the running system exactly as it stood '
    'in October 2026 — and you can go further than pictures: open the '
    'address below in any browser, on a phone or a computer, and explore the '
    'complete platform yourself.', body)
story.extend(h1_block('4. See It Live: Try the Platform Today', p))
url_para = Paragraph('<b>%s</b>' % LIVE_URL, url_big)
url_note = Paragraph('Live deployment \u00b7 running on Vercel with a '
                     'persistent PostgreSQL (Prisma Postgres) database',
                     ParagraphStyle('UrlNote', parent=stat_lbl, fontSize=9.5,
                                    leading=13))
story.append(callout([url_para, Spacer(1, 4), url_note]))
story.append(Spacer(1, 10))
story.append(Paragraph(
    'Three demo accounts are seeded so that you can experience the system '
    'exactly as each kind of user would. The accounts are for evaluation; '
    'all data behind them is sample data and will be replaced with the '
    'college\u2019s real records at handover.', body))
cred_tbl = make_table(
    ['Role', 'Email (username)', 'Password'],
    [
        ['Administrator', 'admin@kipskitui.com', 'Admin@123'],
        ['Lecturer', 'lecturer@kipskitui.com', 'Lecturer@123'],
        ['Student', 'student@kipskitui.com', 'Student@123'],
    ],
    ratios=[0.24, 0.44, 0.32], aligns=['L', 'L', 'L'])
story.extend(safe_keep_together([cred_tbl, Paragraph(
    'Table 4: Demo credentials for the live deployment.', caption)]))
story.append(Paragraph('<b>Suggested things to try</b>', h3))
story.extend(bulletize([
    'Log in as the <b>administrator</b>: review a submitted application and '
    'accept it, post a news announcement for all campuses, moderate results, '
    'and inspect fee payments.',
    'Log in as the <b>lecturer</b>: open a class roster, enter marks and save '
    'them as a draft, then publish them and watch them become visible to '
    'students only after publication.',
    'Log in as the <b>student</b>: check the fee balance and statement, view '
    'published results and the timetable, download learning materials, and '
    'ask the AI study assistant a question.',
    'Before logging in, submit a fresh application from the public site and '
    'receive your own unique application reference number.',
]))
story.extend(h2_block('4.1 Notes for the demonstration'))
story.append(Paragraph(
    'The demonstration works on any modern phone, tablet or computer; the '
    'interface adapts to the screen, and much of the college’s audience will '
    'first meet the system on a phone. If you submit a test application as '
    'suggested above, log in afterwards as the administrator to see it '
    'arrive in the applications queue, then accept it and watch it become a '
    'student record. When the demonstration is complete, all test data can '
    'be cleared so that go-live starts from a clean, branded system loaded '
    'only with the college’s real programmes and staff accounts.', body))

story.extend(h2_block('4.2 The platform in pictures'))
story.append(Paragraph(
    'The following plates were captured directly from the live deployment '
    'while signed in with each of the three demo accounts. They show the '
    'sapphire-and-gold visual identity applied consistently across the '
    'public website, all three portals, mobile screens and dark mode.', body))
story.append(Spacer(1, 4))
story.append(shot_plate([
    ('01-home-top.png',
     'Plate 1: The public homepage — sapphire and gold identity, live intake '
     'countdown, programme finder and news.'),
]))
story.append(Spacer(1, 10))
story.append(shot_plate([
    ('03-academics.png',
     'Plate 2: Programme finder — every course, filterable by grade, campus and cost.'),
    ('12-apply.png',
     'Plate 3: The online application wizard with step-by-step validation.'),
]))
story.append(PageBreak())
story.append(shot_plate([
    ('17-student-portal.png',
     'Plate 4: The student portal dashboard — fees, results, timetable and '
     'announcements at a glance.'),
    ('18-student-fees.png',
     'Plate 5: The fee statement — balance, M-Pesa payment submissions and '
     'full transaction history.'),
]))
story.append(Spacer(1, 10))
story.append(shot_plate([
    ('23-lecturer-portal.png',
     'Plate 6: The lecturer workspace — class rosters and marks entry with a '
     'draft-to-publish workflow.'),
    ('25-admin-overview.png',
     'Plate 7: The admin console — enrolment, fee collection and results '
     'oversight in one screen.'),
]))
story.append(Spacer(1, 10))
story.append(shot_plate([
    ('33-mobile-home.png',
     'Plate 8: The homepage on a phone.'),
    ('34-mobile-portal.png',
     'Plate 9: The student portal on a phone.'),
    ('35-mobile-fees.png',
     'Plate 10: The fee statement on a phone.'),
], gap=14))
story.append(Paragraph(
    'Every screen shown is responsive, works in dark mode, and was verified '
    'error-free in a full end-to-end pass — public pages, all three portals, '
    'application submission, contact form and the AI assistant — on the day '
    'this proposal was issued.', caption))

# ============================================================ 5. Technology & Security
p = Paragraph(
    'The system is built on a modern, well-supported technology stack, '
    'chosen so that any competent developer in Kenya can maintain it for '
    'years to come. The application is deployed on Vercel, a global hosting '
    'platform, with the PostgreSQL database automatically provisioned and '
    'managed alongside it; the college needs no server room, no on-site '
    'hardware and no dedicated IT staff to keep it online.', body)
story.extend(h1_block('5. Technology & Security', p))
stack_tbl = make_table(
    ['Layer', 'Technology'],
    [
        ['Application framework', 'Next.js 16 (React, server-side rendering)'],
        ['Language', 'TypeScript, strict mode'],
        ['Interface', 'Tailwind CSS with shadcn/ui components'],
        ['Database', 'PostgreSQL via Prisma Postgres (auto-provisioned, persistent)'],
        ['Hosting & deployment', 'Vercel, with continuous deployment from a version-controlled repository'],
    ],
    ratios=[0.30, 0.70], aligns=['L', 'L'])
story.extend(safe_keep_together([stack_tbl, Paragraph(
    'Table 5: Technology stack summary.', caption)]))
story.append(Paragraph(
    'Security was designed in from the start rather than bolted on. Every '
    'route in the system is protected by a combination of the measures '
    'below, and the platform ships with an audit trail so that '
    'administrators can review who did what and when.', body))
story.extend(bulletize([
    '<b>Role-based access control</b>: admin, lecturer and student '
    'boundaries are enforced on the server, not just hidden in the '
    'interface.',
    '<b>Rate limiting</b>: login attempts, password changes, application '
    'submissions and assistant queries are throttled to blunt brute-force '
    'attacks and abuse.',
    '<b>Audit trail</b>: security-relevant events, including logins, '
    'password changes, application decisions and results publication, are '
    'recorded for later review.',
    '<b>Secure sessions</b>: hardened session cookies, with expired '
    'sessions cleaned up automatically.',
    '<b>First-sign-in password change</b>: accounts provisioned by the '
    'registrar (including students enrolled from accepted applications) '
    'receive a random temporary password and must choose their own at first '
    'sign-in.',
    '<b>Strict input validation</b> on every form and API route, plus '
    'protective security headers on all responses.',
]))
story.extend(h2_block('5.1 Reliability, data ownership and backups'))
story.append(Paragraph(
    'Vercel runs the application on a global network with automatic scaling '
    'and HTTPS encryption everywhere, so pages stay fast even on modest '
    'mobile connections, and the managed PostgreSQL database persists every '
    'record between visits. The college owns its data outright: records can '
    'be exported at any time, and the application itself lives in a '
    'version-controlled repository whose full history shows every change '
    'ever made. The database is professionally managed and backed up as '
    'part of the hosting service, which means a lost laptop, a stolen '
    'office computer or a power cut in Kitui Town cannot take the college’s '
    'records with it. Nothing about the system ties the college to a '
    'single developer: the stack is mainstream, the code is documented, and '
    'any competent developer can take it over.', body))

# ============================================================ 6. Investment
p = Paragraph(
    'The total one-off investment to own this platform outright is '
    '<b>KES 64,000</b>, covering design and branding, development, content, '
    'testing and deployment, and staff training. There are no licence fees '
    'and no per-student charges, and the college keeps full control of its '
    'code and data. The breakdown is shown below.', body)
story.extend(h1_block('6. Investment & Payment Schedule', p))
inv_tbl = make_table(
    ['Item', 'What it covers', 'Amount (KES)'],
    [
        ['Design & branding', 'Visual identity for the platform, colour '
         'system, typography, layout polish', '15,000'],
        ['Platform development', 'Build, configuration and integration of '
         'all six modules on the live system', '22,000'],
        ['Content, testing & deployment', 'Real programme content, '
         'end-to-end testing, production deployment on Vercel', '18,000'],
        ['Training & handover', 'Staff training sessions, '
         'documentation, admin credentials and knowledge transfer', '9,000'],
    ],
    ratios=[0.26, 0.52, 0.22], aligns=['L', 'L', 'R'],
    total_row=['Total one-off investment', '', '64,000'])
story.extend(safe_keep_together([inv_tbl, Paragraph(
    'Table 6: One-off investment breakdown (total KES 64,000).', caption)]))
story.append(Paragraph(
    'Payment is staged against visible progress rather than paid up front. '
    'Half is due when the proposal is signed off, a quarter when the '
    'staging site with the college\u2019s own branding and content is '
    'delivered for review, and the final quarter at go-live, when the '
    'platform is fully operational and staff are trained.', body))
mile_tbl = make_table(
    ['Milestone', 'Trigger', 'Share', 'Amount (KES)'],
    [
        ['First payment', 'Proposal sign-off', '50%', '32,000'],
        ['Second payment', 'Staging delivery (branded, content-loaded review site)', '25%', '16,000'],
        ['Final payment', 'Go-live (fully operational, staff trained)', '25%', '16,000'],
    ],
    ratios=[0.20, 0.44, 0.12, 0.24], aligns=['L', 'L', 'C', 'R'],
    total_row=['Total', '', '100%', '64,000'])
story.extend(safe_keep_together([mile_tbl, Paragraph(
    'Table 7: Payment milestones.', caption)]))

# ============================================================ 7. Recurring costs
p = Paragraph(
    'Beyond the one-off investment, two recurring services keep the platform '
    'online and healthy. Hosting covers the Vercel deployment, the managed '
    'PostgreSQL database, the custom domain and SSL encryption. Maintenance '
    'and support covers updates, dependency and security patches, bug fixes, '
    'small content changes and a support channel for staff, billed at KES '
    '3,000 per month.', body)
story.extend(h1_block('7. Recurring Costs: Hosting & Support', p))
rec_tbl = make_table(
    ['Service', 'Frequency', 'Cost (KES)', 'What it includes'],
    [
        ['Hosting', 'Per year', '10,000',
         'Vercel hosting, managed PostgreSQL database, domain, SSL'],
        ['Maintenance & support', 'Per year (KES 3,000 per month)', '36,000',
         'Updates and patches, bug fixes, content tweaks, staff support channel'],
    ],
    ratios=[0.24, 0.24, 0.16, 0.36], aligns=['L', 'L', 'R', 'L'],
    total_row=['Total recurring', 'Per year', '', '46,000'])
story.extend(safe_keep_together([rec_tbl, Paragraph(
    'Table 8: Recurring costs after go-live.', caption)]))
story.append(Paragraph(
    'Both recurring items are payable annually and can be reviewed together '
    'each year as the college\u2019s needs grow. If the college prefers to '
    'start leanly, hosting alone keeps the platform public and available; '
    'the support retainer can be added at any point in the year.', body))

# ============================================================ 8. Timeline
p = Paragraph(
    'Because the platform already exists and is running, delivery is not a '
    'software construction project; it is a focused programme of branding, '
    'content, verification and training. The plan below spans approximately '
    'six to eight weeks from sign-off to a fully operational, staff-trained '
    'go-live, with the second and third payment milestones tied to staging '
    'delivery and go-live respectively.', body)
story.extend(h1_block('8. Delivery Timeline', p))
time_tbl = make_table(
    ['Phase', 'Focus', 'Timing'],
    [
        ['1. Discovery & sign-off', 'Confirm requirements, programme '
         'list, branding assets and fee figures; sign agreement; first '
         'milestone payment', 'Week 1'],
        ['2. Branding & design', 'Apply KIP identity across the site '
         'and portals; refine layouts and imagery', 'Weeks 1\u20132'],
        ['3. Configuration & data setup', 'Load real programmes, '
         'campuses, courses, fee structures and staff accounts', 'Weeks 2\u20134'],
        ['4. Content, testing & staging', 'Populate content, end-to-end '
         'testing, staging delivery for college review; second milestone '
         'payment', 'Weeks 5\u20136'],
        ['5. Training & handover', 'Train administrators, lecturers and '
         'front-desk staff; hand over credentials and documentation', 'Week 7'],
        ['6. Go-live & support transition', 'Cut over to production '
         'domain, monitor, transition to the support retainer; final '
         'milestone payment', 'Week 8'],
    ],
    ratios=[0.26, 0.56, 0.18], aligns=['L', 'L', 'L'])
story.extend(safe_keep_together([time_tbl, Paragraph(
    'Table 9: Six-phase delivery plan (approximately 6\u20138 weeks).', caption)]))

story.extend(h2_block('8.1 What the college supplies'))
story.append(Paragraph(
    'The plan above assumes a small number of inputs from the college, all '
    'of which are one-time tasks rather than ongoing work. In Phase 1 the '
    'college confirms the authoritative programme list with fee figures and '
    'the correct contact details, and supplies branding assets such as the '
    'logo and preferred colours. In Phase 3 the administration nominates '
    'the staff who need accounts, together with their roles, and agrees the '
    'fee structures to load for each programme. Everything else, from '
    'configuration and testing to deployment and training, is handled as '
    'part of the delivery. In practice a responsive college completes its '
    'inputs within a few working days of each request, which is why the '
    'eight-week end-to-end plan carries comfortable slack.', body))

# ============================================================ 9. Next steps
p = Paragraph(
    'The fastest route to value is a short decision loop. We recommend '
    'reviewing the live platform with two or three senior staff, confirming '
    'the facts listed for verification, then signing off so that branding '
    'and data work can begin immediately. The college can be running its '
    'own system before the next intake.', body)
story.extend(h1_block('9. Next Steps & Contacts', p))
story.extend(bulletize([
    'Explore the live platform at <b>%s</b> using the demo accounts in '
    'Section 4, ideally with the registrar, finance and a senior lecturer '
    'present.' % LIVE_URL,
    'Confirm the facts pending owner verification: contact telephone '
    'numbers, fee figures, and the authoritative programme list.',
    'Sign off this proposal and make the first milestone payment of KES '
    '32,000 so that Phase 1 can begin.',
    'Supply branding assets (logo, colours) and nominate staff for '
    'training in Phase 5.',
    'Approve the staging site at the second milestone and schedule go-live.',
], style=numbered, numbered_list=True))
story.append(Spacer(1, 6))
contact_callout = callout([
    Paragraph('<b>Contact for this proposal</b>',
              ParagraphStyle('CTitle', parent=body, alignment=TA_LEFT,
                             textColor=HEADER_FILL, spaceAfter=2)),
    Paragraph('Email: <b>info@kipskitui.com</b><br/>'
              'Phone: <b>+254 703 710 879</b> (to be verified by owner)',
              ParagraphStyle('CBody', parent=body, alignment=TA_LEFT,
                             spaceAfter=0)),
])
story.append(contact_callout)
story.append(Spacer(1, 14))
story.append(HRFlowable(width='30%', thickness=0.6, color=BORDER,
                        spaceBefore=2, spaceAfter=6, hAlign='LEFT'))
story.append(Paragraph(
    '* Note: telephone numbers and fee figures quoted in this proposal are '
    'pending verification by the college owner and should be confirmed '
    'before the document is circulated externally or used in marketing.',
    footnote))

# ---------------------------------------------------------------- build body
BUILD = '/home/z/my-project/proposal-build/build'
BODY_PDF = os.path.join(BUILD, 'body.pdf')
doc = TocDocTemplate(
    BODY_PDF, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
    title=DOC_TITLE + ' \u2014 Kitui Institute of Professionals',
    author='Z.ai', creator='Z.ai',
    subject='Proposal for the KIP College integrated college management system')
doc.multiBuild(story, onFirstPage=page_furniture, onLaterPages=page_furniture)
print('body built:', BODY_PDF)

# ---------------------------------------------------------------- merge cover
from pypdf import PdfReader, PdfWriter  # noqa: E402

A4_W, A4_H = 595.28, 841.89


def normalize_page_to_a4(page):
    box = page.mediabox
    w, hgt = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.1 or abs(hgt - A4_H) > 0.1:
        page.scale_to(A4_W, A4_H)
    return page


COVER_PDF = os.path.join(BUILD, 'cover.pdf')
FINAL_PDF = '/home/z/my-project/public/downloads/KIP-College-System-Proposal.pdf'
writer = PdfWriter()
writer.add_page(normalize_page_to_a4(PdfReader(COVER_PDF).pages[0]))
for page in PdfReader(BODY_PDF).pages:
    writer.add_page(normalize_page_to_a4(page))
writer.add_metadata({
    '/Title': 'KIP College System Proposal - Kitui Institute of Professionals',
    '/Author': 'Z.ai', '/Creator': 'Z.ai',
    '/Subject': 'Proposal for the KIP College integrated college management system',
})
with open(FINAL_PDF, 'wb') as f:
    writer.write(f)
n_pages = len(PdfReader(FINAL_PDF).pages)
size_kb = os.path.getsize(FINAL_PDF) / 1024
print('final: %s (%d pages, %.1f KB)' % (FINAL_PDF, n_pages, size_kb))
