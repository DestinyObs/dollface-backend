import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentTutorialSummary, presentFeaturedTutorial, presentTutorialDetail } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const tutorialsRouter = Router();

// ── public reads ──────────────────────────────────────────
tutorialsRouter.get("/", asyncHandler(async (req, res) => {
  const category = req.query.category ? String(req.query.category) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;
  const where: Prisma.TutorialWhereInput = {};
  if (category && category !== "All") where.cat = category;
  if (search) where.title = { contains: search, mode: "insensitive" };
  const items = await prisma.tutorial.findMany({ where, orderBy: { order: "asc" } });
  ok(res, items.map(presentTutorialSummary));
}));

tutorialsRouter.get("/featured", asyncHandler(async (_req, res) => {
  const t = (await prisma.tutorial.findFirst({ where: { featured: true } }))
    ?? (await prisma.tutorial.findFirst({ orderBy: { order: "asc" } }));
  if (!t) throw new AppError(404, "No tutorials available", "NOT_FOUND");
  ok(res, presentFeaturedTutorial(t));
}));

tutorialsRouter.get("/categories", asyncHandler(async (_req, res) => {
  ok(res, ["All", "Base", "Eyes", "Lips", "Brows", "Cheeks"]);
}));

// ── saved (auth) ──────────────────────────────────────────
tutorialsRouter.get("/saved", requireAuth, asyncHandler(async (req, res) => {
  const saves = await prisma.tutorialSave.findMany({
    where: { userId: authUserId(req) },
    include: { tutorial: true },
    orderBy: { createdAt: "desc" },
  });
  ok(res, saves.map((s) => presentTutorialSummary(s.tutorial)));
}));

tutorialsRouter.post("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const tutorialId = req.params.id;
  await prisma.tutorialSave.upsert({
    where: { userId_tutorialId: { userId, tutorialId } },
    create: { userId, tutorialId },
    update: {},
  });
  ok(res, { saved: true });
}));

tutorialsRouter.delete("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  await prisma.tutorialSave.deleteMany({ where: { userId: authUserId(req), tutorialId: req.params.id } });
  ok(res, { saved: false });
}));

tutorialsRouter.post("/:id/complete", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const tutorialId = req.params.id;
  await prisma.tutorialCompletion.upsert({
    where: { userId_tutorialId: { userId, tutorialId } },
    create: { userId, tutorialId },
    update: { completedAt: new Date() },
  });
  ok(res, { ok: true });
}));

// ── detail (keep last so it doesn't shadow the routes above) ──
tutorialsRouter.get("/:id", asyncHandler(async (req, res) => {
  const t = await prisma.tutorial.findUnique({ where: { id: req.params.id } });
  if (!t) throw new AppError(404, "Tutorial not found", "NOT_FOUND");
  ok(res, presentTutorialDetail(t));
}));
