# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Public landing site for **ai4smartmfg.com** — a practical-AI consultancy for small and mid-sized manufacturers. Legal entity behind the brand is **Asyjo Inc** (Massachusetts). The site is intentionally minimal: plain HTML/CSS/JS, no framework, no build step.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

No build step, no npm install needed for the static site.

## Cloudflare Worker (contact form backend)

The Worker lives in `worker/` and is deployed separately from the static site.

```bash
cd worker
npm install
npm run dev        # local dev via wrangler
npm run check      # syntax check only (node --check)
npm run deploy     # deploy to Cloudflare (requires wrangler auth)
```

To update the destination email secret:
```bash
npx wrangler secret put CONTACT_TO
```

## Architecture

### Static site (Cloudflare Pages)
Pushes to `main` auto-deploy via Cloudflare Pages. No CI pipeline — deploy is just `git push`.

### Contact form flow
1. `contact.html` (and `index.html`) submit to `/api/contact` via AJAX (`assets/js/contact-form.js`).
2. Cloudflare routes `/api/contact` to the Worker (`worker/src/index.js`).
3. Worker validates, honeypot-checks (`website` field), then sends via Cloudflare Email Sending (`CONTACT_EMAIL` binding → `website@ai4smartmfg.com` sender).
4. Destination address is the `CONTACT_TO` Worker secret — never in HTML or static files.
5. `Reply-To` is set to the submitter so inbox replies go directly to the lead.

### Worker config (`worker/wrangler.jsonc`)
- Routes: `ai4smartmfg.com/api/contact` and `www.ai4smartmfg.com/api/contact`
- Sender: `CONTACT_FROM` var = `website@ai4smartmfg.com`; must match `allowed_sender_addresses`
- Allowed origins: production domains + `localhost:8000` / `127.0.0.1:8000` for local dev

## Brand constraints

- Palette: text `#1D1D1F`, secondary `#86868B`, light bg `#F5F5F7`, accent `#3B5566` (used sparingly — focus rings and hover states only), white backgrounds.
- Typeface: Inter Tight (Google Fonts), 500 for headings, 400 for body.
- Layout: left-aligned, asymmetric, generous whitespace, ≤4px corner radii, no shadows or gradients.
- **No public contact email, phone, or address anywhere in the HTML.** Cal.com + form only.
- Asyjo Inc is the legal entity; mentioned on `/legal.html` only, not on main pages.
- Footer: "© 2026 ai4smartmfg." — no Asyjo branding in the visible footer.

## Open items to be aware of

See `BRAND-CONFLICTS.md` for deferred decisions (imagery, logo, value-prop shortening). Do not resolve those without explicit instruction.
