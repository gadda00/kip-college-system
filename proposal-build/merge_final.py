#!/usr/bin/env python3
"""Merge Crystal Blue cover + ReportLab body into the final proposal PDF."""
import os

from pypdf import PdfReader, PdfWriter

HERE = os.path.dirname(os.path.abspath(__file__))
COVER = os.path.join(HERE, 'cover.pdf')
BODY = os.path.join(HERE, 'body.pdf')
OUT = '/home/z/my-project/public/downloads/KIP-College-System-Proposal.pdf'

A4_W, A4_H = 595.28, 841.89


def normalize_page_to_a4(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.1 or abs(h - A4_H) > 0.1:
        page.scale_to(A4_W, A4_H)
    return page


writer = PdfWriter()
writer.add_page(normalize_page_to_a4(PdfReader(COVER).pages[0]))
for page in PdfReader(BODY).pages:
    writer.add_page(normalize_page_to_a4(page))
writer.add_metadata({
    '/Title': 'KIP College System — Technology Proposal',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Technology proposal for the KIP College System digital campus platform '
                '(Kitui Institute of Professionals)',
})
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'wb') as f:
    writer.write(f)
print('final:', OUT, '| pages:', len(writer.pages))
