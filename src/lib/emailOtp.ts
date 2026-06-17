import { prisma } from "../db.js";
import { hashToken } from "./jwt.js";
import { sendEmail } from "../providers/email.js";
import { verificationEmail, welcomeEmail } from "./emailTemplates.js";
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

/** Issue + email a fresh verification code. Returns the code (for dev/testing). */
export async function issueEmailOtp(userId: string, email: string): Promise<string> {
  const code = genCode();
  await prisma.otp.create({ data: { userId, codeHash: hashToken(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) } });
  const tpl = verificationEmail(code);
  await sendEmail(email, tpl.subject, tpl.text, tpl.html);
  return code;
}

/** Verify a submitted code; on success marks the user's email verified + sends a welcome email. */
export async function verifyEmailOtp(userId: string, code: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: { userId, codeHash: hashToken(String(code)), usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  const [, user] = await prisma.$transaction([
    prisma.otp.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
  ]);
  // Welcome the user now that their email is confirmed (fire-and-forget).
  const w = welcomeEmail(user.name);
  sendEmail(user.email, w.subject, w.text, w.html).catch(() => {});
  return true;
}

/**
 * Expose the code in the response outside production, or in any environment when
 * EXPOSE_OTP=1 (for shared test deployments where testers have no inbox). Real
 * production with email configured should leave EXPOSE_OTP unset.
 */
export const exposeDevCode = (code: string) =>
  (!env.isProd || env.EXPOSE_OTP === "1") ? { devCode: code } : {};
