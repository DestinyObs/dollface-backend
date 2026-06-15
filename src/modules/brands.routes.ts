import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentProductSummary } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const brandsRouter = Router();

brandsRouter.get("/", asyncHandler(async (_req, res) => {
  const brands = await prisma.brand.findMany({ orderBy: { order: "asc" } });
  ok(res, brands.map((b) => ({ id: b.id, name: b.name, logo: b.logo ?? undefined, description: b.description ?? undefined })));
}));

brandsRouter.get("/:id", asyncHandler(async (req, res) => {
  const brand = await prisma.brand.findUnique({ where: { id: req.params.id }, include: { products: { orderBy: { order: "asc" } } } });
  if (!brand) throw new AppError(404, "Brand not found", "NOT_FOUND");
  ok(res, {
    id: brand.id, name: brand.name, logo: brand.logo ?? undefined, description: brand.description ?? undefined,
    products: brand.products.map(presentProductSummary),
  });
}));

brandsRouter.post("/:id/follow", requireAuth, asyncHandler(async (req, res) => {
  await prisma.brandFollow.upsert({
    where: { userId_brandId: { userId: authUserId(req), brandId: req.params.id } },
    create: { userId: authUserId(req), brandId: req.params.id }, update: {},
  });
  ok(res, { following: true });
}));

brandsRouter.delete("/:id/follow", requireAuth, asyncHandler(async (req, res) => {
  await prisma.brandFollow.deleteMany({ where: { userId: authUserId(req), brandId: req.params.id } });
  ok(res, { following: false });
}));
