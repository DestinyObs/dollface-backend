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

/** Branded HTML email for the 6-digit verification code. */
function verificationEmailHtml(code: string): string {
  const spaced = code.split("").join("&nbsp;&nbsp;");
  return `<!doctype html><html><body style="margin:0;background:#FAF7F5;padding:0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F5;padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(117,50,72,0.08)">
        <tr><td style="background:linear-gradient(135deg,#2D0F1A,#753248);padding:32px 32px 26px">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:0.5px">DollFace</div>
          <div style="font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px">Beauty, personalised for you</div>
        </td></tr>
        <tr><td style="padding:34px 32px 8px">
          <div style="font-family:Georgia,serif;font-size:21px;color:#1F1A1C;font-weight:700">Confirm your email</div>
          <div style="font-family:Arial,sans-serif;font-size:14px;color:#6b5e63;line-height:1.6;margin-top:10px">
            Enter this 6-digit code in the app to verify your account. It expires in 10 minutes.
          </div>
        </td></tr>
        <tr><td style="padding:22px 32px 6px" align="center">
          <div style="font-family:'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:6px;color:#753248;background:#F5EAEF;border-radius:14px;padding:18px 10px;display:inline-block;min-width:240px">${spaced}</div>
        </td></tr>
        <tr><td style="padding:18px 32px 34px">
          <div style="font-family:Arial,sans-serif;font-size:12.5px;color:#9a8d92;line-height:1.6">
            If you didn't create a DollFace account, you can safely ignore this email — no account will be created without this code.
          </div>
        </td></tr>
        <tr><td style="background:#FAF7F5;padding:18px 32px;text-align:center">
          <div style="font-family:Arial,sans-serif;font-size:11.5px;color:#b3a7ac">© DollFace · Beauty, personalised for you</div>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
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
