import { env } from "../env.js";
import { logger } from "./logger.js";

/**
 * Error tracking (Sentry). Real capture when SENTRY_DSN is set; a no-op
 * otherwise so nothing depends on it being configured.
 */

let sentry: typeof import("@sentry/node") | null = null;

export async function initSentry(): Promise<void> {
  if (!env.providers.errorTracking) return;
  try {
    const Sentry = await import("@sentry/node");
    Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV, tracesSampleRate: 0.1 });
    sentry = Sentry;
    logger.info("Sentry error tracking enabled");
  } catch (err: any) {
    logger.error({ err: err?.message }, "Sentry init failed");
  }
}

export function captureException(err: unknown): void {
  sentry?.captureException(err);
}
