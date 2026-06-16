import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4200),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGINS: z.string().default(""),
  PUBLIC_URL: z.string().default("http://localhost:4200"),

  // ── Optional external providers (run in dev-mode fallback when unset) ──
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SMTP_URL: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  ADMIN_EMAILS: z.string().default(""),

  // ── AI vision (shade match + look recreation) ──
  // One or more Anthropic API keys, comma-separated, tried in order on failure
  // (rate-limit / quota / auth) so a dead key never takes the feature down.
  ANTHROPIC_API_KEYS: z.string().default(""),
  // Cheap, vision-capable default; override per environment if needed.
  ANTHROPIC_VISION_MODEL: z.string().default("claude-haiku-4-5-20251001"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("✗ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}
const e = parsed.data;

const anthropicKeys = e.ANTHROPIC_API_KEYS.split(",").map((s) => s.trim()).filter(Boolean);

export const env = {
  ...e,
  isProd: e.NODE_ENV === "production",
  corsOrigins: e.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
  adminEmails: e.ADMIN_EMAILS.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  anthropicKeys,
  /** Which external providers are wired with real credentials. */
  providers: {
    payments: !!e.STRIPE_SECRET_KEY,
    email: !!(e.RESEND_API_KEY || e.SMTP_URL),
    push: !!e.EXPO_ACCESS_TOKEN,
    storage: !!(e.CLOUDINARY_URL || e.AWS_S3_BUCKET),
    googleAuth: !!e.GOOGLE_CLIENT_ID,
    appleAuth: !!e.APPLE_CLIENT_ID,
    ai: anthropicKeys.length > 0,
  },
};
