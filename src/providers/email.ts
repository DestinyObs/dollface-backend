import { env } from "../env.js";
import { logger } from "../lib/logger.js";

/**
 * Email transport.
 * - RESEND_API_KEY set → send via Resend.
 * - else SMTP_URL set → send via nodemailer.
 * - else dev-mode logs the message so flows work without a provider.
 */

const FROM = env.EMAIL_FROM || "DollFace <no-reply@dollface.app>";

let resendClient: import("resend").Resend | null = null;
let smtpTransport: import("nodemailer").Transporter | null = null;

async function getResend() {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    const { Resend } = await import("resend");
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

async function getSmtp() {
  if (!env.SMTP_URL) return null;
  if (!smtpTransport) {
    const nodemailer = await import("nodemailer");
    smtpTransport = nodemailer.createTransport(env.SMTP_URL);
  }
  return smtpTransport;
}

export async function sendEmail(to: string, subject: string, body: string, htmlOverride?: string): Promise<void> {
  const html = htmlOverride ?? `<div style="font-family:system-ui,Arial,sans-serif;line-height:1.5;color:#2b2b2b">${body.replace(/\n/g, "<br/>")}</div>`;
  try {
    const resend = await getResend();
    if (resend) {
      const { error } = await resend.emails.send({ from: FROM, to, subject, html, text: body });
      if (error) throw new Error(error.message);
      logger.info({ to, subject, via: "resend" }, "email sent");
      return;
    }
    const smtp = await getSmtp();
    if (smtp) {
      await smtp.sendMail({ from: FROM, to, subject, html, text: body });
      logger.info({ to, subject, via: "smtp" }, "email sent");
      return;
    }
  } catch (err: any) {
    // Never let a transport hiccup break the calling flow (e.g. password reset).
    logger.error({ to, subject, err: err?.message }, "email send failed");
    return;
  }
  logger.info({ to, subject }, `[email:dev] ${body}`);
}
