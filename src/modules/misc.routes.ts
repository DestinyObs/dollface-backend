import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";

// ── /events (analytics/telemetry) ─────────────────────────
export const eventsRouter = Router();

const eventSchema = z.object({ name: z.string().min(1), props: z.record(z.unknown()).optional(), ts: z.string().optional() });

eventsRouter.post("/", asyncHandler(async (req, res) => {
  const body = req.body;
  const raw: unknown[] = Array.isArray(body) ? body : Array.isArray(body?.events) ? body.events : [body];
  const events = raw.flatMap((e) => {
    const r = eventSchema.safeParse(e);
    return r.success ? [r.data] : [];
  });
  if (events.length) {
    await prisma.analyticsEvent.createMany({
      data: events.map((e) => ({ userId: req.userId ?? null, name: e.name, props: (e.props ?? {}) as Prisma.InputJsonValue, ts: e.ts ? new Date(e.ts) : new Date() })),
    });
  }
  ok(res, { accepted: events.length });
}));

eventsRouter.post("/screen", asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? "screen_view");
  await prisma.analyticsEvent.create({ data: { userId: req.userId ?? null, name: `screen:${name}`, props: (req.body ?? {}) as Prisma.InputJsonValue } });
  ok(res, { accepted: 1 });
}));

// ── /marketing (web + app) ────────────────────────────────
export const marketingRouter = Router();

marketingRouter.post("/waitlist", asyncHandler(async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  const ok2 = z.string().email().safeParse(email).success;
  if (!ok2) return ok(res, { joined: false });
  await prisma.waitlistEntry.upsert({ where: { email }, create: { email, source: req.body?.source ?? "web" }, update: {} });
  ok(res, { joined: true }, 201);
}));

marketingRouter.post("/newsletter", asyncHandler(async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  if (!z.string().email().safeParse(email).success) return ok(res, { subscribed: false });
  await prisma.newsletterSub.upsert({ where: { email }, create: { email }, update: { unsubscribedAt: null } });
  ok(res, { subscribed: true }, 201);
}));

marketingRouter.post("/newsletter/unsubscribe", asyncHandler(async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  await prisma.newsletterSub.updateMany({ where: { email }, data: { unsubscribedAt: new Date() } });
  ok(res, { unsubscribed: true });
}));

// ── /webhooks (inbound, server-to-server) ─────────────────
export const webhooksRouter = Router();

// Dev acks; in prod verify signatures (Stripe-Signature, etc.) on the raw body.
for (const provider of ["stripe", "revenuecat", "apple", "google", "shipping"]) {
  webhooksRouter.post(`/${provider}`, asyncHandler(async (req, res) => {
    console.log(`[webhook:${provider}]`, typeof req.body === "object" ? Object.keys(req.body ?? {}) : "received");
    res.json({ received: true });
  }));
}
