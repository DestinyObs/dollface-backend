import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { presentUser } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const accountRouter = Router();
accountRouter.use(requireAuth);

accountRouter.get("/", asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUserId(req) } });
  ok(res, presentUser(user));
}));

const patchMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().nullish(),
  bio: z.string().max(280).nullish(),
});

accountRouter.patch("/", asyncHandler(async (req, res) => {
  const data = patchMeSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id: authUserId(req) }, data });
  ok(res, presentUser(user));
}));

accountRouter.delete("/", asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: authUserId(req) } });
  ok(res, { deleted: true });
}));

accountRouter.get("/stats", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const [tutorialSaves, productSaves, lookSaves, done, matches] = await prisma.$transaction([
    prisma.tutorialSave.count({ where: { userId } }),
    prisma.productSave.count({ where: { userId } }),
    prisma.savedLook.count({ where: { userId } }),
    prisma.tutorialCompletion.count({ where: { userId } }),
    prisma.shadeMatch.count({ where: { userId } }),
  ]);
  ok(res, { saved: String(tutorialSaves + productSaves + lookSaves), done: String(done), matches: String(matches) });
}));

accountRouter.get("/settings", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const settings = await prisma.settings.upsert({ where: { userId }, create: { userId }, update: {} });
  const { id, userId: _u, ...toggles } = settings;
  ok(res, toggles);
}));

const settingsSchema = z.object({
  push: z.boolean().optional(),
  email: z.boolean().optional(),
  tips: z.boolean().optional(),
  analytics: z.boolean().optional(),
  personalisation: z.boolean().optional(),
  storeScans: z.boolean().optional(),
});

accountRouter.patch("/settings", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = settingsSchema.parse(req.body);
  const settings = await prisma.settings.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  const { id, userId: _u, ...toggles } = settings;
  ok(res, toggles);
}));
