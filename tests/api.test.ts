import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();
const unique = () => `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@dollface.test`;

let token = "";
let adminToken = "";

beforeAll(async () => {
  const email = unique();
  const reg = await request(app).post("/api/auth/register").send({ name: "Test User", email, password: "password123" });
  token = reg.body.data.tokens.accessToken;
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe("health & docs", () => {
  it("GET /health", async () => {
    const r = await request(app).get("/health");
    expect(r.status).toBe(200);
    expect(r.body.status).toBe("ok");
  });
  it("serves the OpenAPI spec", async () => {
    const r = await request(app).get("/api/docs.json");
    expect(r.status).toBe(200);
    expect(r.body.openapi).toBe("3.0.3");
    expect(Object.keys(r.body.paths).length).toBeGreaterThan(100);
  });
});

describe("auth", () => {
  it("rejects duplicate registration", async () => {
    const email = unique();
    await request(app).post("/api/auth/register").send({ name: "Ann", email, password: "password123" });
    const dup = await request(app).post("/api/auth/register").send({ name: "Ann", email, password: "password123" });
    expect(dup.status).toBe(409);
  });
  it("rejects bad credentials", async () => {
    const r = await request(app).post("/api/auth/login").send({ email: unique(), password: "nope12345" });
    expect(r.status).toBe(401);
  });
  it("two logins issue distinct refresh tokens (no collision)", async () => {
    const email = unique();
    await request(app).post("/api/auth/register").send({ name: "Bob", email, password: "password123" });
    const l1 = await request(app).post("/api/auth/login").send({ email, password: "password123" });
    const l2 = await request(app).post("/api/auth/login").send({ email, password: "password123" });
    expect(l1.body.data.tokens.refreshToken).not.toBe(l2.body.data.tokens.refreshToken);
  });
});

describe("password reset", () => {
  it("forgot → reset → login with the new password", async () => {
    const email = unique();
    await request(app).post("/api/auth/register").send({ name: "Reset Me", email, password: "password123" });
    const forgot = await request(app).post("/api/auth/forgot-password").send({ email });
    const token = forgot.body.data.devToken;
    expect(token).toBeTruthy();
    const reset = await request(app).post("/api/auth/reset-password").send({ token, password: "newpassword456" });
    expect(reset.status).toBe(200);
    const login = await request(app).post("/api/auth/login").send({ email, password: "newpassword456" });
    expect(login.status).toBe(200);
  });
  it("rejects an invalid reset token", async () => {
    const r = await request(app).post("/api/auth/reset-password").send({ token: "nope", password: "whatever123" });
    expect(r.status).toBe(400);
  });
});

describe("auth guard", () => {
  it("401 without token", async () => {
    const r = await request(app).get("/api/me");
    expect(r.status).toBe(401);
    expect(r.body.code).toBe("UNAUTHENTICATED");
  });
  it("returns the current user", async () => {
    const r = await request(app).get("/api/me").set(auth());
    expect(r.status).toBe(200);
    expect(r.body.data.email).toContain("@");
  });
});

describe("catalog", () => {
  it("lists tutorials", async () => {
    const r = await request(app).get("/api/tutorials");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.data)).toBe(true);
  });
  it("paginates when ?page is given", async () => {
    const r = await request(app).get("/api/products?page=1&limit=2");
    expect(r.body.data.items.length).toBeLessThanOrEqual(2);
    expect(r.body.data).toHaveProperty("total");
  });
  it("product detail has the contract shape", async () => {
    const r = await request(app).get("/api/products/1");
    expect(r.body.data).toHaveProperty("shades");
    expect(typeof r.body.data.price).toBe("number");
  });
});

describe("commerce flow", () => {
  it("add to cart → checkout → order", async () => {
    await request(app).post("/api/cart/items").set(auth()).send({ productId: "1", name: "Pro Filtr", brand: "Fenty", price: 34 });
    const cart = await request(app).get("/api/cart").set(auth());
    expect(cart.body.data.count).toBeGreaterThan(0);
    const order = await request(app).post("/api/orders").set(auth()).send({});
    expect(order.status).toBe(201);
    expect(order.body.data.items.length).toBeGreaterThan(0);
  });
});

describe("shade match", () => {
  it("manual match returns a result + appears in history", async () => {
    const m = await request(app).post("/api/match/manual").set(auth()).send({ shade: "NC40", category: "Foundation" });
    expect(m.status).toBe(201);
    expect(m.body.data.tone).toHaveProperty("label");
    const hist = await request(app).get("/api/match/history").set(auth());
    expect(hist.body.data.length).toBeGreaterThan(0);
  });
});

describe("admin authz", () => {
  it("blocks non-admins", async () => {
    const r = await request(app).get("/api/admin/users").set(auth());
    expect(r.status).toBe(403);
  });
  it("allows ADMIN_EMAILS users", async () => {
    const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!admins.length) return; // skip when no admin configured
    const email = admins[0];
    let r = await request(app).post("/api/auth/register").send({ name: "Admin", email, password: "password123" });
    adminToken = r.body?.data?.tokens?.accessToken
      ?? (await request(app).post("/api/auth/login").send({ email, password: "password123" })).body.data.tokens.accessToken;
    const users = await request(app).get("/api/admin/users").set({ Authorization: `Bearer ${adminToken}` });
    expect(users.status).toBe(200);
  });
});
