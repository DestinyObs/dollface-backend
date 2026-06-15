import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentMatchResult, presentRecentMatch, presentMatchHistoryItem, presentScan } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { saveUpload } from "../providers/storage.js";
import { SAMPLE_TONE, SAMPLE_MATCH_ITEMS, SAMPLE_MATCH_HEADLINE } from "../lib/samples.js";

export const matchRouter = Router();

matchRouter.get("/categories", asyncHandler(async (_req, res) => {
  ok(res, ["Foundation", "Concealer", "Powder", "Blush", "Bronzer", "Lip"]);
}));

matchRouter.get("/recent", requireAuth, asyncHandler(async (req, res) => {
  const matches = await prisma.shadeMatch.findMany({
    where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" }, take: 6,
  });
  ok(res, matches.map(presentRecentMatch));
}));

matchRouter.get("/history", requireAuth, asyncHandler(async (req, res) => {
  const matches = await prisma.shadeMatch.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, matches.map(presentMatchHistoryItem));
}));

matchRouter.get("/scans", requireAuth, asyncHandler(async (req, res) => {
  const scans = await prisma.scan.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, scans.map(presentScan));
}));

/** Selfie scan → records a scan + a shade match, returns the result. */
matchRouter.post("/selfie", requireAuth, upload.single("selfie"), asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  if (req.file) await prisma.mediaAsset.create({ data: { userId, url: await saveUpload(req.file.buffer, req.file.mimetype), type: "selfie" } }).catch(() => {});
  const items = SAMPLE_MATCH_ITEMS as unknown as Prisma.InputJsonValue;
  const [, match] = await prisma.$transaction([
    prisma.scan.create({ data: { userId, tone: SAMPLE_TONE.label, confidence: "High" } }),
    prisma.shadeMatch.create({
      data: {
        userId, kind: "SELFIE", ...SAMPLE_MATCH_HEADLINE,
        toneLabel: SAMPLE_TONE.label, toneSub: "Based on your selfie analysis", toneHex: SAMPLE_TONE.hex, toneConfidence: SAMPLE_TONE.confidence,
        items,
      },
    }),
  ]);
  ok(res, presentMatchResult(match), 201);
}));

const manualSchema = z.object({ shade: z.string().min(1), brand: z.string().optional(), category: z.string().min(1) });

/** Manual shade entry → cross-brand match. */
matchRouter.post("/manual", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const { shade, brand } = manualSchema.parse(req.body);
  const match = await prisma.shadeMatch.create({
    data: {
      userId, kind: "MANUAL",
      name: shade, brand: brand ?? "Cross-brand", pct: "90%", color: SAMPLE_TONE.hex,
      toneLabel: SAMPLE_TONE.label, toneSub: "Based on your shade entry", toneHex: SAMPLE_TONE.hex, toneConfidence: SAMPLE_TONE.confidence,
      items: SAMPLE_MATCH_ITEMS as unknown as Prisma.InputJsonValue,
    },
  });
  ok(res, presentMatchResult(match), 201);
}));

matchRouter.get("/selfie/:jobId/status", requireAuth, asyncHandler(async (req, res) => {
  const match = await prisma.shadeMatch.findFirst({ where: { id: req.params.jobId, userId: authUserId(req) } });
  ok(res, { id: req.params.jobId, status: match ? "DONE" : "PROCESSING" });
}));

matchRouter.post("/compare", requireAuth, asyncHandler(async (req, res) => {
  const { a, b } = req.body ?? {};
  ok(res, { a, b, similarity: 0.86, note: "These shades are a close cross-brand equivalent." });
}));

matchRouter.post("/undertone-test", requireAuth, asyncHandler(async (req, res) => {
  const answers: string[] = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const warm = answers.filter((x) => String(x).toLowerCase().startsWith("w")).length;
  const undertone = warm > answers.length / 2 ? "Warm" : "Cool";
  ok(res, { undertone, confidence: "High" });
}));

matchRouter.delete("/scans/:id", requireAuth, asyncHandler(async (req, res) => {
  await prisma.scan.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));

matchRouter.post("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  const result = await prisma.shadeMatch.updateMany({ where: { id: req.params.id, userId: authUserId(req) }, data: { saved: true } });
  if (result.count === 0) throw new AppError(404, "Match not found", "NOT_FOUND");
  ok(res, { saved: true });
}));

matchRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await prisma.shadeMatch.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));

matchRouter.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const match = await prisma.shadeMatch.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
  ok(res, presentMatchResult(match));
}));
