// Cloudflare Pages Function — POST /contact
// Receives a contact-form submission and relays it to the verified
// destination address using Cloudflare's Email Workers binding.
//
// Dashboard config required (Cloudflare → Workers & Pages → this project
// → Settings → Functions → Bindings → Add Send Email):
//   Variable name:        SEND_EMAIL
//   Destination address:  sudhir@ai4smartmfg.com
// The destination must already exist as a verified destination in
// Cloudflare Email Routing for ai4smartmfg.com (it does, since inbound
// mail is already routing to Google Workspace).

import { EmailMessage } from "cloudflare:email";

const FROM_ADDR = "noreply@ai4smartmfg.com";
const TO_ADDR   = "sudhir@ai4smartmfg.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  // ---- parse body (accept multipart/form-data or JSON) ----
  let data = {};
  const ctype = request.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    }
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  const name    = str(data.name);
  const email   = str(data.email);
  const company = str(data.company);
  const phone   = str(data.phone);
  const message = str(data.message);

  // ---- validate ----
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
      return json({ ok: false, error: "Email binding is not configured on this deployment." }, 500);
    }
    await env.SEND_EMAIL.send(new EmailMessage(FROM_ADDR, TO_ADDR, raw));
  } catch (err) {
    return json({ ok: false, error: `Send failed: ${err.message || err}` }, 500);
  }

  return json({ ok: true });
}

// Anything other than POST → 405
export function onRequest() {
  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

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
  let b64 = "";
  for (let i = 0; i < utf8.length; i++) b64 += String.fromCharCode(utf8[i]);
  return `=?UTF-8?B?${btoa(b64)}?=`;
}
