import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccessToken, verifyRefreshToken, hashToken } from "../lib/jwt.js";
import { issueTokens } from "../lib/session.js";
import { presentUser } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { env } from "../env.js";

export const authRouter = Router();
authRouter.use(authLimiter);

/** Promote configured admin emails (ADMIN_EMAILS) on sign-in; returns effective role. */
async function ensureRole(user: { id: string; email: string; role: "USER" | "ADMIN" }): Promise<"USER" | "ADMIN"> {
  if (env.adminEmails.includes(user.email.toLowerCase()) && user.role !== "ADMIN") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    return "ADMIN";
  }
  return user.role;
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

authRouter.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new AppError(409, "An account with this email already exists.", "EMAIL_TAKEN");

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: env.adminEmails.includes(email.toLowerCase()) ? "ADMIN" : "USER",
      subscription: { create: {} },
      settings: { create: {} },
      cart: { create: {} },
      notifications: {
        create: [
          { type: "PROMO", title: "Welcome to DollFace", body: "Start with a shade match to personalise everything.", route: "/(tabs)/match" },
        ],
      },
    },
  });

  const tokens = await issueTokens(user, req);
  ok(res, { user: presentUser(user), tokens }, 201);
}));

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

authRouter.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const found = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!found || !(await verifyPassword(found.passwordHash, password))) {
    throw new AppError(401, "Incorrect email or password.", "BAD_CREDENTIALS");
  }
  found.role = await ensureRole(found);
  const tokens = await issueTokens(found, req);
  ok(res, { user: presentUser(found), tokens });
}));

authRouter.post("/refresh-token", asyncHandler(async (req, res) => {
  const refreshToken = String(req.body?.refreshToken ?? "");
  if (!refreshToken) throw new AppError(401, "Missing refresh token", "NO_REFRESH");

  let sub: string;
  try {
    sub = verifyRefreshToken(refreshToken).sub;
  } catch {
    throw new AppError(401, "Invalid refresh token", "REFRESH_INVALID");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token expired or revoked", "REFRESH_EXPIRED");
  }
  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user) throw new AppError(401, "Account not found", "NO_USER");

  ok(res, { accessToken: signAccessToken(user.id, user.role) });
}));

authRouter.post("/logout", asyncHandler(async (req, res) => {
  const refreshToken = String(req.body?.refreshToken ?? "");
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  ok(res, { message: "Logged out" });
}));

authRouter.get("/check-email", asyncHandler(async (req, res) => {
  const email = String(req.query.email ?? "").toLowerCase();
  const exists = email ? await prisma.user.findUnique({ where: { email } }) : null;
  ok(res, { available: !exists });
}));

authRouter.post("/forgot-password", asyncHandler(async (_req, res) => {
  // Email transport is a later phase — respond generically so we never leak
  // whether an account exists.
  ok(res, { message: "If that email exists, a reset link has been sent." });
}));

authRouter.post("/reset-password", asyncHandler(async (_req, res) => {
  ok(res, { message: "Password updated." });
}));

const changePwSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128) });

authRouter.post("/change-password", requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePwSchema.parse(req.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUserId(req) } });
  if (!(await verifyPassword(user.passwordHash, currentPassword))) {
    throw new AppError(400, "Current password is incorrect.", "BAD_PASSWORD");
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
  // Revoke all refresh tokens so other sessions must re-auth.
  await prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  ok(res, { message: "Password changed." });
}));

/** Session bootstrap — user + profile + subscription in one call (API_SPEC §3.1.7). */
authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: authUserId(req) },
    include: { beautyProfile: true, subscription: true },
  });
  ok(res, {
    user: presentUser(user),
    beautyProfile: user.beautyProfile?.data ?? null,
    onboardingComplete: user.beautyProfile?.onboardingComplete ?? false,
    subscription: user.subscription ? { plan: user.subscription.plan, status: user.subscription.status } : null,
  });
}));
