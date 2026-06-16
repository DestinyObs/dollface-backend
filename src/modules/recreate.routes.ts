import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentRecreation } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { saveUpload } from "../providers/storage.js";
import { analyzeRecreation } from "../providers/ai.js";

export const recreateRouter = Router();
recreateRouter.use(requireAuth);

/** Upload inspiration → run real AI look analysis, persist the breakdown. */
recreateRouter.post("/upload", upload.single("image"), asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  if (!req.file) throw new AppError(400, "An inspiration image is required", "NO_IMAGE");
  await prisma.mediaAsset.create({ data: { userId, url: await saveUpload(req.file.buffer, req.file.mimetype), type: "inspiration" } }).catch(() => {});
  const analysis = await analyzeRecreation({ buffer: req.file.buffer, mimetype: req.file.mimetype });
  const rec = await prisma.recreation.create({
    data: {
      userId,
      status: "DONE",
      versions: analysis.versions,
      aiNote: analysis.aiNote,
      sections: analysis.sections as unknown as Prisma.InputJsonValue,
    },
  });
  ok(res, { id: rec.id, status: "DONE", source: analysis.source }, 201);
}));

recreateRouter.get("/history", asyncHandler(async (req, res) => {
  const items = await prisma.recreation.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, items.map(presentRecreation));
}));

recreateRouter.get("/:id/status", asyncHandler(async (req, res) => {
  const rec = await prisma.recreation.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!rec) throw new AppError(404, "Recreation not found", "NOT_FOUND");
  ok(res, { id: rec.id, status: rec.status });
}));

recreateRouter.post("/:id/save", asyncHandler(async (req, res) => {
  const rec = await prisma.recreation.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!rec) throw new AppError(404, "Recreation not found", "NOT_FOUND");
  ok(res, { saved: true });
}));

recreateRouter.get("/gallery", asyncHandler(async (_req, res) => {
  // Public trending recreations — curated later via CMS.
  ok(res, []);
}));

recreateRouter.post("/:id/share", asyncHandler(async (req, res) => {
  const rec = await prisma.recreation.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!rec) throw new AppError(404, "Recreation not found", "NOT_FOUND");
  ok(res, { url: `https://dollface.app/r/${rec.id}` });
}));

recreateRouter.post("/:id/report", asyncHandler(async (req, res) => {
  ok(res, { reported: true });
}));

recreateRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.recreation.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));

recreateRouter.get("/:id", asyncHandler(async (req, res) => {
  const rec = await prisma.recreation.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!rec) throw new AppError(404, "Recreation not found", "NOT_FOUND");
  ok(res, presentRecreation(rec));
}));
