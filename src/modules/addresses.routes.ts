import { Router } from "express";
import { z } from "zod";
import type { Address } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const addressesRouter = Router();
addressesRouter.use(requireAuth);

const present = (a: Address) => ({
  id: a.id, name: a.name, line1: a.line1, line2: a.line2 ?? undefined, city: a.city,
  region: a.region ?? undefined, postcode: a.postcode, country: a.country, phone: a.phone ?? undefined, isDefault: a.isDefault,
});

const addressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postcode: z.string().min(1),
  country: z.string().default("GB"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

addressesRouter.get("/", asyncHandler(async (req, res) => {
  const items = await prisma.address.findMany({ where: { userId: authUserId(req) }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] });
  ok(res, items.map(present));
}));

addressesRouter.post("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = addressSchema.parse(req.body);
  if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  const count = await prisma.address.count({ where: { userId } });
  const address = await prisma.address.create({ data: { ...data, userId, isDefault: data.isDefault || count === 0 } });
  ok(res, present(address), 201);
}));

addressesRouter.patch("/:id", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = addressSchema.partial().parse(req.body);
  const owned = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
  if (!owned) throw new AppError(404, "Address not found", "NOT_FOUND");
  if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  const address = await prisma.address.update({ where: { id: req.params.id }, data });
  ok(res, present(address));
}));

addressesRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.address.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));

addressesRouter.post("/:id/default", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const owned = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
  if (!owned) throw new AppError(404, "Address not found", "NOT_FOUND");
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } });
  ok(res, { isDefault: true });
}));

addressesRouter.post("/validate", asyncHandler(async (req, res) => {
  const data = addressSchema.partial().parse(req.body);
  ok(res, { valid: !!(data.line1 && data.postcode && data.city), normalised: data });
}));
