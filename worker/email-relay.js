// Cloudflare Worker — email relay
//
// Deployed as a standalone Worker (NOT a Pages Function), because Pages
// Functions in this account don't expose the Send Email binding, but
// Workers do.
//
// Called by the Pages Function at functions/contact.js via Service Binding.
//
// Dashboard config required (one-time, in the Worker itself):
//   Settings → Variables → Bindings → Add → Send Email
//     Variable name:        SEND_EMAIL
//     Destination address:  sudhir@ai4smartmfg.com
//
// The destination must already be a verified destination in Cloudflare
// Email Routing for ai4smartmfg.com (it is — inbound mail routes there
// to Gmail).
//
// This Worker is also exposed as a Service Binding to the Pages project
// (Pages → Settings → Bindings → Add → Service Binding, variable EMAIL_RELAY,
// service = this Worker).

import { EmailMessage } from "cloudflare:email";

const FROM_ADDR = "noreply@ai4smartmfg.com";
const TO_ADDR   = "sudhir@ai4smartmfg.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    // ---- parse JSON body (Pages Function forwards as JSON) ----
    let data = {};
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request body." }, 400);
    }

    const name    = str(data.name);
    const email   = str(data.email);
    const company = str(data.company);
    const phone   = str(data.phone);
    const message = str(data.message);

    // ---- validate (defense-in-depth — Pages Function also validates) ----
    if (!name || !email || !message) {
      return json({ ok: false, error: "Name, email, and message are required." }, 400);
    }
    if (!EMAIL_RE.test(email)) {
      return json({ ok: false, error: "Please enter a valid email address." }, 400);
    }
    if (message.length > 5000 || name.length > 200 || (company && company.length > 200)) {
      return json({ ok: false, error: "Submission is too long." }, 400);
    }

    // ---- build RFC 5322 message ----
    const subject = `New contact form submission${company ? " — " + company : ""}`;
    const body = [
      `New contact submission from ai4smartmfg.com`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Company: ${company || "(not provided)"}`,
      `Phone:   ${phone   || "(not provided)"}`,
      ``,
      `Message:`,
      message,
      ``,
      `---`,
      `Reply to this email to respond to ${name} directly.`,
    ].join("\r\n");

    const raw = [
      `From: ai4smartmfg contact form <${FROM_ADDR}>`,
      `To: <${TO_ADDR}>`,
      `Reply-To: ${encodeHeader(name)} <${email}>`,
      `Subject: ${encodeHeader(subject)}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@ai4smartmfg.com>`,
      ``,
      body,
    ].join("\r\n");

    // ---- send ----
    try {
      if (!env.SEND_EMAIL) {
        return json({ ok: false, error: "Email binding is not configured on this Worker." }, 500);
      }
      await env.SEND_EMAIL.send(new EmailMessage(FROM_ADDR, TO_ADDR, raw));
    } catch (err) {
      return json({ ok: false, error: `Send failed: ${err.message || err}` }, 500);
    }

    return json({ ok: true });
  },
};

// ---- helpers ----
function str(v) {
  return (v == null ? "" : String(v)).trim();
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8" },
  });
}

// RFC 2047 encode a header value if it contains non-ASCII characters.
function encodeHeader(value) {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  const utf8 = new TextEncoder().encode(value);
  let bin = "";
  for (let i = 0; i < utf8.length; i++) bin += String.fromCharCode(utf8[i]);
  return `=?UTF-8?B?${btoa(bin)}?=`;
}
