# ai4smartmfg-landing

Static landing site for [ai4smartmfg.com](https://ai4smartmfg.com). An Asyjo company.

## Stack
Plain HTML, CSS, and a few lines of JS for the mobile nav. No framework, no build step.

## Structure
- `index.html` — landing page
- `about.html` — stub
- `approach.html` — stub
- `contact.html` — form (Formspree endpoint TBD)
- `assets/css/styles.css`
- `assets/js/nav.js`

## Deploy
Hosted on Cloudflare Pages. Connected to this repo; pushes to `main` deploy automatically.

## Contact form
The form posts to a placeholder Formspree endpoint (`REPLACE_ME` in `contact.html`). Replace with the real endpoint or wire to Cloudflare Workers / another backend before going live with form submissions.

## Local preview
Open `index.html` in a browser, or run any static server:

```bash
python3 -m http.server 8000
```
