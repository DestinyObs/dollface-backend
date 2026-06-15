import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentProductSummary } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const wishlistRouter = Router();
wishlistRouter.use(requireAuth);

wishlistRouter.get("/", asyncHandler(async (req, res) => {
  const lists = await prisma.wishlist.findMany({
    where: { userId: authUserId(req) }, include: { items: { include: { product: true } } }, orderBy: { id: "asc" },
  });
  ok(res, lists.map((l) => ({ id: l.id, name: l.name, items: l.items.map((i) => presentProductSummary(i.product)) })));
}));

wishlistRouter.post("/", asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? "Wishlist").slice(0, 60);
  const list = await prisma.wishlist.create({ data: { userId: authUserId(req), name } });
  ok(res, { id: list.id, name: list.name, items: [] }, 201);
}));

const itemSchema = z.object({ productId: z.string().min(1) });

wishlistRouter.post("/:id/items", asyncHandler(async (req, res) => {
  const { productId } = itemSchema.parse(req.body);
  const list = await prisma.wishlist.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!list) throw new AppError(404, "Wishlist not found", "NOT_FOUND");
  await prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: list.id, productId } },
    create: { wishlistId: list.id, productId }, update: {},
  });
  ok(res, { added: true }, 201);
}));

wishlistRouter.delete("/:id/items/:productId", asyncHandler(async (req, res) => {
  const list = await prisma.wishlist.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!list) throw new AppError(404, "Wishlist not found", "NOT_FOUND");
  await prisma.wishlistItem.deleteMany({ where: { wishlistId: list.id, productId: req.params.productId } });
  ok(res, { removed: true });
}));
