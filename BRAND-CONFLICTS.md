# Brand brief vs. current site — open conflicts

Tracking each place where the current site diverges from the brief in
`AI4SMARTMFG_Launch Phase 1.docx`, plus alternates we want to revisit.
Resolve in batches once the site is live.

## Status legend
- **Resolved** — decision made, site reflects it.
- **Deferred** — we know we are off-brief, parked for a later pass.
- **Open** — needs a decision.

---

## Headline / hero

| Item | Brief | Current site | Status |
|------|-------|--------------|--------|
| H1 | "Practical AI for Small & Mid-Sized Manufacturers" | "AI that knows your factory." | Resolved — keeping current. Brief copy lives in `<title>` for SEO. |
| Subhead | "We make AI work for you" | "We make AI work for you." | Resolved. |
| Long value-prop | (none specified) | "Keep frontier reasoning married to your own data..." in section below hero. | Deferred — to be shortened, Jobs-style. |

## Palette

| Item | Brief | Current | Status |
|------|-------|---------|--------|
| Text | `#1D1D1F` | `#1D1D1F` | Resolved. |
| Secondary gray | `#86868B` | `#86868B` | Resolved. |
| Light section bg | `#F5F5F7` | `#F5F5F7` | Resolved. |
| Accent | `#3B5566` — used rarely | Used only in form focus ring and a couple of hover states | Resolved — kept minimal. |

## Typography

| Item | Brief | Current | Status |
|------|-------|---------|--------|
| Family | Inter Tight | Inter Tight | Resolved — same family used on business card. |
| Heading weight | Medium (500) | 500 | Resolved. |
| Body weight | Regular (400) | 400 | Resolved. |
| Casing | Sentence case for copy; title case only for brand line | Sentence case throughout | Resolved. |

## Sections — homepage

| Section in brief | Current site | Status |
|------------------|--------------|--------|
| Hero with CTA | Yes (two CTAs: Cal.com + form) | Resolved. |
| Problems We Solve (8 examples) | Yes, 8 items verbatim from brief | Resolved. |
| AI Implementation Principles (4) | Yes, 4 items | Resolved. |
| Confidentiality / Trust (IMPORTANT) | Yes — 3 pillars | Resolved. |
| About / Founder | Teaser on home + full /about | Resolved. |
| Contact / Scheduling | On /contact (Cal.com + form) | Resolved. |

## About page title

| Item | Brief | Current | Status |
|------|-------|---------|--------|
| Title | "Founder", "Principal Advisor", or "Manufacturing AI Advisor" | "Founder & Principal" | Resolved. Alternates to revisit: "Founder" alone, "Founder & Engineer". |

## Contact mechanism

| Item | Brief | Current | Status |
|------|-------|---------|--------|
| Primary CTA | Cal.com 30-min exploratory call OR have-us-call-you form | Both, side by side | Resolved. |
| Public contact info | Not on website | None displayed | Resolved. |
| Cal.com URL | TBD — Sudhir to create account | `cal.com/ai4smartmfg/30min` | Resolved. |
| Form endpoint | TBD — Formspree placeholder | Cloudflare Pages Function at `/contact` relays to `sudhir@ai4smartmfg.com` via Email Workers binding. | Resolved — pending dashboard binding config + first live test. |

## Asyjo disclosure

| Item | Brief | Current | Status |
|------|-------|---------|--------|
| Footer | (silent) | "© 2026 ai4smartmfg." Asyjo line removed from visible footer. | Resolved. |
| Legal entity | Asyjo Inc (MA corporation) contracts and invoices | Stated on `/legal.html`, linked from footer. No link to asyjo.com. | Resolved. |
| Public mention of Asyjo elsewhere | Keep low-key | None on home/about/contact | Resolved. |

## Imagery

| Item | Brief | Current | Status |
|------|-------|---------|--------|
| Photography | B&W or low-saturation real shop-floor imagery | None yet — text-only page | Deferred — add imagery later. |
| Logo | Card already produced; web logo TBD | Wordmark only | Deferred — replace with logo once final. |

## Out of scope for this site

| Item | Brief | Status |
|------|-------|--------|
| Asyjo.com — neutral umbrella site | Separate project | Deferred. |
| acquisitions.asyjo.com — de-emphasize | Separate project | Deferred. |
| Stop Asyjo.com → acquisitions redirect | Separate project | Deferred. |
| Cal.com account setup | External tool | Resolved — `cal.com/ai4smartmfg/30min` live, Google Calendar connected. |
| Formspree (or alt) account setup | External tool | Dropped — replaced by Cloudflare Pages Function + Email Workers binding (`functions/contact.js`). No third-party account needed. |
| Google Workspace + sudhir@ai4smartmfg.com | Phase 3 of this engagement | In progress. |
| DKIM / SPF / DMARC | Phase 4 | In progress. |
