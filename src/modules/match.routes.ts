import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentMatchResult, presentRecentMatch, presentMatchHistoryItem, presentScan } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
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
matchRouter.post("/selfie", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
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

matchRouter.post("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  const match = await prisma.shadeMatch.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
  ok(res, { saved: true });
}));

matchRouter.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const match = await prisma.shadeMatch.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
  ok(res, presentMatchResult(match));
}));
