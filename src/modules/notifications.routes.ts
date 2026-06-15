import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentNotification } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/", asyncHandler(async (req, res) => {
  const items = await prisma.notification.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, items.map(presentNotification));
}));

notificationsRouter.get("/unread-count", asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({ where: { userId: authUserId(req), read: false } });
  ok(res, { count });
}));

notificationsRouter.post("/read-all", asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: authUserId(req), read: false }, data: { read: true } });
  ok(res, { ok: true });
}));

notificationsRouter.get("/preferences", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const p = await prisma.notificationPref.upsert({ where: { userId }, create: { userId }, update: {} });
  const { id, userId: _u, ...prefs } = p;
  ok(res, prefs);
}));

notificationsRouter.patch("/preferences", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = z.object({ matches: z.boolean().optional(), tutorials: z.boolean().optional(), promos: z.boolean().optional(), orders: z.boolean().optional() }).parse(req.body);
  const p = await prisma.notificationPref.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  const { id, userId: _u, ...prefs } = p;
  ok(res, prefs);
}));

notificationsRouter.post("/:id/snooze", asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { id: req.params.id, userId: authUserId(req) }, data: { read: true } });
  ok(res, { snoozed: true });
}));

notificationsRouter.post("/:id/read", asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: authUserId(req) },
    data: { read: true },
  });
  if (result.count === 0) throw new AppError(404, "Notification not found", "NOT_FOUND");
  ok(res, { ok: true });
}));

notificationsRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));
