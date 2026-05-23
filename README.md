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

The contact form posts cross-origin to **Bluehost PHP**:
[`bluehost/ai4smartmfg-contact.php`](bluehost/ai4smartmfg-contact.php) →
hosted at `https://asyjo.com/ai4smartmfg-contact.php`.

The PHP handler validates fields, sends an RFC-2047-encoded text email via
`mail()` to `sudhir@ai4smartmfg.com`, and replies in JSON. `Reply-To` is the
submitter so hitting Reply in Gmail goes straight to them. CORS is locked to
the production site, its `pages.dev` subdomain, and local dev.

**Deploying the PHP file:** upload `bluehost/ai4smartmfg-contact.php` to the
Bluehost public web root for `asyjo.com`. No DNS / mail config changes —
Bluehost's existing authorized sender (`no-reply@asyjo.com`) is reused.

### Why not Cloudflare for the contact form?

Cloudflare's Send Email binding requires Email Routing enabled on the zone,
which requires MX records pointing at Cloudflare — incompatible with the
domain's Google Workspace MX. An earlier Worker + Pages Function attempt
was scrapped; if Bluehost is later retired, the cleanest replacement is a
service like Resend called from a Pages Function (no MX changes needed).

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
