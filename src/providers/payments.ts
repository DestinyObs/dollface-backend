import crypto from "node:crypto";
import { env } from "../env.js";

/**
 * Payments (Stripe). Dev-mode returns deterministic fake intents so checkout,
 * payment methods and subscriptions work end-to-end without a Stripe account.
 * With STRIPE_SECRET_KEY set, wire the Stripe SDK in the marked spots.
 */
export const paymentsLive = () => env.providers.payments;

export async function createPaymentIntent(amountMinor: number, currency = "gbp") {
  if (paymentsLive()) {
    // TODO(prod): stripe.paymentIntents.create({ amount: amountMinor, currency })
  }
  const id = `pi_dev_${crypto.randomBytes(8).toString("hex")}`;
  return { id, clientSecret: `${id}_secret_${crypto.randomBytes(6).toString("hex")}`, amount: amountMinor, currency, status: "requires_payment_method" as const };
}

export async function createSetupIntent() {
  const id = `seti_dev_${crypto.randomBytes(8).toString("hex")}`;
  return { id, clientSecret: `${id}_secret_${crypto.randomBytes(6).toString("hex")}`, status: "requires_payment_method" as const };
}

/** Validate an Apple/Google in-app purchase receipt. Dev accepts everything. */
export async function verifyIapReceipt(_platform: "apple" | "google", _token: string) {
  if (paymentsLive()) {
    // TODO(prod): verify with App Store / Play / RevenueCat
  }
  return { valid: true, entitlement: "pro" as const, expiresAt: new Date(Date.now() + 365 * 86400000) };
}
