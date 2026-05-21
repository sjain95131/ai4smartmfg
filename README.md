# ai4smartmfg-landing

Public site for [ai4smartmfg.com](https://ai4smartmfg.com).

ai4smartmfg is a practical-AI consultancy for small and mid-sized manufacturers. Sole legal entity behind it is Asyjo Corporation (Massachusetts).

## Stack
Plain HTML, CSS, and a few lines of JS for the mobile nav. No framework, no build step. Hosted free on Cloudflare Pages; pushes to `main` deploy automatically.

## Structure
- `index.html` — landing page
- `about.html` — founder + about
- `contact.html` — Cal.com link + lead form
- `assets/css/styles.css` — Inter Tight, monochrome with a single muted-industrial-blue accent (#3B5566)
- `assets/js/nav.js` — mobile nav toggle

## Placeholders to replace before going live
- `https://cal.com/REPLACE_ME` — Cal.com 30-minute booking URL. Used in hero, contact page, and closing CTA.
- `https://formspree.io/f/REPLACE_ME` — Formspree endpoint for the contact form, in `contact.html`.

## Local preview
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Brand notes
- Typeface: Inter Tight (Google Fonts), Medium 500 for headings, Regular 400 for body.
- Palette: text `#1D1D1F`, secondary `#86868B`, light section `#F5F5F7`, accent `#3B5566`, white background.
- Layout: left-aligned, asymmetric, generous whitespace, ≤4px corner radii, no drop shadows or gradients.
- No public contact email, phone, or address. Cal.com + form only.
