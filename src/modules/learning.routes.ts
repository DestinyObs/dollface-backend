import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const learningRouter = Router();
learningRouter.use(requireAuth);

learningRouter.get("/progress", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const [completed, inProgress, total] = await prisma.$transaction([
    prisma.tutorialCompletion.count({ where: { userId } }),
    prisma.tutorialProgress.count({ where: { userId, pct: { gt: 0, lt: 100 } } }),
    prisma.tutorial.count(),
  ]);
  ok(res, { completed, inProgress, total, percent: total ? Math.round((completed / total) * 100) : 0 });
}));

learningRouter.get("/achievements", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const [all, earned] = await prisma.$transaction([
    prisma.achievement.findMany({ orderBy: { order: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);
  const earnedIds = new Set(earned.map((e) => e.achievementId));
  ok(res, all.map((a) => ({ id: a.id, title: a.title, description: a.description, icon: a.icon, earned: earnedIds.has(a.id) })));
}));

learningRouter.get("/playlists", asyncHandler(async (_req, res) => {
  const playlists = await prisma.collection.findMany({ where: { kind: "playlist" }, orderBy: { order: "asc" } });
  ok(res, playlists.map((p) => ({ id: p.id, title: p.title, items: p.items })));
}));
