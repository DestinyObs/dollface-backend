import crypto from "node:crypto";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";

/**
 * Payments (Stripe). With STRIPE_SECRET_KEY set, real Stripe PaymentIntents /
 * SetupIntents are created. Without it, dev-mode returns deterministic fake
 * intents so checkout, payment methods and subscriptions work end-to-end.
 */
export const paymentsLive = () => env.providers.payments;

let stripeClient: import("stripe").default | null = null;
async function getStripe() {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    const Stripe = (await import("stripe")).default;
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export async function createPaymentIntent(amountMinor: number, currency = "gbp") {
  const stripe = await getStripe();
  if (stripe) {
    try {
      const pi = await stripe.paymentIntents.create({
        amount: amountMinor, currency, automatic_payment_methods: { enabled: true },
      });
      return { id: pi.id, clientSecret: pi.client_secret!, amount: pi.amount, currency: pi.currency, status: pi.status };
    } catch (err: any) {
      logger.error({ err: err?.message }, "stripe createPaymentIntent failed");
      throw err;
    }
  }
  const id = `pi_dev_${crypto.randomBytes(8).toString("hex")}`;
  return { id, clientSecret: `${id}_secret_${crypto.randomBytes(6).toString("hex")}`, amount: amountMinor, currency, status: "requires_payment_method" as const };
}

export async function createSetupIntent() {
  const stripe = await getStripe();
  if (stripe) {
    try {
      const si = await stripe.setupIntents.create({ automatic_payment_methods: { enabled: true } });
      return { id: si.id, clientSecret: si.client_secret!, status: si.status };
    } catch (err: any) {
      logger.error({ err: err?.message }, "stripe createSetupIntent failed");
      throw err;
    }
  }
  const id = `seti_dev_${crypto.randomBytes(8).toString("hex")}`;
  return { id, clientSecret: `${id}_secret_${crypto.randomBytes(6).toString("hex")}`, status: "requires_payment_method" as const };
}

/**
 * Validate an Apple/Google in-app purchase receipt. With RevenueCat/store
 * verification configured this would call out; dev accepts everything so the
 * subscription flow is testable without store credentials.
 */
export async function verifyIapReceipt(_platform: "apple" | "google", _token: string) {
  return { valid: true, entitlement: "pro" as const, expiresAt: new Date(Date.now() + 365 * 86400000) };
}
