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

productsRouter.get("/:id", asyncHandler(async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) throw new AppError(404, "Product not found", "NOT_FOUND");
  ok(res, presentProductDetail(p));
}));
