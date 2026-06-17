import { prisma } from "../db.js";
import { hashToken } from "./jwt.js";
import { sendEmail } from "../providers/email.js";
import { env } from "../env.js";

/**
 * Email verification via a 6-digit code (better mobile UX than a deep link).
 * Codes are stored hashed in the Otp table keyed by userId and emailed; in dev
 * (no email provider) the code is also returned so the flow is testable.
 */

const CODE_TTL_MS = 10 * 60 * 1000;

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Branded, email-client-safe verification email. Table-based layout, inline
 * styles, solid colours (no gradients — they break in Gmail/Outlook), and the
 * code shown as individual digit boxes so it never wraps or clips.
 */
export function verificationEmailHtml(code: string): string {
  const font = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const digits = code
    .split("")
    .map(
      (d) =>
        `<td align="center" valign="middle" style="width:46px;height:58px;background-color:#f7eef2;border:1px solid #ecdfe6;border-radius:10px;font-family:${font};font-size:26px;font-weight:700;color:#753248;">${d}</td>` +
        `<td style="width:8px;font-size:0;line-height:0;">&nbsp;</td>`,
    )
    .join("")
    .replace(/<td style="width:8px;[^>]*>&nbsp;<\/td>$/, "");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4eef1;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4eef1;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #ece3e7;border-radius:16px;">
        <tr><td align="center" style="background-color:#753248;border-radius:16px 16px 0 0;padding:30px 32px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">DollFace</span>
        </td></tr>
        <tr><td style="padding:40px 44px 6px 44px;font-family:${font};">
          <h1 style="margin:0 0 12px 0;font-size:20px;line-height:28px;color:#1f1a1c;font-weight:700;">Verify your email address</h1>
          <p style="margin:0;font-size:15px;line-height:24px;color:#6b5e63;">Enter the code below in the DollFace app to finish creating your account. This code expires in 10 minutes.</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 44px 8px 44px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${digits}</tr></table>
        </td></tr>
        <tr><td style="padding:14px 44px 40px 44px;font-family:${font};">
          <p style="margin:0;font-size:13px;line-height:20px;color:#9a8d92;">Didn't request this? You can safely ignore this email — no account is created without this code.</p>
        </td></tr>
        <tr><td align="center" style="background-color:#faf7f5;border-radius:0 0 16px 16px;padding:24px 44px;font-family:${font};">
          <p style="margin:0;font-size:12px;line-height:18px;color:#b3a7ac;">DollFace &middot; Beauty, personalised for you</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Issue + email a fresh verification code. Returns the code (for dev/testing). */
export async function issueEmailOtp(userId: string, email: string): Promise<string> {
  const code = genCode();
  await prisma.otp.create({ data: { userId, codeHash: hashToken(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) } });
  await sendEmail(
    email,
    "Your DollFace verification code",
    `Welcome to DollFace. Your verification code is ${code}. It expires in 10 minutes. If you didn't create an account, you can ignore this email.`,
    verificationEmailHtml(code),
  );
  return code;
}

/** Verify a submitted code; on success marks the user's email verified. */
export async function verifyEmailOtp(userId: string, code: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: { userId, codeHash: hashToken(String(code)), usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  await prisma.$transaction([
    prisma.otp.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
  ]);
  return true;
}

/**
 * Expose the code in the response outside production, or in any environment when
 * EXPOSE_OTP=1 (for shared test deployments where testers have no inbox). Real
 * production with email configured should leave EXPOSE_OTP unset.
 */
export const exposeDevCode = (code: string) =>
  (!env.isProd || env.EXPOSE_OTP === "1") ? { devCode: code } : {};
