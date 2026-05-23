<?php
/**
 * ai4smartmfg contact form relay (Bluehost-hosted)
 *
 * Receives a POST from the contact form on ai4smartmfg.com (Cloudflare
 * Pages) and forwards it via PHP mail() to sudhir@ai4smartmfg.com.
 *
 * The recipient address never appears in the browser — it lives in this
 * server-side file only.
 *
 * Upload path (suggested):
 *   https://acquisitions.asyjo.com/ai4smartmfg-contact.php
 *
 * If you upload to a different URL, update the form's `action` attribute
 * in index.html to match.
 *
 * Accepts:
 *   - multipart/form-data  (default when the form submits via FormData)
 *   - application/json
 *
 * Always responds with JSON: { "ok": true } or { "ok": false, "error": "..." }
 */

// -----------------------------------------------------------------------------
// CORS — only allow the production site and local dev
// -----------------------------------------------------------------------------
$allowed_origins = [
  'https://ai4smartmfg.com',
  'https://www.ai4smartmfg.com',
  'https://ai4smartmfg.pages.dev',   // Cloudflare Pages default subdomain
  'http://localhost:8000',           // local preview via `python -m http.server`
  'http://127.0.0.1:8000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
  header("Access-Control-Allow-Origin: $origin");
}
header("Vary: Origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Access-Control-Max-Age: 86400");

// Handle CORS preflight (rare for our submit shape, but cheap to support)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

// -----------------------------------------------------------------------------
// Parse body — JSON or multipart form
// -----------------------------------------------------------------------------
$data  = [];
$ctype = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($ctype, 'application/json') !== false) {
  $raw  = file_get_contents('php://input');
  $data = json_decode($raw, true) ?: [];
} else {
  $data = $_POST;
}

function clean_field($v) {
  return is_string($v) ? trim($v) : '';
}

$name    = clean_field($data['name']    ?? '');
$email   = clean_field($data['email']   ?? '');
$company = clean_field($data['company'] ?? '');
$phone   = clean_field($data['phone']   ?? '');
$message = clean_field($data['message'] ?? '');

// -----------------------------------------------------------------------------
// Validate
// -----------------------------------------------------------------------------
if ($name === '' || $email === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Name, email, and message are required.']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
  exit;
}
if (strlen($message) > 5000 || strlen($name) > 200 || strlen($company) > 200) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Submission is too long.']);
  exit;
}

// Strip CR/LF from values that go into headers to prevent header injection.
function strip_crlf($v) { return str_replace(["\r", "\n"], '', $v); }
$safe_name  = strip_crlf($name);
$safe_email = strip_crlf($email);

// -----------------------------------------------------------------------------
// Build the email
// -----------------------------------------------------------------------------
$to      = 'sudhir@ai4smartmfg.com';
$from    = 'no-reply@asyjo.com';  // sender on a Bluehost-authorized domain
$subject = 'New contact form submission' . ($company !== '' ? ' — ' . $company : '');

$body  = "New contact submission from ai4smartmfg.com\r\n\r\n";
$body .= "Name:    {$name}\r\n";
$body .= "Email:   {$email}\r\n";
$body .= "Company: " . ($company !== '' ? $company : '(not provided)') . "\r\n";
$body .= "Phone:   " . ($phone   !== '' ? $phone   : '(not provided)') . "\r\n";
$body .= "\r\nMessage:\r\n{$message}\r\n";
$body .= "\r\n---\r\nReply to this email to respond to {$safe_name} directly.\r\n";

// RFC 2047 encode header values that may contain non-ASCII characters.
function encode_header($v) {
  return preg_match('/[\x80-\xff]/', $v)
    ? '=?UTF-8?B?' . base64_encode($v) . '?='
    : $v;
}

$encoded_subject = encode_header($subject);
$encoded_name    = encode_header($safe_name);

$headers  = "From: ai4smartmfg contact form <{$from}>\r\n";
$headers .= "Reply-To: {$encoded_name} <{$safe_email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: ai4smartmfg-contact-form\r\n";

// -----------------------------------------------------------------------------
// Send
// -----------------------------------------------------------------------------
$ok = @mail($to, $encoded_subject, $body, $headers, "-f {$from}");

if ($ok) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Mail send failed on the server.']);
}
