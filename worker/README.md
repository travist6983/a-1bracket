# Contact form backend (Resend + Cloudflare Worker)

The site is static (GitHub Pages), so it can't call Resend directly from the browser —
that would expose your Resend API key to anyone who views the page source. This Worker
is the one small piece of server-side code that stands between the form and Resend.

## 1. Resend setup

1. Sign up at resend.com (free tier: 3,000 emails/month, 100/day — plenty for a contact form).
2. Create an API key: Dashboard -> API Keys -> Create API Key. Copy it, you'll need it in step 3.
3. Verify your sending domain: Dashboard -> Domains -> Add Domain -> `a-1bracket.com`.
   Resend gives you a few DNS records (SPF + DKIM) to add at your DNS provider (GoDaddy,
   since that's where a-1bracket.com's DNS currently lives). Verification can take a few
   minutes to a few hours to propagate.
   - Until it's verified, you can test with `from: "onboarding@resend.dev"` in
     contact-worker.js — swap it back to `website@a-1bracket.com` once verified.

## 2. Deploy the Worker

Easiest path is the Cloudflare dashboard (no local tooling needed):

1. Sign up at cloudflare.com (free) if you don't have an account.
2. Dashboard -> Workers & Pages -> Create -> Create Worker.
3. Give it a name (e.g. `a1bracket-contact`) and deploy the default template.
4. Click "Edit code", delete the placeholder, and paste in the contents of
   `worker/contact-worker.js` from this repo. Save and deploy.
5. Go to the Worker's Settings -> Variables:
   - Add a secret named `RESEND_API_KEY` with the API key from step 1.
   - (Optional) Add a plain variable `ALLOWED_ORIGIN` set to `https://a-1bracket.com`
     once the site is live on that domain, to restrict who can call the Worker.
6. Note the Worker's URL, shown at the top of its page — something like
   `https://a1bracket-contact.<your-subdomain>.workers.dev`.

If you'd rather use the CLI: `npm install -g wrangler`, then `wrangler deploy
worker/contact-worker.js`, and `wrangler secret put RESEND_API_KEY`.

## 3. Wire up the form

Open `js/contact.js` and replace:

```js
var CONTACT_ENDPOINT = "https://REPLACE-ME.workers.dev";
```

with the Worker URL from step 2.6. Commit and push — the live contact form will start
sending real emails to info@a-1bracket.com.

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
