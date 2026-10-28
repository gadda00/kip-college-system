# proposal-build — KIP College deliverables regeneration sources

Task ID 16 (deliverables regeneration). Everything needed to regenerate the two
client-facing deliverables lives in this folder. Canonical entrypoints:

| Deliverable | Output path | Regenerate with |
|---|---|---|
| Proposal PDF (~11 pages, A4, blue institutional theme) | `/home/z/my-project/public/downloads/KIP-College-System-Proposal.pdf` | `python3 proposal-build/generate_proposal.py` (after re-rendering the cover, below) |
| Presentation PPTX (14 slides, 16:9, matching blue theme) | `/home/z/my-project/public/downloads/KIP-College-System-Presentation.pptx` | `node skills/pptx/batch_html2pptx.js proposal-build/slides <output.pptx>` (see full command below) |

## Layout

```
proposal-build/
├── cover.html                # Proposal cover source (pdf skill Template 07 "Crystal Blue")
├── generate_proposal.py      # ReportLab body + cover merge + metadata (single command)
├── slides/                   # PPTX deck sources (pptx skill HTML pipeline)
│   ├── global.css            # Deck-wide palette + typography tokens (matches PDF palette)
│   ├── slides_brief.json     # Slide manifest (14 slides, order = array order)
│   └── slide_01..14.html     # One 1280x720 standalone HTML page per slide
├── build/                    # Intermediate artifacts (cover.pdf, body.pdf, previews)
└── worklog-entry-16.md       # Work record for integration into worklog.md
```

## Full regeneration sequence

```bash
PDF_SKILL=/home/z/my-project/skills/pdf
PPTX_SKILL=/home/z/my-project/skills/pptx

# 1. Proposal cover (HTML -> single-page vector PDF, A4 width)
node "$PDF_SKILL/scripts/html2poster.js" proposal-build/cover.html \
     --output proposal-build/build/cover.pdf --width 794px

# 2. Proposal body + merge + metadata (script prints final page count)
python3 "$PDF_SKILL/scripts/pdf.py" code.sanitize proposal-build/generate_proposal.py
python3 proposal-build/generate_proposal.py
python3 "$PDF_SKILL/scripts/pdf.py" meta.brand \
     /home/z/my-project/public/downloads/KIP-College-System-Proposal.pdf

# 3. Presentation (walks slide_*.html in sorted order -> one .pptx)
cd /home/z/my-project && NODE_PATH=/usr/local/lib/node_modules \
  node "$PPTX_SKILL/batch_html2pptx.js" /home/z/my-project/proposal-build/slides \
  /home/z/my-project/public/downloads/KIP-College-System-Presentation.pptx
```

Post-build QA (already run on the shipped files):

```bash
python3 "$PDF_SKILL/scripts/pdf_qa.py" public/downloads/KIP-College-System-Proposal.pdf
python3 "$PDF_SKILL/scripts/pdf.py" toc.check public/downloads/KIP-College-System-Proposal.pdf
python3 "$PDF_SKILL/scripts/pdf.py" font.check public/downloads/KIP-College-System-Proposal.pdf
```

## Design decisions (keep these when editing)

- **Palette — pdf skill Template 07 "Crystal Blue" (fixed, per typesetting/cover.md):**
  cover dark `#0a1628` + luminous accent `#4da8da`; body light-blue `#f5f8fc`,
  table header `#1a4a7a`, accent `#2d7ab3`, text `#142840`, muted `#5a7a96`,
  border `#c0d0e2`, stripe `#eef3fa`, card `#e4ecf5`. The PPTX `slides/global.css`
  uses the same values so the two deliverables match.
- **Pricing is contractual and must not drift:** one-off KES 64,000
  (15,000 + 22,000 + 18,000 + 9,000); milestones 50/25/25 = 32,000 + 16,000 + 16,000;
  recurring hosting 10,000/yr, maintenance & support 36,000/yr (KES 3,000/month).
- Live URL `https://kip-college-system.vercel.app` and the three demo accounts
  (admin/lecturer/student @kipskitui.com) appear in both deliverables.
- Phone `+254 703 710 879` is always flagged "to be verified by owner", and both
  documents carry the footnote that phone numbers and fee figures are pending
  owner verification.
- Note: `build_proposal.py`, `merge_final.py`, `body.pdf`, `cover.pdf` and
  `preview_p*.png` at this folder's root are artifacts from an earlier build
  session; `generate_proposal.py` + `build/` are the canonical current pipeline.

## Verification snippet (run after any regeneration)

```python
import fitz  # PDF
text = "\n".join(p.get_text() for p in fitz.open("public/downloads/KIP-College-System-Proposal.pdf"))
assert "https://kip-college-system.vercel.app" in text and "64,000" in text

from pptx import Presentation  # PPTX
prs = Presentation("public/downloads/KIP-College-System-Presentation.pptx")
blob = "\n".join(r.text for s in prs.slides for sh in s.shapes if sh.has_text_frame
                 for p in sh.text_frame.paragraphs for r in p.runs)
assert "https://kip-college-system.vercel.app" in blob and "64,000" in blob
```
