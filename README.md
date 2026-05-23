# ai4smartmfg-landing

Public site for [ai4smartmfg.com](https://ai4smartmfg.com).

ai4smartmfg is a practical-AI consultancy for small and mid-sized manufacturers. Sole legal entity behind it is Asyjo Inc (Massachusetts).

## Stack
Plain HTML, CSS, and a few lines of JS for the mobile nav. No framework, no build step. Hosted free on Cloudflare Pages; pushes to `main` deploy automatically.

## Structure
- `index.html` — landing page
- `about.html` — founder + about
- `contact.html` — Cal.com link + lead form
- `assets/css/styles.css` — Inter Tight, monochrome with a single muted-industrial-blue accent (#3B5566)
- `assets/js/nav.js` — mobile nav toggle

## Contact form

The contact form posts to `/contact`, handled by `functions/contact.js` (a Cloudflare Pages Function). It builds an RFC 5322 message and relays it to `sudhir@ai4smartmfg.com` via the Cloudflare Email Workers `SEND_EMAIL` binding.

**Required Cloudflare dashboard config** (one-time):
1. Workers & Pages → this project → Settings → Functions → Bindings → **Add Send Email**
2. Variable name: `SEND_EMAIL`
3. Destination address: `sudhir@ai4smartmfg.com` (must already be a verified destination in Email Routing — it is, since inbound mail to that address works).

Sender is `noreply@ai4smartmfg.com` (no mailbox required — Cloudflare permits sending from any address on the zone). `Reply-To` is set to the submitter, so replies in Gmail go directly to them.

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
