import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { presignUpload, resolveMediaUrl } from "../providers/storage.js";

export const mediaRouter = Router();
mediaRouter.use(requireAuth);

mediaRouter.post("/presign", asyncHandler(async (req, res) => {
  const type = String(req.body?.type ?? "image/jpeg");
  ok(res, presignUpload(type));
}));

mediaRouter.post("/", asyncHandler(async (req, res) => {
  const url = resolveMediaUrl(String(req.body?.url ?? req.body?.dataUrl ?? ""));
  const type = String(req.body?.type ?? "image");
  const asset = await prisma.mediaAsset.create({ data: { userId: authUserId(req), url, type } });
  ok(res, { id: asset.id, url: asset.url, type: asset.type }, 201);
}));

mediaRouter.get("/:id", asyncHandler(async (req, res) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
  if (!asset) throw new AppError(404, "Asset not found", "NOT_FOUND");
  ok(res, { id: asset.id, url: asset.url, type: asset.type, createdAt: asset.createdAt.toISOString() });
}));

mediaRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.mediaAsset.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));
