import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentProductSummary, presentProductDetail } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const productsRouter = Router();

productsRouter.get("/", asyncHandler(async (req, res) => {
  const category = req.query.category ? String(req.query.category) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;
  const where: Prisma.ProductWhereInput = {};
  if (category && category !== "All") where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }
  const items = await prisma.product.findMany({ where, orderBy: { order: "asc" } });
  ok(res, items.map(presentProductSummary));
}));

productsRouter.get("/categories", asyncHandler(async (_req, res) => {
  ok(res, ["All", "Foundation", "Concealer", "Blush", "Bronzer", "Lips", "Primer"]);
}));

productsRouter.get("/saved", requireAuth, asyncHandler(async (req, res) => {
  const saves = await prisma.productSave.findMany({
    where: { userId: authUserId(req) },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  ok(res, saves.map((s) => presentProductSummary(s.product)));
}));

productsRouter.post("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const productId = req.params.id;
  await prisma.productSave.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
  ok(res, { saved: true });
}));

productsRouter.delete("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  await prisma.productSave.deleteMany({ where: { userId: authUserId(req), productId: req.params.id } });
  ok(res, { saved: false });
}));

productsRouter.get("/trending", asyncHandler(async (_req, res) => {
  const items = await prisma.product.findMany({ where: { trending: true }, orderBy: { order: "asc" } });
  ok(res, (items.length ? items : await prisma.product.findMany({ orderBy: { rating: "desc" }, take: 6 })).map(presentProductSummary));
}));

productsRouter.get("/new", asyncHandler(async (_req, res) => {
  const items = await prisma.product.findMany({ where: { isNew: true }, orderBy: { order: "asc" } });
  ok(res, (items.length ? items : await prisma.product.findMany({ orderBy: { order: "desc" }, take: 6 })).map(presentProductSummary));
}));

productsRouter.get("/recently-viewed", requireAuth, asyncHandler(async (req, res) => {
  const views = await prisma.productView.findMany({
    where: { userId: authUserId(req) }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 10, distinct: ["productId"],
  });
  ok(res, views.map((v) => presentProductSummary(v.product)));
}));

productsRouter.get("/barcode/:code", asyncHandler(async (req, res) => {
  // Barcode→product lookup is a later data integration; demo returns first match.
  const p = await prisma.product.findFirst({ orderBy: { order: "asc" } });
  if (!p) throw new AppError(404, "Not found", "NOT_FOUND");
  ok(res, presentProductDetail(p));
}));

productsRouter.get("/:id/variants", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) throw new AppError(404, "Product not found", "NOT_FOUND");
  ok(res, { shades: p.shades, inStock: true });
}));

productsRouter.get("/:id/recommendations", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) return ok(res, []);
  const recs = await prisma.product.findMany({ where: { category: p.category, id: { not: p.id } }, take: 6 });
  ok(res, recs.map(presentProductSummary));
}));

productsRouter.get("/:id/related", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) return ok(res, []);
  const related = await prisma.product.findMany({ where: { brand: p.brand, id: { not: p.id } }, take: 6 });
  ok(res, related.map(presentProductSummary));
}));

productsRouter.get("/:id/ingredients", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) throw new AppError(404, "Product not found", "NOT_FOUND");
  ok(res, p.ingredients);
}));

productsRouter.get("/:id/price-history", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) throw new AppError(404, "Product not found", "NOT_FOUND");
  const base = p.priceAmount;
  const history = Array.from({ length: 6 }, (_, i) => ({
    date: new Date(Date.now() - (5 - i) * 30 * 86400000).toISOString().slice(0, 10),
    price: Math.round((base * (1 + (i % 2 ? -0.05 : 0.03))) * 100) / 100,
  }));
  ok(res, history);
}));

productsRouter.post("/:id/view", requireAuth, asyncHandler(async (req, res) => {
  await prisma.productView.create({ data: { userId: authUserId(req), productId: req.params.id } }).catch(() => {});
  ok(res, { tracked: true });
}));

productsRouter.post("/:id/restock-alert", requireAuth, asyncHandler(async (req, res) => {
  await prisma.restockAlert.upsert({
    where: { userId_productId: { userId: authUserId(req), productId: req.params.id } },
    create: { userId: authUserId(req), productId: req.params.id }, update: {},
  });
  ok(res, { subscribed: true });
}));

productsRouter.get("/:id", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) throw new AppError(404, "Product not found", "NOT_FOUND");
  ok(res, presentProductDetail(p));
}));
