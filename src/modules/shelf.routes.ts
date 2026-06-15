import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { presentProductSummary } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

/** "My shelf" — products/shades the user owns. */
export const shelfRouter = Router();
shelfRouter.use(requireAuth);

shelfRouter.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.shelf.findMany({
    where: { userId: authUserId(req) }, include: { product: true }, orderBy: { createdAt: "desc" },
  });
  ok(res, rows.map((r) => ({ id: r.id, shade: r.shade ?? undefined, product: presentProductSummary(r.product) })));
}));

const addSchema = z.object({ productId: z.string().min(1), shade: z.string().optional() });

shelfRouter.post("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const { productId, shade } = addSchema.parse(req.body);
  const existing = await prisma.shelf.findFirst({ where: { userId, productId, shade: shade ?? null } });
  const row = existing ?? (await prisma.shelf.create({ data: { userId, productId, shade: shade ?? null } }));
  ok(res, { id: row.id }, 201);
}));

shelfRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.shelf.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));

/** Cheaper cross-brand equivalents for a product. */
shelfRouter.get("/dupes/:productId", asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
  if (!product) return ok(res, []);
  const dupes = await prisma.product.findMany({
    where: { category: product.category, priceAmount: { lt: product.priceAmount }, id: { not: product.id } },
    orderBy: { priceAmount: "asc" }, take: 5,
  });
  ok(res, dupes.map(presentProductSummary));
}));
