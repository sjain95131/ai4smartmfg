const MAX_FIELD_LENGTHS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 60,
  message: 4000,
};

const REQUIRED_FIELDS = ["name", "email", "message"];

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") {
      return json({ ok: false, error: "Not found" }, 404, corsHeaders);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405, {
        ...corsHeaders,
        Allow: "POST, OPTIONS",
      });
    }

    if (!env.CONTACT_TO || !env.CONTACT_FROM) {
      console.error("Missing CONTACT_TO or CONTACT_FROM Worker configuration");
      return json(
        { ok: false, error: "Contact form is not configured yet." },
        500,
        corsHeaders,
      );
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ ok: false, error: "Origin not allowed" }, 403, corsHeaders);
    }

    let payload;
    try {
      payload = await parsePayload(request);
    } catch (error) {
      return json({ ok: false, error: "Could not read form data." }, 400, corsHeaders);
    }

    const form = normalizePayload(payload);
    const validationError = validateForm(form);
    if (validationError) {
      return json({ ok: false, error: validationError }, 400, corsHeaders);
    }

    if (form.website) {
      // Honeypot: make bots think the form succeeded without sending mail.
      return json({ ok: true }, 200, corsHeaders);
    }

    try {
      await env.CONTACT_EMAIL.send({
        to: env.CONTACT_TO,
        from: { email: env.CONTACT_FROM, name: "ai4smartmfg website" },
        replyTo: { email: form.email, name: form.name },
        subject: buildSubject(form),
        text: buildTextEmail(form, request),
        html: buildHtmlEmail(form, request),
      });
    } catch (error) {
      console.error("Contact email failed", {
        code: error && error.code,
        message: error && error.message,
      });
      return json(
        { ok: false, error: "Message could not be sent. Please try again shortly." },
        502,
        corsHeaders,
      );
    }

    return json({ ok: true }, 200, corsHeaders);
  },
};

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return getAllowedOrigins(env).includes(origin);
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };

  if (origin && getAllowedOrigins(env).includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

async function parsePayload(request) {
  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    return request.formData();
  }

  throw new Error("Unsupported content type");
}

function normalizePayload(payload) {
  const getValue = (key) => {
    const value = typeof payload.get === "function" ? payload.get(key) : payload[key];
    return cleanString(value, MAX_FIELD_LENGTHS[key] || 500);
  };

  return {
    name: getValue("name"),
    company: getValue("company"),
    email: getValue("email").toLowerCase(),
    phone: getValue("phone"),
    message: getValue("message"),
    website: getValue("website"),
  };
}

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function validateForm(form) {
  for (const field of REQUIRED_FIELDS) {
    if (!form[field]) {
      return "Please complete the required fields.";
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return "Please enter a valid email address.";
  }

  if (form.message.length < 10) {
    return "Please include a little more detail in your message.";
  }

  return "";
}

function buildSubject(form) {
  const source = form.company ? `${form.name} at ${form.company}` : form.name;
  return `New ai4smartmfg inquiry from ${source}`;
}

function buildTextEmail(form, request) {
  const submittedAt = new Date().toISOString();
  const ip = request.headers.get("CF-Connecting-IP") || "Unavailable";
  const userAgent = request.headers.get("User-Agent") || "Unavailable";
  const referer = request.headers.get("Referer") || "Unavailable";

  return [
    "New ai4smartmfg website inquiry",
    "",
    `Name: ${form.name}`,
    `Company: ${form.company || "Not provided"}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone || "Not provided"}`,
    "",
    "Message:",
    form.message,
    "",
    "Submission details:",
    `Submitted at: ${submittedAt}`,
    `IP: ${ip}`,
    `Referrer: ${referer}`,
    `User agent: ${userAgent}`,
  ].join("\n");
}

function buildHtmlEmail(form, request) {
  const submittedAt = new Date().toISOString();
  const ip = request.headers.get("CF-Connecting-IP") || "Unavailable";
  const userAgent = request.headers.get("User-Agent") || "Unavailable";
  const referer = request.headers.get("Referer") || "Unavailable";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2 style="margin:0 0 16px;">New ai4smartmfg website inquiry</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(form.name)}</td></tr>
        <tr><td><strong>Company</strong></td><td>${escapeHtml(form.company || "Not provided")}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(form.email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(form.phone || "Not provided")}</td></tr>
      </table>
      <h3 style="margin:20px 0 8px;">Message</h3>
      <p style="white-space:pre-wrap;">${escapeHtml(form.message)}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="font-size:12px;color:#666;margin:0;">
        Submitted at: ${escapeHtml(submittedAt)}<br>
        IP: ${escapeHtml(ip)}<br>
        Referrer: ${escapeHtml(referer)}<br>
        User agent: ${escapeHtml(userAgent)}
      </p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}
