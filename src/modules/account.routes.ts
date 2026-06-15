import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentUser } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { resolveMediaUrl, saveUpload } from "../providers/storage.js";

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

// ── Avatar ────────────────────────────────────────────────
accountRouter.post("/avatar", upload.single("avatar"), asyncHandler(async (req, res) => {
  const avatarUrl = req.file
    ? await saveUpload(req.file.buffer, req.file.mimetype)
    : resolveMediaUrl(String(req.body?.url ?? req.body?.dataUrl ?? ""));
  await prisma.user.update({ where: { id: authUserId(req) }, data: { avatarUrl } });
  ok(res, { avatarUrl });
}));

accountRouter.delete("/avatar", asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: authUserId(req) }, data: { avatarUrl: null } });
  ok(res, { avatarUrl: null });
}));

// ── Preferences ───────────────────────────────────────────
accountRouter.get("/preferences", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const p = await prisma.preferences.upsert({ where: { userId }, create: { userId }, update: {} });
  const { id, userId: _u, ...prefs } = p;
  ok(res, prefs);
}));

const prefsSchema = z.object({
  language: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  currency: z.string().optional(),
  country: z.string().optional(),
  units: z.enum(["metric", "imperial"]).optional(),
});

accountRouter.patch("/preferences", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = prefsSchema.parse(req.body);
  const p = await prisma.preferences.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  const { id, userId: _u, ...prefs } = p;
  ok(res, prefs);
}));

// ── Consents ──────────────────────────────────────────────
accountRouter.get("/consents", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const c = await prisma.consents.upsert({ where: { userId }, create: { userId }, update: {} });
  const { id, userId: _u, ...consents } = c;
  ok(res, consents);
}));

const consentsSchema = z.object({
  marketing: z.boolean().optional(),
  dataProcessing: z.boolean().optional(),
  cookies: z.boolean().optional(),
});

accountRouter.patch("/consents", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = consentsSchema.parse(req.body);
  const c = await prisma.consents.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  const { id, userId: _u, ...consents } = c;
  ok(res, consents);
}));

// ── Data export (GDPR) ────────────────────────────────────
accountRouter.post("/export", asyncHandler(async (req, res) => {
  const job = await prisma.dataExport.create({ data: { userId: authUserId(req), status: "PENDING" } });
  ok(res, { jobId: job.id, status: job.status }, 202);
}));

accountRouter.get("/export/:jobId", asyncHandler(async (req, res) => {
  const job = await prisma.dataExport.findFirst({ where: { id: req.params.jobId, userId: authUserId(req) } });
  if (!job) throw new AppError(404, "Export job not found", "NOT_FOUND");
  ok(res, { jobId: job.id, status: job.status, url: job.url });
}));

// ── Activity log ──────────────────────────────────────────
accountRouter.get("/activity", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const [matches, completions, orders] = await prisma.$transaction([
    prisma.shadeMatch.findMany({ where: { userId }, take: 10, orderBy: { createdAt: "desc" }, select: { createdAt: true, name: true } }),
    prisma.tutorialCompletion.findMany({ where: { userId }, take: 10, orderBy: { completedAt: "desc" }, include: { tutorial: { select: { title: true } } } }),
    prisma.order.findMany({ where: { userId }, take: 10, orderBy: { createdAt: "desc" }, select: { createdAt: true, total: true } }),
  ]);
  const items = [
    ...matches.map((m) => ({ type: "match", label: `Matched ${m.name}`, at: m.createdAt.toISOString() })),
    ...completions.map((c) => ({ type: "tutorial", label: `Completed ${c.tutorial.title}`, at: c.completedAt.toISOString() })),
    ...orders.map((o) => ({ type: "order", label: `Order £${o.total}`, at: o.createdAt.toISOString() })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  ok(res, items);
}));

// ── Deactivate / reactivate ───────────────────────────────
accountRouter.post("/deactivate", asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: authUserId(req) }, data: { deactivatedAt: new Date() } });
  ok(res, { deactivated: true });
}));

accountRouter.post("/reactivate", asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: authUserId(req) }, data: { deactivatedAt: null } });
  ok(res, { reactivated: true });
}));
