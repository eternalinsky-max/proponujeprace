// src/lib/mailer.js
import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";

const PROVIDER = (process.env.MAIL_PROVIDER || "SMTP").toUpperCase();

let smtpTransport = null;
let brevoApi = null;

function getFrom() {
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER || process.env.SUPPORT_EMAIL;
  const name = process.env.MAIL_FROM_NAME || "proponujeprace.pl";
  return { email, name };
}

// --- SMTP (Nodemailer) ---
function getSmtpTransport() {
  if (smtpTransport) return smtpTransport;
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("[mailer] SMTP env vars are missing – emails may fail.");
  }

  smtpTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: String(SMTP_SECURE ?? "true") === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return smtpTransport;
}

// --- Brevo API ---
function getBrevoApi() {
  if (brevoApi) return brevoApi;
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[mailer] BREVO_API_KEY missing – emails may fail.");
  }
  const api = new Brevo.TransactionalEmailsApi();
  api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  brevoApi = api;
  return brevoApi;
}

/**
 * sendMail — єдиний інтерфейс для відправки листів
 * @param {Object} p
 * @param {string} p.to
 * @param {string} p.subject
 * @param {string} [p.text]
 * @param {string} [p.html]
 * @param {string} [p.replyTo]
 * @param {string} [p.fromEmail]  // опц.
 * @param {string} [p.fromName]   // опц.
 */
export async function sendMail(p) {
  const to = p.to || process.env.SUPPORT_EMAIL;
  if (!to) throw new Error("No recipient (to)");
  const from = {
    email: p.fromEmail || getFrom().email,
    name: p.fromName || getFrom().name,
  };

  if (PROVIDER === "BREVO") {
    const api = getBrevoApi();
    const payload = new Brevo.SendSmtpEmail();
    payload.sender = { email: from.email, name: from.name };
    payload.to = [{ email: to }];
    if (p.replyTo) payload.replyTo = { email: p.replyTo };
    payload.subject = p.subject;
    if (p.html) payload.htmlContent = p.html;
    if (p.text) payload.textContent = p.text;

    const res = await api.sendTransacEmail(payload);
    // res містить messageId тощо — можна логувати
    return { ok: true, provider: "BREVO", id: res?.messageId || null };
  }

  // fallback: SMTP
  const transport = getSmtpTransport();
  const info = await transport.sendMail({
    from: `"${from.name}" <${from.email}>`,
    to,
    replyTo: p.replyTo,
    subject: p.subject,
    text: p.text,
    html: p.html,
  });
  return { ok: true, provider: "SMTP", id: info?.messageId || null };
}
