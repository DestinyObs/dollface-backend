import { env } from "../env.js";

/**
 * Email transport. With RESEND_API_KEY or SMTP_URL set, wire the real client
 * here; until then dev-mode logs the message so flows work without a provider.
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  if (env.providers.email) {
    // TODO(prod): call Resend/SMTP here using env.RESEND_API_KEY / env.SMTP_URL
    console.log(`[email] → ${to}: ${subject}`);
    return;
  }
  console.log(`[email:dev] → ${to} | ${subject}\n${body}`);
}
