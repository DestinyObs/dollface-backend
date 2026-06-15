import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { presentLook } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const feedRouter = Router();
feedRouter.use(requireAuth);

/** Consecutive-day activity streak ending today (or yesterday). */
function computeStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  const days = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  const cursor = new Date();
  const key = (d: Date) => d.toISOString().slice(0, 10);
  if (!days.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(key(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(key(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

feedRouter.get("/home", asyncHandler(async (req, res) => {
  const userId = authUserId(req);

  const [latestMatch, looks, progress, matchDates, scanDates, completionDates] = await prisma.$transaction([
    prisma.shadeMatch.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.look.findMany({ orderBy: { order: "asc" } }),
    prisma.tutorialProgress.findMany({ where: { userId }, include: { tutorial: true }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.shadeMatch.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.scan.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.tutorialCompletion.findMany({ where: { userId }, select: { completedAt: true } }),
  ]);

  const streak = computeStreak([
    ...matchDates.map((m) => m.createdAt),
    ...scanDates.map((s) => s.createdAt),
    ...completionDates.map((c) => c.completedAt),
  ]);

  ok(res, {
    streak,
    matchedShade: latestMatch
      ? {
          name: latestMatch.name,
          product: `${latestMatch.brand} · ${latestMatch.pct} match`,
          matchPct: parseInt(latestMatch.pct, 10) || 0,
          hex: latestMatch.color,
        }
      : null,
    trendingLooks: looks.map(presentLook),
    continueLearning: progress.map((p) => ({
      id: p.tutorialId,
      title: p.tutorial.title,
      meta: p.meta ?? `${p.tutorial.mins} left`,
      pct: p.pct,
      img: p.tutorial.img,
    })),
  });
}));
