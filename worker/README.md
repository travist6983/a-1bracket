# Contact form backend (Resend + Cloudflare Worker)

The site is static (GitHub Pages), so it can't call Resend directly from the browser —
that would expose your Resend API key to anyone who views the page source. This Worker
is the one small piece of server-side code that stands between the form and Resend.

## Current setup

- **Worker:** `a1bracket-contact`, live at `https://a1bracket-contact.travisjterry.workers.dev/`.
  `js/contact.js` posts the form there.
- **Resend:** `a-1bracket.com` is verified (Sep 21, 2026), so the Worker sends from
  `website@a-1bracket.com` to the recipients listed in `contact-worker.js`. The sending
  address doesn't need a mailbox.
- **DNS:** a-1bracket.com's DNS is at **Network Solutions** (ns17/ns18.worldnic.com), not
  GoDaddy. That's where the Resend records live: `resend._domainkey` (DKIM), `send`
  (bounce/SPF, pointing at Resend), and `_dmarc`. The root MX and SPF records belong to
  the company's Microsoft 365 email — don't touch them for Resend.

## Updating the Worker

Pushing to GitHub does **not** update the Worker. It was deployed through the Cloudflare
dashboard, so after changing `contact-worker.js`:

1. Cloudflare dashboard -> Workers & Pages -> `a1bracket-contact` -> Edit code.
2. Replace the code with the contents of `worker/contact-worker.js` from this repo.
3. Click Deploy.

If you'd rather use the CLI: `npm install -g wrangler`, `wrangler login`, then
`wrangler deploy worker/contact-worker.js --name a1bracket-contact`.

## Worker settings

Worker -> Settings -> Variables and Secrets:

- `RESEND_API_KEY` (secret, required) — a Resend API key (Resend dashboard -> API Keys).
- `ALLOWED_ORIGIN` (plain text, optional) — restricts which site can call the Worker.
  Leave it unset while testing on github.io. Once a-1bracket.com points at GitHub Pages,
  set it to `https://a-1bracket.com`; after that, the form on the github.io address will
  stop working.

## Spam protection

The form has two layers:
- **Math captcha** (client-side): the visible "X + Y =" check — blocks casual bots and
  scripted submissions that don't solve it.
- **Honeypot field** (server-side, in the Worker): a hidden field real visitors never see
  or fill in. Any submission with it filled in is silently dropped. This catches bots that
  skip the page's JavaScript entirely and POST straight to the Worker.

If spam becomes a real problem later, the free upgrade is Cloudflare Turnstile
(invisible, no puzzles) — swap the math captcha for a Turnstile widget and verify the
token inside the Worker before calling Resend.
