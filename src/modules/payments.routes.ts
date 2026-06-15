import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { createPaymentIntent, createSetupIntent, verifyIapReceipt } from "../providers/payments.js";

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

paymentsRouter.get("/methods", asyncHandler(async (req, res) => {
  const methods = await prisma.paymentMethod.findMany({ where: { userId: authUserId(req) }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] });
  ok(res, methods.map((m) => ({ id: m.id, brand: m.brand, last4: m.last4, expMonth: m.expMonth, expYear: m.expYear, isDefault: m.isDefault })));
}));

const methodSchema = z.object({
  brand: z.string().default("visa"),
  last4: z.string().length(4),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int(),
  isDefault: z.boolean().optional(),
});

paymentsRouter.post("/methods", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = methodSchema.parse(req.body);
  const setup = await createSetupIntent();
  if (data.isDefault) await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });
  const count = await prisma.paymentMethod.count({ where: { userId } });
  const method = await prisma.paymentMethod.create({
    data: { userId, brand: data.brand, last4: data.last4, expMonth: data.expMonth, expYear: data.expYear, isDefault: data.isDefault || count === 0, providerId: setup.id },
  });
  ok(res, { id: method.id, brand: method.brand, last4: method.last4, expMonth: method.expMonth, expYear: method.expYear, isDefault: method.isDefault }, 201);
}));

paymentsRouter.delete("/methods/:id", asyncHandler(async (req, res) => {
  await prisma.paymentMethod.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));

paymentsRouter.post("/methods/:id/default", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const owned = await prisma.paymentMethod.findFirst({ where: { id: req.params.id, userId } });
  if (!owned) throw new AppError(404, "Payment method not found", "NOT_FOUND");
  await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.paymentMethod.update({ where: { id: req.params.id }, data: { isDefault: true } });
  ok(res, { isDefault: true });
}));

paymentsRouter.post("/intent", asyncHandler(async (req, res) => {
  const orderId = req.body?.orderId ? String(req.body.orderId) : undefined;
  let amount = Number(req.body?.amount ?? 0);
  if (orderId) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: authUserId(req) } });
    if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
    amount = order.total;
  }
  if (amount <= 0) throw new AppError(400, "Invalid amount", "BAD_AMOUNT");
  const intent = await createPaymentIntent(Math.round(amount * 100), "gbp");
  ok(res, intent);
}));

async function activatePro(userId: string, expiresAt: Date) {
  await prisma.subscription.upsert({
    where: { userId }, create: { userId, plan: "PRO", status: "Active", renewsAt: expiresAt },
    update: { plan: "PRO", status: "Active", renewsAt: expiresAt },
  });
}

paymentsRouter.post("/iap/apple/verify", asyncHandler(async (req, res) => {
  const r = await verifyIapReceipt("apple", String(req.body?.receipt ?? ""));
  if (r.valid) await activatePro(authUserId(req), r.expiresAt);
  ok(res, { valid: r.valid, entitlement: r.entitlement });
}));

paymentsRouter.post("/iap/google/verify", asyncHandler(async (req, res) => {
  const r = await verifyIapReceipt("google", String(req.body?.token ?? ""));
  if (r.valid) await activatePro(authUserId(req), r.expiresAt);
  ok(res, { valid: r.valid, entitlement: r.entitlement });
}));

paymentsRouter.get("/transactions", asyncHandler(async (req, res) => {
  const txns = await prisma.transaction.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, txns.map((t) => ({ id: t.id, orderId: t.orderId ?? undefined, amount: t.amount, currency: t.currency, status: t.status, kind: t.kind, createdAt: t.createdAt.toISOString() })));
}));
