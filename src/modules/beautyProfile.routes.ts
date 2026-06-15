import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const beautyProfileRouter = Router();
beautyProfileRouter.use(requireAuth);

beautyProfileRouter.get("/", asyncHandler(async (req, res) => {
  const profile = await prisma.beautyProfile.findUnique({ where: { userId: authUserId(req) } });
  ok(res, profile?.data ?? {});
}));

/** Upsert the full profile (onboarding submit). */
beautyProfileRouter.put("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const data = (req.body ?? {}) as Prisma.InputJsonValue;
  const profile = await prisma.beautyProfile.upsert({
    where: { userId },
    create: { userId, data },
    update: { data },
  });
  ok(res, profile.data);
}));

/** Merge a partial profile update (per-step). */
beautyProfileRouter.patch("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const existing = await prisma.beautyProfile.findUnique({ where: { userId } });
  const merged = { ...(existing?.data as object ?? {}), ...(req.body ?? {}) } as Prisma.InputJsonValue;
  const profile = await prisma.beautyProfile.upsert({
    where: { userId },
    create: { userId, data: merged },
    update: { data: merged },
  });
  ok(res, profile.data);
}));

beautyProfileRouter.post("/complete", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  await prisma.beautyProfile.upsert({
    where: { userId },
    create: { userId, onboardingComplete: true },
    update: { onboardingComplete: true },
  });
  ok(res, { onboardingComplete: true });
}));

/** Chip catalogs the onboarding screens render. */
beautyProfileRouter.get("/options", asyncHandler(async (_req, res) => {
  ok(res, {
    goals: ["Everyday natural", "Glam & bold", "Master the basics", "Flawless base", "Eye looks", "Long-lasting wear"],
    skinTypes: ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
    skinTones: ["Fair", "Light", "Medium", "Tan", "Deep", "Rich"],
    undertones: ["Cool", "Neutral", "Warm", "Olive"],
    faceConcerns: ["Acne", "Redness", "Dark circles", "Large pores", "Fine lines", "Dullness", "Uneven tone"],
    preferredBrands: ["Fenty Beauty", "Rare Beauty", "MAC", "Charlotte Tilbury", "NARS", "Maybelline", "Benefit", "NYX"],
    skillLevels: ["Beginner", "Intermediate", "Advanced"],
    budgetRanges: ["Drugstore", "Mid-range", "Luxury", "Mix of all"],
    stylePreferences: ["Natural", "Soft glam", "Bold", "Editorial", "Minimal", "Trendy"],
  });
}));
