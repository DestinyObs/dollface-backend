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
