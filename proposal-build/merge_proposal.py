#!/usr/bin/env python3
"""Merge cover + body into the final KIP College proposal PDF."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89

def normalize(page):
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    if abs(w - A4_W) > 0.5 or abs(h - A4_H) > 0.5:
        page.scale_to(A4_W, A4_H)
    return page

writer = PdfWriter()
writer.add_page(normalize(PdfReader('/home/z/my-project/proposal-build/cover.pdf').pages[0]))
for pg in PdfReader('/home/z/my-project/proposal-build/body.pdf').pages:
    writer.add_page(normalize(pg))
writer.add_metadata({
    '/Title': 'KIP College - Website & College Management System Proposal',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Project proposal for the KIP College website and college management system',
})
with open('/home/z/my-project/download/KIP-College-System-Proposal.pdf', 'wb') as f:
    writer.write(f)
print('FINAL OK -> /home/z/my-project/download/KIP-College-System-Proposal.pdf')
