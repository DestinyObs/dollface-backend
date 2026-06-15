import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";

export const systemRouter = Router();

systemRouter.get("/config", asyncHandler(async (_req, res) => {
  ok(res, {
    appName: "DollFace",
    supportEmail: "hello@dollface.app",
    currency: "GBP",
    country: "GB",
    minSupportedVersion: "1.0.0",
    urls: { terms: "/api/content/terms", privacy: "/api/content/privacy", help: "https://dollface.app/help" },
  });
}));

systemRouter.get("/feature-flags", asyncHandler(async (_req, res) => {
  ok(res, {
    shadeMatchSelfie: true,
    lookRecreation: true,
    shop: true,
    subscriptions: true,
    socialLogin: false,
    reviews: false,
  });
}));

systemRouter.get("/version-check", asyncHandler(async (req, res) => {
  const platform = String(req.query.platform ?? "ios");
  ok(res, { platform, latest: "1.0.0", minimum: "1.0.0", forceUpdate: false, updateUrl: null });
}));

/** Readiness — verifies the database is reachable. */
systemRouter.get("/ready", asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  ok(res, { status: "ready", db: "up" });
}));

systemRouter.get("/maintenance", asyncHandler(async (_req, res) => {
  ok(res, { active: false, message: null });
}));

systemRouter.get("/locales", asyncHandler(async (_req, res) => {
  ok(res, [{ code: "en", label: "English" }, { code: "fr", label: "Français" }, { code: "es", label: "Español" }]);
}));

systemRouter.get("/countries", asyncHandler(async (_req, res) => {
  ok(res, [
    { code: "GB", name: "United Kingdom", currency: "GBP" },
    { code: "US", name: "United States", currency: "USD" },
    { code: "NG", name: "Nigeria", currency: "NGN" },
    { code: "FR", name: "France", currency: "EUR" },
  ]);
}));

systemRouter.get("/i18n/:locale", asyncHandler(async (req, res) => {
  ok(res, { locale: req.params.locale, strings: {} });
}));
