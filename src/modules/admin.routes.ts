import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { sendPush } from "../providers/push.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

// ── Users ─────────────────────────────────────────────────
adminRouter.get("/users", asyncHandler(async (req, res) => {
  const q = req.query.q ? String(req.query.q) : undefined;
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
    take: 50, orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, deactivatedAt: true },
  });
  ok(res, users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), deactivated: !!u.deactivatedAt })));
}));

adminRouter.patch("/users/:id", asyncHandler(async (req, res) => {
  const data = z.object({ role: z.enum(["USER", "ADMIN"]).optional(), deactivated: z.boolean().optional() }).parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: data.role, ...(data.deactivated !== undefined ? { deactivatedAt: data.deactivated ? new Date() : null } : {}) },
  });
  ok(res, { id: user.id, role: user.role });
}));

// ── Orders ────────────────────────────────────────────────
adminRouter.get("/orders", asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { items: true } });
  ok(res, orders.map((o) => ({ id: o.id, userId: o.userId, status: o.status, total: o.total, items: o.items.length, createdAt: o.createdAt.toISOString() })));
}));

// ── Catalog management ────────────────────────────────────
const productSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), brand: z.string().min(1), category: z.string().min(1),
  priceLabel: z.string().min(1), priceAmount: z.number(), rating: z.string().default("0.0"), img: z.string().min(1),
  description: z.string().default(""), highlights: z.array(z.string()).default([]), shades: z.array(z.object({ name: z.string(), hex: z.string() })).default([]),
});

adminRouter.post("/products", asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data: { ...data, shades: data.shades } });
  ok(res, product, 201);
}));

adminRouter.patch("/products/:id", asyncHandler(async (req, res) => {
  const data = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { ...data, shades: data.shades ?? undefined } });
  ok(res, product);
}));

adminRouter.delete("/products/:id", asyncHandler(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  ok(res, { removed: true });
}));

adminRouter.post("/products/import", asyncHandler(async (req, res) => {
  const items = z.array(productSchema).parse(req.body?.products ?? []);
  let count = 0;
  for (const p of items) {
    await prisma.product.upsert({ where: { id: p.id }, create: { ...p, shades: p.shades }, update: { ...p, shades: p.shades } });
    count++;
  }
  ok(res, { imported: count });
}));

adminRouter.post("/tutorials", asyncHandler(async (req, res) => {
  const data = z.object({
    id: z.string(), title: z.string(), cat: z.string(), mins: z.string(), level: z.string(), views: z.string().default("0"),
    img: z.string(), description: z.string().default(""), steps: z.array(z.object({ title: z.string(), description: z.string(), tip: z.string() })).default([]),
  }).parse(req.body);
  const t = await prisma.tutorial.create({ data: { ...data, steps: data.steps } });
  ok(res, t, 201);
}));

adminRouter.patch("/tutorials/:id", asyncHandler(async (req, res) => {
  const t = await prisma.tutorial.update({ where: { id: req.params.id }, data: req.body });
  ok(res, t);
}));

adminRouter.post("/banners", asyncHandler(async (req, res) => {
  const data = z.object({ placement: z.string(), title: z.string(), img: z.string(), route: z.string().optional(), order: z.number().default(0) }).parse(req.body);
  const banner = await prisma.banner.create({ data });
  ok(res, banner, 201);
}));

// ── Moderation ────────────────────────────────────────────
adminRouter.get("/reviews/queue", asyncHandler(async (_req, res) => {
  const reviews = await prisma.review.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, product: { select: { name: true } } } });
  ok(res, reviews.map((r) => ({ id: r.id, author: r.user.name, product: r.product.name, rating: r.rating, body: r.body, createdAt: r.createdAt.toISOString() })));
}));

adminRouter.post("/reviews/:id/moderate", asyncHandler(async (req, res) => {
  const action = String(req.body?.action ?? "approve");
  if (action === "remove") await prisma.review.delete({ where: { id: req.params.id } }).catch(() => {});
  ok(res, { moderated: true, action });
}));

// ── Broadcast push / analytics / flags / promos ───────────
adminRouter.post("/notifications/broadcast", asyncHandler(async (req, res) => {
  const { title, body, route } = z.object({ title: z.string(), body: z.string(), route: z.string().optional() }).parse(req.body);
  const users = await prisma.user.findMany({ select: { id: true } });
  await prisma.notification.createMany({ data: users.map((u) => ({ userId: u.id, type: "PROMO" as const, title, body, route: route ?? null })) });
  const tokens = (await prisma.device.findMany({ select: { token: true } })).map((d) => d.token);
  await sendPush(tokens, title, body);
  ok(res, { sent: users.length });
}));

adminRouter.get("/analytics/overview", asyncHandler(async (_req, res) => {
  const [users, orders, matches, revenue] = await prisma.$transaction([
    prisma.user.count(),
    prisma.order.count(),
    prisma.shadeMatch.count(),
    prisma.transaction.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
  ]);
  ok(res, { users, orders, matches, revenue: revenue._sum.amount ?? 0 });
}));

adminRouter.post("/promos", asyncHandler(async (req, res) => {
  const data = z.object({ code: z.string().min(3), type: z.enum(["PERCENT", "FIXED"]), value: z.number().positive(), expiresAt: z.string().optional() }).parse(req.body);
  const coupon = await prisma.coupon.create({ data: { code: data.code.toUpperCase(), type: data.type, value: data.value, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null } });
  ok(res, coupon, 201);
}));
