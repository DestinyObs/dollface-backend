import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { presentProductSummary, presentTutorialSummary, presentLook } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const types = String(req.query.type ?? "products,tutorials,looks,brands").split(",");
  if (!q) return ok(res, { products: [], tutorials: [], looks: [], brands: [] });

  // Log the search if authenticated (best-effort).
  if (req.userId) await prisma.searchLog.create({ data: { userId: req.userId, query: q } }).catch(() => {});

  const like = { contains: q, mode: "insensitive" as const };
  const [products, tutorials, looks, brands] = await Promise.all([
    types.includes("products") ? prisma.product.findMany({ where: { OR: [{ name: like }, { brand: like }] }, take: 10 }) : [],
    types.includes("tutorials") ? prisma.tutorial.findMany({ where: { title: like }, take: 10 }) : [],
    types.includes("looks") ? prisma.look.findMany({ where: { label: like }, take: 10 }) : [],
    types.includes("brands") ? prisma.brand.findMany({ where: { name: like }, take: 10 }) : [],
  ]);

  ok(res, {
    products: products.map(presentProductSummary),
    tutorials: tutorials.map(presentTutorialSummary),
    looks: looks.map(presentLook),
    brands: brands.map((b) => ({ id: b.id, name: b.name, logo: b.logo ?? undefined })),
  });
}));

searchRouter.get("/autocomplete", asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return ok(res, []);
  const like = { contains: q, mode: "insensitive" as const };
  const [products, brands] = await Promise.all([
    prisma.product.findMany({ where: { OR: [{ name: like }, { brand: like }] }, take: 5, select: { name: true } }),
    prisma.brand.findMany({ where: { name: like }, take: 3, select: { name: true } }),
  ]);
  ok(res, [...new Set([...products.map((p) => p.name), ...brands.map((b) => b.name)])].slice(0, 8));
}));

searchRouter.get("/trending", asyncHandler(async (_req, res) => {
  ok(res, ["Foundation", "Glass skin", "Soft glam", "Fenty", "Bronzer", "Pillow Talk"]);
}));

searchRouter.get("/recent", requireAuth, asyncHandler(async (req, res) => {
  const rows = await prisma.searchLog.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" }, take: 10, distinct: ["query"] });
  ok(res, rows.map((r) => r.query));
}));

searchRouter.delete("/recent", requireAuth, asyncHandler(async (req, res) => {
  await prisma.searchLog.deleteMany({ where: { userId: authUserId(req) } });
  ok(res, { cleared: true });
}));

searchRouter.get("/filters", asyncHandler(async (_req, res) => {
  ok(res, {
    categories: ["Foundation", "Concealer", "Blush", "Bronzer", "Lips", "Primer"],
    brands: ["Fenty Beauty", "MAC", "Maybelline", "Rare Beauty", "Benefit", "Charlotte Tilbury"],
    priceRanges: [{ label: "Under £15", min: 0, max: 15 }, { label: "£15–£30", min: 15, max: 30 }, { label: "£30+", min: 30, max: 9999 }],
  });
}));
