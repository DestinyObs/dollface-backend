import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentRecreation } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { SAMPLE_RECREATION } from "../lib/samples.js";

export const recreateRouter = Router();
recreateRouter.use(requireAuth);

/** Upload inspiration → kick off (synthetic) analysis, persist the breakdown. */
recreateRouter.post("/upload", asyncHandler(async (req, res) => {
  const rec = await prisma.recreation.create({
    data: {
      userId: authUserId(req),
      status: "DONE",
      versions: SAMPLE_RECREATION.versions,
      aiNote: SAMPLE_RECREATION.aiNote,
      sections: SAMPLE_RECREATION.sections as unknown as Prisma.InputJsonValue,
    },
  });
  ok(res, { id: rec.id, status: "PROCESSING" }, 201);
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

recreateRouter.get("/:id", asyncHandler(async (req, res) => {
  const rec = await prisma.recreation.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!rec) throw new AppError(404, "Recreation not found", "NOT_FOUND");
  ok(res, presentRecreation(rec));
}));
