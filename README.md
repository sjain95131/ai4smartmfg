# ai4smartmfg-landing

Public site for [ai4smartmfg.com](https://ai4smartmfg.com).

ai4smartmfg is a practical-AI consultancy for small and mid-sized manufacturers. Sole legal entity behind it is Asyjo Inc (Massachusetts).

## Stack
Plain HTML, CSS, and a few lines of JS for the mobile nav/contact form. No framework, no build step for the static site. Hosted on Cloudflare Pages; pushes to `main` deploy automatically. Contact form delivery is handled by a separate Cloudflare Worker routed to `/api/contact`.

## Structure
- `index.html` — landing page
- `about.html` — founder + about
- `contact.html` — Cal.com link + lead form
- `assets/css/styles.css` — Inter Tight, monochrome with a single muted-industrial-blue accent (#3B5566)
- `assets/js/nav.js` — mobile nav toggle
- `assets/js/contact-form.js` — AJAX submit handling for contact forms
- `worker/` — Cloudflare Worker that receives form posts and sends email

## Contact form

The contact forms post to `/api/contact`, which is served by the Cloudflare Worker in
[`worker/src/index.js`](worker/src/index.js). The public HTML does not include the
destination address. The Worker sends the message to the Workspace mailbox stored
in the Cloudflare-side `CONTACT_TO` secret through Cloudflare Email Sending using
the `CONTACT_EMAIL` binding.

The Worker validates required fields, rejects disallowed origins, uses a hidden
honeypot field for basic bot filtering, and sets `Reply-To` to the submitter so
replying from Google Workspace goes straight back to the lead.

### Cloudflare setup

Cloudflare Email Sending is Cloudflare-native, but it requires the Workers Paid
plan. It does not require moving the main Google Workspace MX records away from
Google. During Cloudflare Email Sending onboarding, Cloudflare adds sending
authentication records on `cf-bounce.ai4smartmfg.com` plus DKIM/DMARC records.
Do not enable Cloudflare Email Routing for the root domain unless you intend to
replace Google Workspace inbound MX records.

1. In Cloudflare, go to **Compute > Email Service > Email Sending**.
2. Onboard `ai4smartmfg.com` for Email Sending.
3. Let Cloudflare add the required sending DNS records and wait until they show
   as verified/locked.
4. From `worker/`, deploy the Worker:

```bash
npm install
npx wrangler secret put CONTACT_TO
npm run deploy
```

When prompted for `CONTACT_TO`, paste the Workspace email address that should
receive form submissions. Keep that address in Cloudflare configuration only, not
in public HTML or static files.

The Worker config in [`worker/wrangler.jsonc`](worker/wrangler.jsonc) routes:

- `https://ai4smartmfg.com/api/contact`
- `https://www.ai4smartmfg.com/api/contact`

If the sending address changes, update `CONTACT_FROM` and the
`allowed_sender_addresses` entry in `worker/wrangler.jsonc`. If the receiving
address changes, update the `CONTACT_TO` Worker secret in Cloudflare.

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
