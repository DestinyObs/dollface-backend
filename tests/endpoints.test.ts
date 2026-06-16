/**
 * Full endpoint coverage — exercises every route's request + response.
 * Resources are created and chained (cart→order, review→helpful, etc.) so
 * sub-resource endpoints get real ids. Endpoints that need out-of-band tokens
 * (email verify / OTP / magic-link) are exercised on their rejection path.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();
const uniqueEmail = () => `ep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@dollface.test`;

let token = "";
let refreshToken = "";
let adminToken = "";
const A = () => ({ Authorization: `Bearer ${token}` });
const ADM = () => ({ Authorization: `Bearer ${adminToken}` });

/** Assert a successful envelope (or a webhook ack). */
function expectOk(res: { status: number; body: any }, label: string) {
  const good = res.body?.success === true || res.body?.received === true || res.body?.status === "ok";
  if (!good) throw new Error(`${label} → ${res.status} ${JSON.stringify(res.body).slice(0, 160)}`);
  expect(good).toBe(true);
}

beforeAll(async () => {
  const reg = await request(app).post("/api/auth/register").send({ name: "Endpoint Tester", email: uniqueEmail(), password: "password123" });
  token = reg.body.data.tokens.accessToken;
  refreshToken = reg.body.data.tokens.refreshToken;

  const adminEmail = (process.env.ADMIN_EMAILS ?? "admin@dollface.app").split(",")[0].trim();
  const areg = await request(app).post("/api/auth/register").send({ name: "Admin", email: adminEmail, password: "password123" });
  adminToken = areg.body?.data?.tokens?.accessToken
    ?? (await request(app).post("/api/auth/login").send({ email: adminEmail, password: "password123" })).body.data.tokens.accessToken;
});

describe("system & content (public)", () => {
  it("health + readiness + config", async () => {
    expectOk(await request(app).get("/health"), "GET /health");
    expectOk(await request(app).get("/api/system/config"), "config");
    expectOk(await request(app).get("/api/system/feature-flags"), "flags");
    expectOk(await request(app).get("/api/system/version-check?platform=ios"), "version-check");
    expectOk(await request(app).get("/api/system/ready"), "ready");
    expectOk(await request(app).get("/api/system/maintenance"), "maintenance");
    expectOk(await request(app).get("/api/system/locales"), "locales");
    expectOk(await request(app).get("/api/system/countries"), "countries");
    expectOk(await request(app).get("/api/system/i18n/en"), "i18n");
  });
  it("content", async () => {
    for (const p of ["terms", "privacy", "banners", "collections", "articles", "faq", "help", "glossary", "whats-new"]) {
      expectOk(await request(app).get(`/api/content/${p}`), `content/${p}`);
    }
  });
});

describe("auth", () => {
  it("login / refresh / me / check-email", async () => {
    const email = uniqueEmail();
    await request(app).post("/api/auth/register").send({ name: "Auth User", email, password: "password123" });
    expectOk(await request(app).post("/api/auth/login").send({ email, password: "password123" }), "login");
    expectOk(await request(app).post("/api/auth/refresh-token").send({ refreshToken }), "refresh");
    expectOk(await request(app).get("/api/auth/me").set(A()), "me");
    expectOk(await request(app).get(`/api/auth/check-email?email=${email}`), "check-email");
  });
  it("forgot / reset / change-password", async () => {
    const email = uniqueEmail();
    await request(app).post("/api/auth/register").send({ name: "PW", email, password: "password123" });
    const f = await request(app).post("/api/auth/forgot-password").send({ email });
    expectOk(f, "forgot");
    expectOk(await request(app).post("/api/auth/reset-password").send({ token: f.body.data.devToken, password: "newpass1234" }), "reset");
    const login = await request(app).post("/api/auth/login").send({ email, password: "newpass1234" });
    const t = login.body.data.tokens.accessToken;
    expectOk(await request(app).post("/api/auth/change-password").set({ Authorization: `Bearer ${t}` }).send({ currentPassword: "newpass1234", newPassword: "another12345" }), "change-password");
  });
  it("social / sessions / mfa / otp / magic-link / logout", async () => {
    expectOk(await request(app).post("/api/auth/social/google").send({ idToken: "x.eyJlbWFpbCI6InNvY2lhbF9lcEBkb2xsZmFjZS5hcHAifQ.y" }), "social");
    expectOk(await request(app).post("/api/auth/resend-verification").set(A()), "resend-verification");
    expectOk(await request(app).post("/api/auth/change-email").set(A()).send({ newEmail: uniqueEmail(), password: "password123" }), "change-email");
    const sessions = await request(app).get("/api/auth/sessions").set(A());
    expectOk(sessions, "sessions");
    expectOk(await request(app).post("/api/auth/mfa/setup").set(A()), "mfa/setup");
    expectOk(await request(app).post("/api/auth/mfa/verify").set(A()).send({ code: "123456" }), "mfa/verify");
    expectOk(await request(app).post("/api/auth/mfa/challenge").set(A()).send({ code: "123456" }), "mfa/challenge");
    expectOk(await request(app).delete("/api/auth/mfa").set(A()), "mfa delete");
    expectOk(await request(app).post("/api/auth/otp/request").send({ phone: "+447700900000" }), "otp/request");
    expect((await request(app).post("/api/auth/otp/verify").send({ phone: "+447700900000", code: "000000" })).status).toBe(400);
    expectOk(await request(app).post("/api/auth/magic-link").send({ email: "nobody@dollface.test" }), "magic-link");
    expect((await request(app).post("/api/auth/magic-link/verify").send({ token: "bad" })).status).toBe(400);
    expect((await request(app).post("/api/auth/verify-email").send({ token: "bad" })).status).toBe(400);
    expectOk(await request(app).post("/api/auth/logout").send({ refreshToken: "whatever" }), "logout");
  });
});

describe("account & profile", () => {
  it("me CRUD + settings + prefs + consents + export + activity", async () => {
    expectOk(await request(app).get("/api/me").set(A()), "GET me");
    expectOk(await request(app).patch("/api/me").set(A()).send({ bio: "Beauty lover" }), "PATCH me");
    expectOk(await request(app).get("/api/me/stats").set(A()), "stats");
    expectOk(await request(app).get("/api/me/settings").set(A()), "settings get");
    expectOk(await request(app).patch("/api/me/settings").set(A()).send({ push: false }), "settings patch");
    expectOk(await request(app).post("/api/me/avatar").set(A()).send({ url: "https://x/a.jpg" }), "avatar");
    expectOk(await request(app).delete("/api/me/avatar").set(A()), "avatar delete");
    expectOk(await request(app).get("/api/me/preferences").set(A()), "prefs get");
    expectOk(await request(app).patch("/api/me/preferences").set(A()).send({ currency: "USD" }), "prefs patch");
    expectOk(await request(app).get("/api/me/consents").set(A()), "consents get");
    expectOk(await request(app).patch("/api/me/consents").set(A()).send({ marketing: true }), "consents patch");
    const exp = await request(app).post("/api/me/export").set(A());
    expectOk(exp, "export");
    expectOk(await request(app).get(`/api/me/export/${exp.body.data.jobId}`).set(A()), "export status");
    expectOk(await request(app).get("/api/me/activity").set(A()), "activity");
  });
  it("beauty profile", async () => {
    expectOk(await request(app).get("/api/beauty-profile").set(A()), "bp get");
    expectOk(await request(app).put("/api/beauty-profile").set(A()).send({ skinTone: "Medium" }), "bp put");
    expectOk(await request(app).patch("/api/beauty-profile").set(A()).send({ undertone: "Warm" }), "bp patch");
    expectOk(await request(app).post("/api/beauty-profile/complete").set(A()), "bp complete");
    expectOk(await request(app).get("/api/beauty-profile/options").set(A()), "bp options");
    expectOk(await request(app).post("/api/beauty-profile/re-analyse").set(A()), "bp re-analyse");
    expectOk(await request(app).get("/api/beauty-profile/history").set(A()), "bp history");
  });
});

describe("catalog: tutorials / learning / products / brands", () => {
  it("tutorials", async () => {
    expectOk(await request(app).get("/api/tutorials"), "list");
    expectOk(await request(app).get("/api/tutorials?page=1&limit=2"), "paginated");
    expectOk(await request(app).get("/api/tutorials/featured"), "featured");
    expectOk(await request(app).get("/api/tutorials/categories"), "categories");
    expectOk(await request(app).post("/api/tutorials/1/save").set(A()), "save");
    expectOk(await request(app).get("/api/tutorials/saved").set(A()), "saved");
    expectOk(await request(app).delete("/api/tutorials/1/save").set(A()), "unsave");
    expectOk(await request(app).post("/api/tutorials/1/complete").set(A()), "complete");
    expectOk(await request(app).get("/api/tutorials/1/related"), "related");
    expectOk(await request(app).get("/api/tutorials/1/stream"), "stream");
    expectOk(await request(app).post("/api/tutorials/1/progress").set(A()).send({ percent: 40 }), "progress");
    expectOk(await request(app).post("/api/tutorials/1/like").set(A()), "like");
    expectOk(await request(app).delete("/api/tutorials/1/like").set(A()), "unlike");
    expectOk(await request(app).post("/api/tutorials/1/comments").set(A()).send({ body: "Great!" }), "comment");
    expectOk(await request(app).get("/api/tutorials/1/comments"), "comments");
    expectOk(await request(app).get("/api/tutorials/1"), "detail");
  });
  it("learning", async () => {
    expectOk(await request(app).get("/api/learning/progress").set(A()), "progress");
    expectOk(await request(app).get("/api/learning/achievements").set(A()), "achievements");
    expectOk(await request(app).get("/api/learning/playlists").set(A()), "playlists");
  });
  it("products", async () => {
    expectOk(await request(app).get("/api/products"), "list");
    expectOk(await request(app).get("/api/products?category=Foundation&search=fenty&page=1&limit=2"), "filtered");
    expectOk(await request(app).get("/api/products/categories"), "categories");
    expectOk(await request(app).get("/api/products/trending"), "trending");
    expectOk(await request(app).get("/api/products/new"), "new");
    expectOk(await request(app).post("/api/products/1/view").set(A()), "view");
    expectOk(await request(app).get("/api/products/recently-viewed").set(A()), "recently-viewed");
    expectOk(await request(app).get("/api/products/barcode/5000"), "barcode");
    expectOk(await request(app).get("/api/products/1/variants"), "variants");
    expectOk(await request(app).get("/api/products/1/recommendations"), "recommendations");
    expectOk(await request(app).get("/api/products/1/related"), "related");
    expectOk(await request(app).get("/api/products/1/ingredients"), "ingredients");
    expectOk(await request(app).get("/api/products/1/price-history"), "price-history");
    expectOk(await request(app).post("/api/products/1/restock-alert").set(A()), "restock-alert");
    expectOk(await request(app).post("/api/products/1/save").set(A()), "save");
    expectOk(await request(app).get("/api/products/saved").set(A()), "saved");
    expectOk(await request(app).delete("/api/products/1/save").set(A()), "unsave");
    expectOk(await request(app).get("/api/products/1"), "detail");
  });
  it("brands", async () => {
    expectOk(await request(app).get("/api/brands"), "list");
    expectOk(await request(app).get("/api/brands/fenty-beauty"), "detail");
    expectOk(await request(app).post("/api/brands/fenty-beauty/follow").set(A()), "follow");
    expectOk(await request(app).delete("/api/brands/fenty-beauty/follow").set(A()), "unfollow");
  });
  it("reviews & Q&A", async () => {
    const rev = await request(app).post("/api/products/1/reviews").set(A()).send({ rating: 5, body: "Love it" });
    expectOk(rev, "post review");
    expectOk(await request(app).get("/api/products/1/reviews"), "list reviews");
    expectOk(await request(app).post(`/api/reviews/${rev.body.data.id}/helpful`).set(A()), "helpful");
    expectOk(await request(app).patch(`/api/reviews/${rev.body.data.id}`).set(A()).send({ body: "Updated" }), "edit review");
    expectOk(await request(app).post(`/api/reviews/${rev.body.data.id}/report`).set(A()), "report");
    const q = await request(app).post("/api/products/1/questions").set(A()).send({ body: "Is it matte?" });
    expectOk(q, "post question");
    expectOk(await request(app).get("/api/products/1/questions"), "list questions");
    expectOk(await request(app).post(`/api/questions/${q.body.data.id}/answers`).set(A()).send({ body: "Yes" }), "answer");
    expectOk(await request(app).delete(`/api/reviews/${rev.body.data.id}`).set(A()), "delete review");
  });
});

describe("beauty engine: match / recreate / shelf", () => {
  let matchId = "";
  let recId = "";
  it("match", async () => {
    expectOk(await request(app).get("/api/match/categories"), "categories");
    const m = await request(app).post("/api/match/manual").set(A()).send({ shade: "NC40", category: "Foundation" });
    expectOk(m, "manual"); matchId = m.body.data.id;
    expectOk(await request(app).post("/api/match/selfie").set(A()), "selfie");
    expectOk(await request(app).get("/api/match/recent").set(A()), "recent");
    expectOk(await request(app).get("/api/match/history").set(A()), "history");
    expectOk(await request(app).get("/api/match/scans").set(A()), "scans");
    expectOk(await request(app).get(`/api/match/selfie/${matchId}/status`).set(A()), "status");
    expectOk(await request(app).post("/api/match/compare").set(A()).send({ a: "NC40", b: "220" }), "compare");
    expectOk(await request(app).post("/api/match/undertone-test").set(A()).send({ answers: ["warm", "warm"] }), "undertone");
    expectOk(await request(app).post(`/api/match/${matchId}/save`).set(A()), "save");
    expectOk(await request(app).get(`/api/match/${matchId}`).set(A()), "get");
    expectOk(await request(app).delete(`/api/match/${matchId}`).set(A()), "delete");
  });
  it("recreate", async () => {
    const r = await request(app).post("/api/recreate/upload").set(A());
    expectOk(r, "upload"); recId = r.body.data.id;
    expectOk(await request(app).get("/api/recreate/history").set(A()), "history");
    expectOk(await request(app).get("/api/recreate/gallery").set(A()), "gallery");
    expectOk(await request(app).get(`/api/recreate/${recId}/status`).set(A()), "status");
    expectOk(await request(app).post(`/api/recreate/${recId}/save`).set(A()), "save");
    expectOk(await request(app).post(`/api/recreate/${recId}/share`).set(A()), "share");
    expectOk(await request(app).post(`/api/recreate/${recId}/report`).set(A()), "report");
    expectOk(await request(app).get(`/api/recreate/${recId}`).set(A()), "get");
    expectOk(await request(app).delete(`/api/recreate/${recId}`).set(A()), "delete");
  });
  it("shelf", async () => {
    const s = await request(app).post("/api/shelf").set(A()).send({ productId: "1", shade: "220N" });
    expectOk(s, "add");
    expectOk(await request(app).get("/api/shelf").set(A()), "list");
    expectOk(await request(app).get("/api/shelf/dupes/1").set(A()), "dupes");
    expectOk(await request(app).delete(`/api/shelf/${s.body.data.id}`).set(A()), "remove");
  });
});

describe("commerce: cart / saved / wishlist / addresses / checkout / orders / payments", () => {
  let itemId = "";
  let orderId = "";
  let addressId = "";
  let wishlistId = "";
  let methodId = "";
  it("cart", async () => {
    const add = await request(app).post("/api/cart/items").set(A()).send({ productId: "1", name: "Pro", brand: "Fenty", price: 34 });
    expectOk(add, "add"); itemId = add.body.data.items[0].id;
    expectOk(await request(app).get("/api/cart").set(A()), "get");
    expectOk(await request(app).patch(`/api/cart/items/${itemId}`).set(A()).send({ qty: 2 }), "setQty");
    expectOk(await request(app).post("/api/cart/coupon").set(A()).send({ code: "WELCOME10" }), "coupon");
    expectOk(await request(app).get("/api/cart/estimate").set(A()), "estimate");
    expectOk(await request(app).delete("/api/cart/coupon").set(A()), "remove coupon");
    expectOk(await request(app).post("/api/cart/merge").set(A()).send({ items: [{ productId: "2", name: "MAC", brand: "MAC", price: 31, qty: 1 }] }), "merge");
  });
  it("saved looks", async () => {
    expectOk(await request(app).post("/api/saved/looks").set(A()).send({ id: "soft-glam", title: "Soft Glam" }), "save look");
    expectOk(await request(app).get("/api/saved/looks").set(A()), "list");
    expectOk(await request(app).delete("/api/saved/looks/soft-glam").set(A()), "remove");
  });
  it("wishlist", async () => {
    const w = await request(app).post("/api/wishlist").set(A()).send({ name: "Faves" });
    expectOk(w, "create"); wishlistId = w.body.data.id;
    expectOk(await request(app).get("/api/wishlist").set(A()), "list");
    expectOk(await request(app).post(`/api/wishlist/${wishlistId}/items`).set(A()).send({ productId: "1" }), "add item");
    expectOk(await request(app).delete(`/api/wishlist/${wishlistId}/items/1`).set(A()), "remove item");
  });
  it("addresses", async () => {
    expectOk(await request(app).post("/api/addresses/validate").set(A()).send({ line1: "1 St", city: "London", postcode: "E1" }), "validate");
    const a = await request(app).post("/api/addresses").set(A()).send({ name: "Home", line1: "1 St", city: "London", postcode: "E1" });
    expectOk(a, "create"); addressId = a.body.data.id;
    expectOk(await request(app).get("/api/addresses").set(A()), "list");
    expectOk(await request(app).patch(`/api/addresses/${addressId}`).set(A()).send({ city: "Manchester" }), "update");
    expectOk(await request(app).post(`/api/addresses/${addressId}/default`).set(A()), "default");
  });
  it("checkout & orders", async () => {
    expectOk(await request(app).get("/api/checkout/shipping-options").set(A()), "shipping-options");
    expectOk(await request(app).post("/api/checkout/session").set(A()), "session");
    const o = await request(app).post("/api/orders").set(A()).send({ addressId });
    expectOk(o, "place order"); orderId = o.body.data.id;
    expectOk(await request(app).get("/api/orders").set(A()), "list");
    expectOk(await request(app).get(`/api/orders/${orderId}`).set(A()), "detail");
    expectOk(await request(app).get(`/api/orders/${orderId}/tracking`).set(A()), "tracking");
    expectOk(await request(app).get(`/api/orders/${orderId}/invoice`).set(A()), "invoice");
    const ret = await request(app).post(`/api/orders/${orderId}/returns`).set(A()).send({ reason: "Wrong shade" });
    expectOk(ret, "return");
    expectOk(await request(app).get(`/api/returns/${ret.body.data.id}`).set(A()), "return detail");
    expectOk(await request(app).post(`/api/orders/${orderId}/reorder`).set(A()), "reorder");
    expectOk(await request(app).post(`/api/orders/${orderId}/cancel`).set(A()), "cancel");
  });
  it("rejects a bogus addressId with 400 (not a 500 FK crash)", async () => {
    // refill the bag, then check out against an address that does not exist
    await request(app).post("/api/cart/items").set(A()).send({ productId: "1", name: "Pro Filtr", brand: "Fenty", price: 34, qty: 1 });
    const res = await request(app).post("/api/orders").set(A()).send({ addressId: "does-not-exist" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("BAD_ADDRESS");
  });
  it("payments", async () => {
    const m = await request(app).post("/api/payments/methods").set(A()).send({ last4: "4242", expMonth: 12, expYear: 2030 });
    expectOk(m, "add method"); methodId = m.body.data.id;
    expectOk(await request(app).get("/api/payments/methods").set(A()), "list");
    expectOk(await request(app).post(`/api/payments/methods/${methodId}/default`).set(A()), "default");
    expectOk(await request(app).post("/api/payments/intent").set(A()).send({ amount: 34 }), "intent");
    expectOk(await request(app).post("/api/payments/iap/apple/verify").set(A()).send({ receipt: "abc" }), "iap apple");
    expectOk(await request(app).post("/api/payments/iap/google/verify").set(A()).send({ token: "abc" }), "iap google");
    expectOk(await request(app).get("/api/payments/transactions").set(A()), "transactions");
    expectOk(await request(app).delete(`/api/payments/methods/${methodId}`).set(A()), "remove method");
  });
  it("addresses cleanup", async () => {
    expectOk(await request(app).delete(`/api/addresses/${addressId}`).set(A()), "delete address");
  });
});

describe("subscription / billing / promos / referrals / credits", () => {
  it("subscription", async () => {
    expectOk(await request(app).get("/api/subscription").set(A()), "get");
    expectOk(await request(app).get("/api/subscription/plans").set(A()), "plans");
    expectOk(await request(app).get("/api/subscription/entitlements").set(A()), "entitlements");
    expectOk(await request(app).get("/api/subscription/preview").set(A()), "preview");
    expectOk(await request(app).post("/api/subscription/checkout").set(A()), "checkout");
    expectOk(await request(app).post("/api/subscription/change").set(A()).send({ plan: "pro" }), "change");
    expectOk(await request(app).post("/api/subscription/cancel").set(A()), "cancel");
    expectOk(await request(app).post("/api/subscription/resume").set(A()), "resume");
    expectOk(await request(app).post("/api/subscription/restore").set(A()), "restore");
    expectOk(await request(app).post("/api/subscription/gift").set(A()).send({ email: "friend@x.co" }), "gift");
  });
  it("billing / promos / referrals / credits", async () => {
    expectOk(await request(app).get("/api/billing/portal").set(A()), "billing portal");
    expectOk(await request(app).get("/api/billing/invoices").set(A()), "billing invoices");
    expectOk(await request(app).post("/api/promos/validate").set(A()).send({ code: "DOLL5" }), "promo validate");
    expectOk(await request(app).get("/api/promos/active").set(A()), "promo active");
    expectOk(await request(app).get("/api/referrals/me").set(A()), "referral me");
    expectOk(await request(app).get("/api/credits").set(A()), "credits");
  });
});

describe("engagement: notifications / devices / routines / search", () => {
  it("notifications", async () => {
    const list = await request(app).get("/api/notifications").set(A());
    expectOk(list, "list");
    expectOk(await request(app).get("/api/notifications/unread-count").set(A()), "unread-count");
    const nid = list.body.data[0]?.id;
    if (nid) {
      expectOk(await request(app).post(`/api/notifications/${nid}/read`).set(A()), "read");
      expectOk(await request(app).post(`/api/notifications/${nid}/snooze`).set(A()), "snooze");
    }
    expectOk(await request(app).post("/api/notifications/read-all").set(A()), "read-all");
    expectOk(await request(app).get("/api/notifications/preferences").set(A()), "prefs get");
    expectOk(await request(app).patch("/api/notifications/preferences").set(A()).send({ promos: false }), "prefs patch");
  });
  it("devices", async () => {
    expectOk(await request(app).post("/api/devices").set(A()).send({ expoPushToken: "ExponentPushToken[ep]", platform: "ios" }), "register");
    expectOk(await request(app).post("/api/devices/test-push").set(A()), "test-push");
    expectOk(await request(app).delete("/api/devices/ExponentPushToken[ep]").set(A()), "unregister");
  });
  it("routines", async () => {
    const r = await request(app).post("/api/routines").set(A()).send({ name: "AM", time: "7:30 AM", steps: ["Cleanse", "Prime"] });
    expectOk(r, "create");
    const id = r.body.data.id;
    expectOk(await request(app).get("/api/routines").set(A()), "list");
    expectOk(await request(app).get(`/api/routines/${id}`).set(A()), "detail");
    expectOk(await request(app).patch(`/api/routines/${id}`).set(A()).send({ name: "Morning" }), "update");
    expectOk(await request(app).post(`/api/routines/${id}/reminders`).set(A()).send({ time: "07:30", days: ["mon"] }), "reminders");
    expectOk(await request(app).delete(`/api/routines/${id}`).set(A()), "delete");
  });
  it("search & feed", async () => {
    expectOk(await request(app).get("/api/feed/home").set(A()), "feed");
    expectOk(await request(app).get("/api/search?q=fenty").set(A()), "search");
    expectOk(await request(app).get("/api/search/autocomplete?q=pro"), "autocomplete");
    expectOk(await request(app).get("/api/search/trending"), "trending");
    expectOk(await request(app).get("/api/search/recent").set(A()), "recent");
    expectOk(await request(app).delete("/api/search/recent").set(A()), "clear recent");
    expectOk(await request(app).get("/api/search/filters"), "filters");
  });
});

describe("support / media / events / marketing / webhooks", () => {
  it("support & feedback", async () => {
    expectOk(await request(app).post("/api/support/contact").send({ name: "A", email: "a@b.co", message: "hi" }), "contact");
    const t = await request(app).post("/api/support/tickets").set(A()).send({ subject: "Help", message: "hi" });
    expectOk(t, "ticket");
    const tid = t.body.data.id;
    expectOk(await request(app).get("/api/support/tickets").set(A()), "tickets");
    expectOk(await request(app).get(`/api/support/tickets/${tid}`).set(A()), "ticket detail");
    expectOk(await request(app).post(`/api/support/tickets/${tid}/messages`).set(A()).send({ body: "more" }), "ticket message");
    expectOk(await request(app).post("/api/feedback").set(A()).send({ message: "nice" }), "feedback");
    expectOk(await request(app).post("/api/feedback/bug").set(A()).send({ message: "bug" }), "bug");
    expectOk(await request(app).post("/api/feedback/rating").set(A()).send({ rating: 5 }), "rating");
  });
  it("media / events / marketing", async () => {
    expectOk(await request(app).post("/api/media/presign").set(A()).send({ type: "image/jpeg" }), "presign");
    const asset = await request(app).post("/api/media").set(A()).send({ url: "https://x/y.jpg", type: "image" });
    expectOk(asset, "media create");
    expectOk(await request(app).get(`/api/media/${asset.body.data.id}`).set(A()), "media get");
    expectOk(await request(app).delete(`/api/media/${asset.body.data.id}`).set(A()), "media delete");
    expectOk(await request(app).post("/api/events").set(A()).send({ name: "app_open" }), "events");
    expectOk(await request(app).post("/api/events/screen").set(A()).send({ name: "home" }), "screen");
    expectOk(await request(app).post("/api/marketing/waitlist").send({ email: uniqueEmail() }), "waitlist");
    expectOk(await request(app).post("/api/marketing/newsletter").send({ email: uniqueEmail() }), "newsletter");
    expectOk(await request(app).post("/api/marketing/newsletter/unsubscribe").send({ email: "x@y.co" }), "unsubscribe");
  });
  it("webhooks", async () => {
    for (const p of ["stripe", "revenuecat", "apple", "google", "shipping"]) {
      const r = await request(app).post(`/api/webhooks/${p}`).send({});
      expect(r.body.received).toBe(true);
    }
  });
});

describe("admin (role-gated)", () => {
  it("admin endpoints with ADMIN token", async () => {
    expectOk(await request(app).get("/api/admin/users").set(ADM()), "users");
    expectOk(await request(app).get("/api/admin/orders").set(ADM()), "orders");
    expectOk(await request(app).get("/api/admin/analytics/overview").set(ADM()), "analytics");
    expectOk(await request(app).get("/api/admin/reviews/queue").set(ADM()), "reviews queue");
    const p = await request(app).post("/api/admin/products").set(ADM()).send({ id: `t_${Date.now()}`, name: "Test", brand: "Brand", category: "Lips", priceLabel: "£9", priceAmount: 9, img: "https://x/i.jpg" });
    expectOk(p, "create product");
    expectOk(await request(app).patch(`/api/admin/products/${p.body.data.id}`).set(ADM()).send({ rating: "4.5" }), "update product");
    expectOk(await request(app).delete(`/api/admin/products/${p.body.data.id}`).set(ADM()), "delete product");
    expectOk(await request(app).post("/api/admin/banners").set(ADM()).send({ placement: "home", title: "B", img: "https://x/b.jpg" }), "banner");
    expectOk(await request(app).post("/api/admin/promos").set(ADM()).send({ code: `T${Date.now()}`, type: "PERCENT", value: 10 }), "promo");
    expectOk(await request(app).post("/api/admin/notifications/broadcast").set(ADM()).send({ title: "Hi", body: "News" }), "broadcast");
  });
  it("blocks non-admins", async () => {
    expect((await request(app).get("/api/admin/users").set(A())).status).toBe(403);
  });
});

describe("destructive (throwaway user)", () => {
  it("deactivate / reactivate / delete account", async () => {
    const email = uniqueEmail();
    const reg = await request(app).post("/api/auth/register").send({ name: "Throwaway", email, password: "password123" });
    const t = { Authorization: `Bearer ${reg.body.data.tokens.accessToken}` };
    expectOk(await request(app).post("/api/me/deactivate").set(t), "deactivate");
    expectOk(await request(app).post("/api/me/reactivate").set(t), "reactivate");
    expectOk(await request(app).delete("/api/me").set(t), "delete account");
  });
});
