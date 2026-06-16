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

/** Issue + email a fresh verification code. Returns the code (for dev/testing). */
export async function issueEmailOtp(userId: string, email: string): Promise<string> {
  const code = genCode();
  await prisma.otp.create({ data: { userId, codeHash: hashToken(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) } });
  await sendEmail(
    email,
    "Your DollFace verification code",
    `Welcome to DollFace 💄\n\nYour verification code is ${code}.\nIt expires in 10 minutes.\n\nIf you didn't create an account, you can ignore this email.`,
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

/** Expose the dev code only outside production (mirrors the password-reset devToken). */
export const exposeDevCode = (code: string) => (env.isProd ? {} : { devCode: code });
