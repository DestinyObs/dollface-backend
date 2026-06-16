import { Router } from "express";
import { z } from "zod";
import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler, paginate } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { createPaymentIntent } from "../providers/payments.js";

const present = (o: Order & { items: OrderItem[] }) => ({
  id: o.id, status: o.status, subtotal: o.subtotal, shipping: o.shipping, tax: o.tax, total: o.total,
  currency: o.currency, trackingNo: o.trackingNo ?? undefined, carrier: o.carrier ?? undefined, createdAt: o.createdAt.toISOString(),
  items: o.items.map((i) => ({ id: i.id, productId: i.productId ?? undefined, name: i.name, brand: i.brand, price: i.price, shade: i.shade ?? undefined, img: i.img ?? undefined, qty: i.qty })),
});

async function cartTotals(userId: string) {
  const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, include: { items: true } });
  const subtotal = cart.items.reduce((n, i) => n + i.price * i.qty, 0);
  let discount = 0;
  if (cart.coupon) {
    const c = await prisma.coupon.findFirst({ where: { code: cart.coupon, active: true } });
    if (c) discount = c.type === "PERCENT" ? (subtotal * c.value) / 100 : c.value;
  }
  const discounted = Math.max(0, subtotal - discount);
  const shipping = discounted > 40 || discounted === 0 ? 0 : 3.95;
  const tax = Math.round(discounted * 0.2 * 100) / 100;
  const total = Math.round((discounted + shipping + tax) * 100) / 100;
  return { cart, subtotal: discounted, shipping, tax, total };
}

// ── /checkout ─────────────────────────────────────────────
export const checkoutRouter = Router();
checkoutRouter.use(requireAuth);

checkoutRouter.post("/session", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const { total } = await cartTotals(userId);
  if (total <= 0) throw new AppError(400, "Your bag is empty", "EMPTY_CART");
  const intent = await createPaymentIntent(Math.round(total * 100), "gbp");
  ok(res, { sessionId: intent.id, clientSecret: intent.clientSecret, amount: total, currency: "GBP" });
}));

checkoutRouter.get("/shipping-options", asyncHandler(async (_req, res) => {
  ok(res, [
    { id: "standard", label: "Standard (3–5 days)", price: 3.95, eta: "3–5 working days" },
    { id: "express", label: "Express (1–2 days)", price: 6.95, eta: "1–2 working days" },
    { id: "free", label: "Free over £40", price: 0, eta: "3–5 working days" },
  ]);
}));

// ── /orders ───────────────────────────────────────────────
export const ordersRouter = Router();
ordersRouter.use(requireAuth);

ordersRouter.post("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const addressId = req.body?.addressId ? String(req.body.addressId) : null;
  // Validate the address belongs to this user before referencing it (avoids a
  // raw FK-violation 500 on a bogus/foreign addressId).
  if (addressId) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError(400, "Invalid delivery address", "BAD_ADDRESS");
  }
  const { cart, subtotal, shipping, tax, total } = await cartTotals(userId);
  if (!cart.items.length) throw new AppError(400, "Your bag is empty", "EMPTY_CART");

  const order = await prisma.order.create({
    data: {
      userId, status: "PAID", subtotal, shipping, tax, total, addressId,
      items: { create: cart.items.map((i) => ({ productId: i.productId, name: i.name, brand: i.brand, price: i.price, shade: i.shade, img: i.img, qty: i.qty })) },
    },
    include: { items: true },
  });
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    prisma.cart.update({ where: { id: cart.id }, data: { coupon: null } }),
    prisma.transaction.create({ data: { userId, orderId: order.id, amount: total, status: "SUCCEEDED", kind: "payment" } }),
    prisma.notification.create({ data: { userId, type: "ORDER", title: "Order confirmed", body: `Your order of £${total} is being prepared.`, route: "/product" } }),
  ]);
  ok(res, present(order), 201);
}));

ordersRouter.get("/", asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: authUserId(req) }, include: { items: true }, orderBy: { createdAt: "desc" } });
  ok(res, paginate(orders.map(present), req.query));
}));

ordersRouter.get("/:id", asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: authUserId(req) }, include: { items: true } });
  if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
  ok(res, present(order));
}));

ordersRouter.post("/:id/cancel", asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) throw new AppError(400, "Order can no longer be cancelled", "TOO_LATE");
  await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  ok(res, { status: "CANCELLED" });
}));

ordersRouter.post("/:id/reorder", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId }, include: { items: true } });
  if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
  const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
  await prisma.cartItem.createMany({ data: order.items.map((i) => ({ cartId: cart.id, productId: i.productId, name: i.name, brand: i.brand, price: i.price, shade: i.shade, img: i.img, qty: i.qty })) });
  ok(res, { reordered: true, items: order.items.length });
}));

ordersRouter.get("/:id/tracking", asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
  ok(res, {
    status: order.status,
    carrier: order.carrier ?? "Royal Mail",
    trackingNo: order.trackingNo ?? `DF${order.id.slice(-10).toUpperCase()}`,
    steps: [
      { label: "Order placed", done: true },
      { label: "Preparing", done: order.status !== "PENDING" },
      { label: "Shipped", done: ["SHIPPED", "DELIVERED"].includes(order.status) },
      { label: "Delivered", done: order.status === "DELIVERED" },
    ],
  });
}));

ordersRouter.get("/:id/invoice", asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
  ok(res, { url: `https://dollface.app/invoices/${order.id}.pdf` });
}));

ordersRouter.post("/:id/returns", asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!order) throw new AppError(404, "Order not found", "NOT_FOUND");
  const ret = await prisma.return.create({ data: { orderId: order.id, reason: String(req.body?.reason ?? "Not specified") } });
  ok(res, { id: ret.id, status: ret.status }, 201);
}));

// ── /returns ──────────────────────────────────────────────
export const returnsRouter = Router();
returnsRouter.use(requireAuth);

returnsRouter.get("/:id", asyncHandler(async (req, res) => {
  const ret = await prisma.return.findFirst({ where: { id: req.params.id, order: { userId: authUserId(req) } }, include: { order: true } });
  if (!ret) throw new AppError(404, "Return not found", "NOT_FOUND");
  ok(res, { id: ret.id, orderId: ret.orderId, reason: ret.reason, status: ret.status, createdAt: ret.createdAt.toISOString() });
}));
