/**
 * Hand-authored request/response detail for the primary endpoints, keyed by
 * "METHOD /api/path" (params as {id}). Merged into the auto-generated OpenAPI so
 * Swagger shows the REAL request fields + example responses, not an empty object.
 */
type Schema = Record<string, unknown>;
interface Enrichment {
  request?: { properties: Schema; required?: string[] };
  responseExample?: unknown;
}

const env = (data: unknown) => ({ success: true, data });

export const ENRICH: Record<string, Enrichment> = {
  // ── Auth ──────────────────────────────────────────────
  "POST /api/auth/register": {
    request: { properties: { name: { type: "string", example: "Jane Doe" }, email: { type: "string", format: "email", example: "jane@dollface.app" }, password: { type: "string", minLength: 8, example: "password123" } }, required: ["name", "email", "password"] },
    responseExample: env({ user: { id: "cuid", name: "Jane Doe", email: "jane@dollface.app", role: "USER", createdAt: "2026-06-01T00:00:00.000Z" }, tokens: { accessToken: "jwt…", refreshToken: "jwt…" } }),
  },
  "POST /api/auth/login": {
    request: { properties: { email: { type: "string", format: "email" }, password: { type: "string" } }, required: ["email", "password"] },
    responseExample: env({ user: { id: "cuid", name: "Jane Doe", email: "jane@dollface.app", role: "USER" }, tokens: { accessToken: "jwt…", refreshToken: "jwt…" } }),
  },
  "POST /api/auth/refresh-token": {
    request: { properties: { refreshToken: { type: "string" } }, required: ["refreshToken"] },
    responseExample: env({ accessToken: "jwt…" }),
  },
  "POST /api/auth/forgot-password": { request: { properties: { email: { type: "string", format: "email" } }, required: ["email"] }, responseExample: env({ message: "If that email exists, a reset link has been sent." }) },
  "POST /api/auth/reset-password": { request: { properties: { token: { type: "string" }, password: { type: "string", minLength: 8 } }, required: ["token", "password"] }, responseExample: env({ message: "Password updated." }) },
  "POST /api/auth/change-password": { request: { properties: { currentPassword: { type: "string" }, newPassword: { type: "string", minLength: 8 } }, required: ["currentPassword", "newPassword"] } },
  "POST /api/auth/social/{provider}": { request: { properties: { idToken: { type: "string", description: "Google/Apple identity token" } }, required: ["idToken"] }, responseExample: env({ user: { id: "cuid", name: "Jane", email: "jane@x.com" }, tokens: { accessToken: "jwt…", refreshToken: "jwt…" }, isNewUser: false }) },

  // ── Account ───────────────────────────────────────────
  "PATCH /api/me": { request: { properties: { name: { type: "string" }, bio: { type: "string" }, avatarUrl: { type: "string", format: "uri" } } } },
  "PATCH /api/me/settings": { request: { properties: { push: { type: "boolean" }, email: { type: "boolean" }, tips: { type: "boolean" }, analytics: { type: "boolean" }, personalisation: { type: "boolean" }, storeScans: { type: "boolean" } } } },
  "PATCH /api/me/preferences": { request: { properties: { language: { type: "string" }, theme: { type: "string", enum: ["light", "dark", "system"] }, currency: { type: "string" }, country: { type: "string" }, units: { type: "string", enum: ["metric", "imperial"] } } } },
  "GET /api/me/stats": { responseExample: env({ saved: "12", done: "4", matches: "3" }) },

  // ── Beauty profile ────────────────────────────────────
  "PUT /api/beauty-profile": { request: { properties: { goals: { type: "array", items: { type: "string" } }, skinType: { type: "string" }, skinTone: { type: "string" }, undertone: { type: "string" }, faceConcerns: { type: "array", items: { type: "string" } }, preferredBrands: { type: "array", items: { type: "string" } }, skillLevel: { type: "string" }, budgetRange: { type: "string" } } } },

  // ── Feed / catalog ────────────────────────────────────
  "GET /api/feed/home": { responseExample: env({ streak: 12, matchedShade: { name: "Warm Ivory 2.0", product: "NARS · 92% match", matchPct: 92, hex: "#E8C9A8" }, trendingLooks: [{ id: "soft-glam", label: "Soft Glam", meta: "2.4k saves", level: "Easy", img: "https://…" }], continueLearning: [] }) },
  "GET /api/products": { responseExample: env([{ id: "1", name: "Pro Filt'r Soft Matte Foundation", brand: "Fenty Beauty", category: "Foundation", price: "£34", rating: "4.8", img: "https://…" }]) },
  "GET /api/products/{id}": { responseExample: env({ id: "1", name: "Pro Filt'r Soft Matte Foundation", brand: "Fenty Beauty", price: 34, img: "https://…", rating: "4.8", reviewCount: "2.4k reviews", highlights: ["Full coverage", "Soft matte"], description: "…", shades: [{ name: "220N", hex: "#C4875A" }] }) },
  "POST /api/products/{id}/reviews": { request: { properties: { rating: { type: "integer", minimum: 1, maximum: 5 }, title: { type: "string" }, body: { type: "string" }, photos: { type: "array", items: { type: "string" } } }, required: ["rating", "body"] }, responseExample: env({ id: "cuid", author: "Jane Doe", rating: 5, body: "Love it", photos: [], helpfulCount: 0, createdAt: "2026-06-01T00:00:00.000Z" }) },

  // ── Match / recreate ──────────────────────────────────
  "POST /api/match/manual": { request: { properties: { shade: { type: "string", example: "NC40" }, brand: { type: "string", example: "MAC" }, category: { type: "string", example: "Foundation" } }, required: ["shade", "category"] }, responseExample: env({ id: "cuid", tone: { label: "Medium Tan · Warm Golden", sub: "Based on your shade entry", hex: "#C4875A", confidence: "High confidence match" }, items: [{ category: "Foundation", brand: "Fenty Beauty", matchedShade: "220 Natural Beige", alternatives: [] }] }) },
  "POST /api/match/selfie": { request: { properties: { selfie: { type: "string", format: "binary", description: "multipart/form-data image" } } }, responseExample: env({ id: "cuid", tone: { label: "Medium Tan · Warm Golden", hex: "#C4875A" }, items: [] }) },
  "POST /api/recreate/upload": { request: { properties: { image: { type: "string", format: "binary", description: "multipart inspiration image" } } }, responseExample: env({ id: "cuid", status: "PROCESSING" }) },

  // ── Commerce ──────────────────────────────────────────
  "POST /api/cart/items": { request: { properties: { productId: { type: "string" }, name: { type: "string" }, brand: { type: "string" }, price: { type: "number" }, shade: { type: "string" }, img: { type: "string" }, qty: { type: "integer", default: 1 } }, required: ["name", "brand", "price"] }, responseExample: env({ items: [{ id: "cuid", productId: "1", name: "Pro Filt'r", brand: "Fenty", price: 34, qty: 1 }], count: 1, subtotal: 34 }) },
  "PATCH /api/cart/items/{id}": { request: { properties: { qty: { type: "integer" } }, required: ["qty"] } },
  "POST /api/cart/coupon": { request: { properties: { code: { type: "string", example: "WELCOME10" } }, required: ["code"] } },
  "GET /api/cart/estimate": { responseExample: env({ subtotal: 68, discount: 0, shipping: 0, tax: 13.6, total: 81.6, currency: "GBP" }) },
  "POST /api/orders": { request: { properties: { addressId: { type: "string", description: "optional; defaults to the user's default address" } } }, responseExample: env({ id: "cuid", status: "PAID", subtotal: 68, shipping: 0, tax: 13.6, total: 81.6, currency: "GBP", items: [{ name: "Pro Filt'r", brand: "Fenty", price: 34, qty: 2 }] }) },
  "POST /api/addresses": { request: { properties: { name: { type: "string" }, line1: { type: "string" }, line2: { type: "string" }, city: { type: "string" }, region: { type: "string" }, postcode: { type: "string" }, country: { type: "string", default: "GB" }, phone: { type: "string" }, isDefault: { type: "boolean" } }, required: ["name", "line1", "city", "postcode"] } },
  "POST /api/payments/methods": { request: { properties: { brand: { type: "string", default: "visa" }, last4: { type: "string", minLength: 4, maxLength: 4 }, expMonth: { type: "integer", minimum: 1, maximum: 12 }, expYear: { type: "integer" }, isDefault: { type: "boolean" } }, required: ["last4", "expMonth", "expYear"] } },
  "POST /api/payments/intent": { request: { properties: { orderId: { type: "string" }, amount: { type: "number" } } }, responseExample: env({ id: "pi_…", clientSecret: "pi_…_secret_…", amount: 8160, currency: "gbp", status: "requires_payment_method" }) },

  // ── Subscription / promos ─────────────────────────────
  "POST /api/subscription/change": { request: { properties: { plan: { type: "string", enum: ["free", "pro"] } }, required: ["plan"] } },
  "POST /api/promos/validate": { request: { properties: { code: { type: "string" } }, required: ["code"] }, responseExample: env({ code: "DOLL5", type: "FIXED", value: 5 }) },
  "POST /api/referrals/redeem": { request: { properties: { code: { type: "string" } }, required: ["code"] } },

  // ── Engagement ────────────────────────────────────────
  "POST /api/routines": { request: { properties: { name: { type: "string" }, time: { type: "string" }, steps: { type: "array", items: { type: "string" } } }, required: ["name", "time", "steps"] } },
  "POST /api/devices": { request: { properties: { expoPushToken: { type: "string" }, platform: { type: "string", enum: ["ios", "android", "web"] }, appVersion: { type: "string" } }, required: ["platform"] } },
  "POST /api/tutorials/{id}/progress": { request: { properties: { step: { type: "integer" }, percent: { type: "integer", minimum: 0, maximum: 100 } }, required: ["percent"] } },
  "POST /api/tutorials/{id}/comments": { request: { properties: { body: { type: "string" } }, required: ["body"] } },

  // ── Platform ──────────────────────────────────────────
  "POST /api/support/contact": { request: { properties: { name: { type: "string" }, email: { type: "string", format: "email" }, message: { type: "string" } }, required: ["name", "email", "message"] } },
  "POST /api/support/tickets": { request: { properties: { subject: { type: "string" }, message: { type: "string" } }, required: ["subject", "message"] } },
  "POST /api/feedback": { request: { properties: { message: { type: "string" } }, required: ["message"] } },
  "POST /api/media": { request: { properties: { file: { type: "string", format: "binary" }, url: { type: "string" }, type: { type: "string" } } }, responseExample: env({ id: "cuid", url: "https://…/uploads/asset.jpg", type: "image/jpeg" }) },
  "POST /api/events": { request: { properties: { name: { type: "string" }, props: { type: "object" }, ts: { type: "string", format: "date-time" } }, required: ["name"] } },
  "POST /api/marketing/newsletter": { request: { properties: { email: { type: "string", format: "email" } }, required: ["email"] } },
  "POST /api/marketing/waitlist": { request: { properties: { email: { type: "string", format: "email" }, source: { type: "string" } }, required: ["email"] } },

  // ── Admin ─────────────────────────────────────────────
  "POST /api/admin/promos": { request: { properties: { code: { type: "string" }, type: { type: "string", enum: ["PERCENT", "FIXED"] }, value: { type: "number" }, expiresAt: { type: "string", format: "date-time" } }, required: ["code", "type", "value"] } },
  "POST /api/admin/notifications/broadcast": { request: { properties: { title: { type: "string" }, body: { type: "string" }, route: { type: "string" } }, required: ["title", "body"] } },
};
