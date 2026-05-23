// Cloudflare Pages Function — POST /contact
//
// Thin proxy: parses the form submission, validates the fields, then
// forwards them as JSON to the email-relay Worker via Service Binding.
// The Worker (not this function) has the Send Email binding, because
// Pages Functions in this account do not expose that binding type.
//
// Dashboard config required (one-time, on the Pages project):
//   Settings → Bindings → Add → Service Binding
//     Variable name: EMAIL_RELAY
//     Service:       ai4smartmfg-email-relay  (the Worker created from
//                    worker/email-relay.js)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  // ---- parse body (multipart form or JSON) ----
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

  const payload = {
    name:    str(data.name),
    email:   str(data.email),
    company: str(data.company),
    phone:   str(data.phone),
    message: str(data.message),
  };

  // ---- validate (Worker re-validates as defense-in-depth) ----
  if (!payload.name || !payload.email || !payload.message) {
    return json({ ok: false, error: "Name, email, and message are required." }, 400);
  }
  if (!EMAIL_RE.test(payload.email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  if (
    payload.message.length > 5000 ||
    payload.name.length > 200 ||
    (payload.company && payload.company.length > 200)
  ) {
    return json({ ok: false, error: "Submission is too long." }, 400);
  }

  // ---- forward to Worker via Service Binding ----
  if (!env.EMAIL_RELAY) {
    return json(
      { ok: false, error: "Email relay binding is not configured on this deployment." },
      500,
    );
  }

  try {
    const relayRes = await env.EMAIL_RELAY.fetch(
      new Request("https://email-relay/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
    // Pass the Worker's JSON response straight back to the browser.
    const text = await relayRes.text();
    return new Response(text, {
      status: relayRes.status,
      headers: { "content-type": "application/json; charset=UTF-8" },
    });
  } catch (err) {
    return json({ ok: false, error: `Relay failed: ${err.message || err}` }, 500);
  }
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
