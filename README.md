# A-1 Bracket

Marketing site for A-1 Bracket (a-1bracket.com), migrating from WordPress/GoDaddy to a static HTML site hosted on GitHub Pages.

## Status

Site built: home, services overview, six service detail pages, a filterable projects gallery, about, and contact (with a math-captcha-protected form). The contact form sends through Resend via a Cloudflare Worker — see `worker/README.md`.

## Structure

- `index.html` — homepage
- `pages/` — inner pages (services, projects, about, contact)
- `css/` — stylesheets
- `js/` — scripts
- `img/` — images/assets
- `worker/` — Cloudflare Worker source for the contact form's email backend (Resend)

## Deployment

- Testing: default GitHub Pages domain (`travist6983.github.io/a-1bracket`)
- Production: `a-1bracket.com` — DNS stays on Network Solutions (the old site is hosted at GoDaddy), repointed to GitHub Pages once the site is ready

## Contact form

Previously SendGrid via the WordPress theme. Replaced with Resend + a Cloudflare Worker — see `worker/README.md` for how it's set up and how to redeploy the Worker.
