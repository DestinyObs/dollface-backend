import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

// ── /promos ───────────────────────────────────────────────
export const promosRouter = Router();

promosRouter.post("/validate", asyncHandler(async (req, res) => {
  const code = String(req.body?.code ?? "").toUpperCase();
  const coupon = await prisma.coupon.findFirst({ where: { code, active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } });
  if (!coupon) throw new AppError(404, "Invalid or expired code", "BAD_COUPON");
  ok(res, { code: coupon.code, type: coupon.type, value: coupon.value });
}));

promosRouter.get("/active", asyncHandler(async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } });
  ok(res, coupons.map((c) => ({ code: c.code, type: c.type, value: c.value })));
}));

// ── /referrals ────────────────────────────────────────────
export const referralsRouter = Router();
referralsRouter.use(requireAuth);

referralsRouter.get("/me", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  let referral = await prisma.referral.findUnique({ where: { userId }, include: { redemptions: true } });
  if (!referral) {
    const code = `DOLL-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    referral = await prisma.referral.create({ data: { userId, code }, include: { redemptions: true } });
  }
  ok(res, { code: referral.code, referred: referral.redemptions.length, rewardPerReferral: "£5 credit" });
}));

referralsRouter.post("/redeem", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const code = String(req.body?.code ?? "").toUpperCase();
  const referral = await prisma.referral.findUnique({ where: { code } });
  if (!referral) throw new AppError(404, "Invalid referral code", "BAD_CODE");
  if (referral.userId === userId) throw new AppError(400, "You can't redeem your own code", "OWN_CODE");
  const already = await prisma.referralRedemption.findUnique({ where: { referredId: userId } });
  if (already) throw new AppError(409, "You've already used a referral", "ALREADY_REDEEMED");

  await prisma.$transaction([
    prisma.referralRedemption.create({ data: { referralId: referral.id, referrerId: referral.userId, referredId: userId } }),
    prisma.creditLedger.create({ data: { userId, amount: 5, reason: "Referral signup" } }),
    prisma.creditLedger.create({ data: { userId: referral.userId, amount: 5, reason: "Referral reward" } }),
  ]);
  ok(res, { redeemed: true, credit: 5 });
}));

// ── /credits ──────────────────────────────────────────────
export const creditsRouter = Router();
creditsRouter.use(requireAuth);

creditsRouter.get("/", asyncHandler(async (req, res) => {
  const agg = await prisma.creditLedger.aggregate({ where: { userId: authUserId(req) }, _sum: { amount: true } });
  ok(res, { balance: agg._sum.amount ?? 0, currency: "GBP" });
}));
