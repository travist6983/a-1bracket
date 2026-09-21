// Cloudflare Worker that receives the contact form POST and sends the email via Resend.
// See worker/README.md for deployment steps.
//
// Required secret (set via `wrangler secret put RESEND_API_KEY` or the dashboard):
//   RESEND_API_KEY   - your Resend API key
// Optional environment variable (set in wrangler.toml or the dashboard):
//   ALLOWED_ORIGIN   - the site origin allowed to call this Worker, e.g. "https://a-1bracket.com"
//                       (falls back to "*" if unset, which is fine while testing on github.io)

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ ok: false, error: "Invalid JSON" }, 400, cors);
    }

    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const phone = (body.phone || "").toString().trim();
    const message = (body.message || "").toString().trim();
    const honeypot = (body.company || "").toString().trim();

    // Honeypot: real visitors never fill this hidden field. Silently succeed so bots don't learn.
    if (honeypot) {
      return json({ ok: true }, 200, cors);
    }

    if (!name || !email || !message) {
      return json({ ok: false, error: "Missing required fields" }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "Invalid email" }, 400, cors);
    }

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Must be on a domain verified in Resend (a-1bracket.com is). No mailbox needed for this address.
        from: "A-1 Bracket Group Website <website@a-1bracket.com>",
        to: ["info@a-1bracket.com", "travisjterry@gmail.com"],
        reply_to: email,
        subject: `New website message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "(not provided)"}\n\n${message}`
      })
    });

    if (!resendResp.ok) {
      const detail = await resendResp.text();
      console.log("Resend error:", detail);
      return json({ ok: false, error: "Email send failed" }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  }
};

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors }
  });
}
