import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);

const FREE_PLAN = {
  id: "free", name: "Free", price: "£0", unit: "",
  features: ["3 shade matches per day", "2 look recreations per day", "Beginner tutorials"],
};
const PRO_PLAN = {
  id: "pro", name: "DollFace Pro", price: "£49.99", unit: "/ year",
  features: ["Unlimited shade matching", "Unlimited recreations", "Full tutorial library", "AI beauty advisor", "Ad-free experience"],
};

subscriptionRouter.get("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const sub = await prisma.subscription.upsert({ where: { userId }, create: { userId }, update: {} });
  const isPro = sub.plan === "PRO";
  ok(res, {
    plan: isPro ? "pro" : "free",
    status: sub.status,
    current: isPro ? PRO_PLAN : FREE_PLAN,
    pro: PRO_PLAN,
  });
}));

subscriptionRouter.get("/plans", asyncHandler(async (_req, res) => {
  ok(res, [FREE_PLAN, PRO_PLAN]);
}));

subscriptionRouter.post("/checkout", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  // Real billing (Stripe/IAP) is a later phase — start a trial entitlement now.
  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: "PRO", status: "Trialing", renewsAt: new Date(Date.now() + 7 * 86400000) },
    update: { plan: "PRO", status: "Trialing", renewsAt: new Date(Date.now() + 7 * 86400000) },
  });
  ok(res, { status: "trialing" });
}));

subscriptionRouter.post("/cancel", asyncHandler(async (req, res) => {
  await prisma.subscription.update({ where: { userId: authUserId(req) }, data: { status: "Cancelled" } });
  ok(res, { status: "Cancelled" });
}));

subscriptionRouter.post("/resume", asyncHandler(async (req, res) => {
  await prisma.subscription.update({ where: { userId: authUserId(req) }, data: { status: "Active" } });
  ok(res, { status: "Active" });
}));

subscriptionRouter.post("/change", asyncHandler(async (req, res) => {
  const plan = String(req.body?.plan ?? "").toUpperCase() === "PRO" ? "PRO" : "FREE";
  await prisma.subscription.update({ where: { userId: authUserId(req) }, data: { plan } });
  ok(res, { plan: plan.toLowerCase() });
}));

subscriptionRouter.get("/preview", asyncHandler(async (_req, res) => {
  ok(res, { proration: 0, nextCharge: PRO_PLAN.price, nextChargeAt: new Date(Date.now() + 365 * 86400000).toISOString() });
}));

subscriptionRouter.post("/restore", asyncHandler(async (req, res) => {
  await prisma.subscription.upsert({
    where: { userId: authUserId(req) }, create: { userId: authUserId(req), plan: "PRO", status: "Active" }, update: { plan: "PRO", status: "Active" },
  });
  ok(res, { restored: true, plan: "pro" });
}));

subscriptionRouter.get("/entitlements", asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: authUserId(req) } });
  const pro = sub?.plan === "PRO";
  ok(res, {
    plan: pro ? "pro" : "free",
    unlimitedMatches: pro, unlimitedRecreations: pro, fullTutorialLibrary: pro, aiAdvisor: pro, adFree: pro,
  });
}));

subscriptionRouter.post("/gift", asyncHandler(async (req, res) => {
  ok(res, { gifted: true, code: `GIFT-${Math.random().toString(36).slice(2, 8).toUpperCase()}` });
}));

/** Billing portal + invoices (mounted at /billing). */
export const billingRouter = Router();
billingRouter.use(requireAuth);

billingRouter.get("/portal", asyncHandler(async (_req, res) => {
  ok(res, { url: "https://billing.dollface.app/portal" });
}));

billingRouter.get("/invoices", asyncHandler(async (req, res) => {
  const txns = await prisma.transaction.findMany({ where: { userId: authUserId(req), kind: "payment" }, orderBy: { createdAt: "desc" } });
  ok(res, txns.map((t) => ({ id: t.id, amount: t.amount, currency: t.currency, status: t.status, createdAt: t.createdAt.toISOString(), url: `https://dollface.app/invoices/${t.id}.pdf` })));
}));
