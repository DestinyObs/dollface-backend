import { Router } from "express";
import { z } from "zod";
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

tutorialsRouter.get("/:id/related", asyncHandler(async (req, res) => {
  const t = await prisma.tutorial.findUnique({ where: { id: req.params.id } });
  if (!t) throw new AppError(404, "Tutorial not found", "NOT_FOUND");
  const related = await prisma.tutorial.findMany({ where: { cat: t.cat, id: { not: t.id } }, take: 4, orderBy: { order: "asc" } });
  ok(res, related.map(presentTutorialSummary));
}));

tutorialsRouter.get("/:id/stream", asyncHandler(async (req, res) => {
  // Signed video URL (CDN integration is a later phase).
  ok(res, { url: `https://stream.dollface.app/${req.params.id}.m3u8`, expiresIn: 3600 });
}));

const progressSchema = z.object({ step: z.number().int().optional(), percent: z.number().int().min(0).max(100) });

tutorialsRouter.post("/:id/progress", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const tutorialId = req.params.id;
  const { percent } = progressSchema.parse(req.body);
  await prisma.tutorialProgress.upsert({
    where: { userId_tutorialId: { userId, tutorialId } },
    create: { userId, tutorialId, pct: percent },
    update: { pct: percent },
  });
  ok(res, { pct: percent });
}));

tutorialsRouter.post("/:id/like", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  await prisma.tutorialLike.upsert({
    where: { userId_tutorialId: { userId, tutorialId: req.params.id } },
    create: { userId, tutorialId: req.params.id }, update: {},
  });
  ok(res, { liked: true });
}));

tutorialsRouter.delete("/:id/like", requireAuth, asyncHandler(async (req, res) => {
  await prisma.tutorialLike.deleteMany({ where: { userId: authUserId(req), tutorialId: req.params.id } });
  ok(res, { liked: false });
}));

tutorialsRouter.get("/:id/comments", asyncHandler(async (req, res) => {
  const comments = await prisma.tutorialComment.findMany({
    where: { tutorialId: req.params.id }, include: { user: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" }, take: 50,
  });
  ok(res, comments.map((c) => ({ id: c.id, author: c.user.name, avatar: c.user.avatarUrl ?? undefined, body: c.body, createdAt: c.createdAt.toISOString() })));
}));

tutorialsRouter.post("/:id/comments", requireAuth, asyncHandler(async (req, res) => {
  const body = String(req.body?.body ?? "").trim();
  if (!body) throw new AppError(400, "Comment cannot be empty", "EMPTY");
  const c = await prisma.tutorialComment.create({ data: { tutorialId: req.params.id, userId: authUserId(req), body } });
  ok(res, { id: c.id, body: c.body, createdAt: c.createdAt.toISOString() }, 201);
}));

// ── detail (keep last so it doesn't shadow the routes above) ──
tutorialsRouter.get("/:id", asyncHandler(async (req, res) => {
  const t = await prisma.tutorial.findUnique({ where: { id: req.params.id } });
  if (!t) throw new AppError(404, "Tutorial not found", "NOT_FOUND");
  ok(res, presentTutorialDetail(t));
}));
