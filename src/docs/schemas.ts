/**
 * OpenAPI component schemas for every DollFace domain object. Kept in sync with
 * the API's `{ success, data }` payloads (mirror of dollface-mobile/lib/data/types.ts).
 */

const s = (type: string, extra: Record<string, unknown> = {}) => ({ type, ...extra });
const str = s("string");
const num = s("number");
const int = s("integer");
const bool = s("boolean");
const date = s("string", { format: "date-time" });
const arr = (items: unknown) => ({ type: "array", items });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const obj = (properties: Record<string, unknown>, required?: string[]) => ({
  type: "object",
  properties,
  ...(required ? { required } : {}),
});

export const DOMAIN_SCHEMAS: Record<string, unknown> = {
  // ── Envelope & errors ──────────────────────────────────
  Envelope: { type: "object", properties: { success: s("boolean", { example: true }), data: {} }, required: ["success"] },
  Error: obj({ success: s("boolean", { example: false }), message: str, code: str, errors: { type: "object", additionalProperties: str } }),

  // ── Auth & account ─────────────────────────────────────
  Tokens: obj({ accessToken: str, refreshToken: str }),
  User: obj({
    id: str, name: str, email: str, phone: s("string", { nullable: true }),
    avatarUrl: s("string", { nullable: true }), bio: s("string", { nullable: true }),
    role: s("string", { enum: ["USER", "ADMIN"] }),
    emailVerified: bool, phoneVerified: bool, createdAt: date,
  }),
  AuthResult: obj({ user: ref("User"), tokens: ref("Tokens"), emailVerificationRequired: bool }),
  MeStats: obj({ saved: str, done: str, matches: str }),
  BeautyProfile: obj({
    goals: arr(str), skinType: str, skinTone: str, undertone: str,
    faceConcerns: arr(str), preferredBrands: arr(str), skillLevel: str, budgetRange: str,
  }),

  // ── Home feed ──────────────────────────────────────────
  MatchedShadeSummary: obj({ name: str, product: str, matchPct: num, hex: str }),
  TrendingLook: obj({ id: str, label: str, meta: str, level: str, img: str }),
  CourseProgress: obj({ id: str, title: str, meta: str, pct: num, img: str }),
  HomeFeed: obj({ streak: int, matchedShade: { oneOf: [ref("MatchedShadeSummary"), { type: "null" }] }, trendingLooks: arr(ref("TrendingLook")), continueLearning: arr(ref("CourseProgress")) }),

  // ── Tutorials ──────────────────────────────────────────
  TutorialSummary: obj({ id: str, title: str, cat: str, mins: str, level: str, views: str, img: str }),
  FeaturedTutorial: obj({ id: str, eyebrow: str, title: str, meta: str, img: str }),
  TutorialStep: obj({ title: str, description: str, tip: str }),
  TutorialDetail: obj({ id: str, title: str, level: str, duration: str, views: str, description: str, img: str, steps: arr(ref("TutorialStep")) }),

  // ── Shade match ────────────────────────────────────────
  RecentMatch: obj({ id: str, name: str, brand: str, pct: str, color: str }),
  MatchAlternative: obj({ brand: str, product: str, shade: str, hex: str, price: str }),
  MatchResultItem: obj({ category: str, confidence: str, matchedShade: str, brand: str, product: str, hex: str, reason: str, alternatives: arr(ref("MatchAlternative")) }),
  MatchTone: obj({ label: str, sub: str, hex: str, confidence: str }),
  MatchResult: obj({ id: str, tone: ref("MatchTone"), items: arr(ref("MatchResultItem")), source: s("string", { enum: ["ai", "sample"] }) }),
  MatchHistoryItem: obj({ id: str, name: str, brand: str, pct: str, color: str, date: str }),
  ScanHistoryItem: obj({ id: str, tone: str, date: str, confidence: str }),

  // ── Recreate ───────────────────────────────────────────
  RecreateProduct: obj({ name: str, brand: str, shade: str, price: str }),
  RecreateSection: obj({ area: str, icon: str, label: str, description: str, technique: str, products: arr(ref("RecreateProduct")) }),
  Recreation: obj({ id: str, versions: arr(str), aiNote: str, sections: arr(ref("RecreateSection")), source: s("string", { enum: ["ai", "sample"] }) }),

  // ── Products & brands ──────────────────────────────────
  ProductShade: obj({ name: str, hex: str }),
  ProductSummary: obj({ id: str, name: str, brand: str, category: str, price: str, rating: str, img: str }),
  ProductDetail: obj({ id: str, name: str, brand: str, price: num, img: str, rating: str, reviewCount: str, highlights: arr(str), description: str, shades: arr(ref("ProductShade")) }),
  Brand: obj({ id: str, name: str, logo: str, description: str }),
  Review: obj({ id: str, author: str, rating: num, title: str, body: str, photos: arr(str), helpfulCount: int, createdAt: date }),

  // ── Commerce ───────────────────────────────────────────
  CartItem: obj({ id: str, productId: str, name: str, brand: str, price: num, shade: str, img: str, qty: int }),
  Cart: obj({ items: arr(ref("CartItem")), count: int, subtotal: num }),
  CartEstimate: obj({ subtotal: num, discount: num, shipping: num, tax: num, total: num, currency: str }),
  OrderItem: obj({ id: str, productId: str, name: str, brand: str, price: num, shade: str, img: str, qty: int }),
  Order: obj({ id: str, status: str, subtotal: num, shipping: num, tax: num, total: num, currency: str, trackingNo: str, carrier: str, createdAt: date, items: arr(ref("OrderItem")) }),
  Address: obj({ id: str, name: str, line1: str, line2: str, city: str, region: str, postcode: str, country: str, phone: str, isDefault: bool }, ["name", "line1", "city", "postcode", "country"]),
  PaymentMethod: obj({ id: str, brand: str, last4: str, expMonth: int, expYear: int, isDefault: bool }),
  ShippingOption: obj({ id: str, label: str, price: num, eta: str }),

  // ── Misc ───────────────────────────────────────────────
  Routine: obj({ id: str, name: str, time: str, steps: arr(str) }),
  Notification: obj({ id: str, icon: str, bg: str, color: str, title: str, body: str, time: str, read: bool, route: str }),
  Plan: obj({ id: str, name: str, price: str, unit: str, features: arr(str) }),
  SubscriptionState: obj({ plan: s("string", { enum: ["free", "pro"] }), status: str, current: ref("Plan"), pro: ref("Plan") }),
};

/**
 * Maps `METHOD /api/path` → the schema of the response `data` field, so the
 * primary endpoints document a typed payload instead of the generic envelope.
 * `[Name]` = array of that schema; `Name` = that schema.
 */
export const RESPONSE_SCHEMAS: Record<string, string> = {
  "GET /api/me": "User",
  "POST /api/auth/register": "AuthResult",
  "POST /api/auth/login": "AuthResult",
  "GET /api/feed/home": "HomeFeed",
  "GET /api/products": "[ProductSummary]",
  "GET /api/products/{id}": "ProductDetail",
  "GET /api/products/{id}/reviews": "[Review]",
  "GET /api/brands": "[Brand]",
  "GET /api/tutorials": "[TutorialSummary]",
  "GET /api/tutorials/{id}": "TutorialDetail",
  "GET /api/match/recent": "[RecentMatch]",
  "GET /api/match/history": "[MatchHistoryItem]",
  "GET /api/match/scans": "[ScanHistoryItem]",
  "GET /api/match/{id}": "MatchResult",
  "POST /api/match/selfie": "MatchResult",
  "POST /api/match/manual": "MatchResult",
  "GET /api/recreate/history": "[Recreation]",
  "GET /api/recreate/{id}": "Recreation",
  "GET /api/cart": "Cart",
  "GET /api/cart/estimate": "CartEstimate",
  "GET /api/checkout/shipping-options": "[ShippingOption]",
  "GET /api/orders": "[Order]",
  "GET /api/orders/{id}": "Order",
  "POST /api/orders": "Order",
  "GET /api/addresses": "[Address]",
  "GET /api/payments/methods": "[PaymentMethod]",
  "GET /api/notifications": "[Notification]",
  "GET /api/routines": "[Routine]",
  "GET /api/subscription": "SubscriptionState",
};

/** Build the response `data` schema (array or single ref) from a RESPONSE_SCHEMAS value. */
export function dataSchema(spec: string): unknown {
  const m = spec.match(/^\[(.+)\]$/);
  return m ? { type: "array", items: { $ref: `#/components/schemas/${m[1]}` } } : { $ref: `#/components/schemas/${spec}` };
}
