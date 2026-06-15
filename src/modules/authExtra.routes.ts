import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { hashToken } from "../lib/jwt.js";
import { issueTokens } from "../lib/session.js";
import { presentUser } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { sendEmail } from "../providers/email.js";
import { verifyOAuthToken } from "../providers/oauth.js";

/** Auth endpoints beyond the core (social, verification, sessions, MFA, OTP). */
export const authExtraRouter = Router();
authExtraRouter.use(authLimiter);

const randomToken = () => crypto.randomBytes(24).toString("hex");

// ── Social login ──────────────────────────────────────────
authExtraRouter.post("/social/:provider", asyncHandler(async (req, res) => {
  const provider = req.params.provider as "google" | "apple";
  if (provider !== "google" && provider !== "apple") throw new AppError(400, "Unsupported provider", "BAD_PROVIDER");
  const idToken = String(req.body?.idToken ?? "");
  if (!idToken) throw new AppError(400, "Missing idToken", "NO_TOKEN");

  const profile = await verifyOAuthToken(provider, idToken);
  const link = await prisma.oAuthAccount.findUnique({
    where: { provider_providerId: { provider, providerId: profile.providerId } },
    include: { user: true },
  });

  let user = link?.user ?? null;
  let isNewUser = false;
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name: profile.name, email: profile.email, emailVerified: true,
          passwordHash: await hashPassword(randomToken()),
          subscription: { create: {} }, settings: { create: {} }, cart: { create: {} },
        },
      });
    }
    await prisma.oAuthAccount.create({ data: { userId: user.id, provider, providerId: profile.providerId } });
  }

  const tokens = await issueTokens(user, req);
  ok(res, { user: presentUser(user), tokens, isNewUser });
}));

// ── Email verification ────────────────────────────────────
authExtraRouter.post("/resend-verification", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const token = randomToken();
  await prisma.emailToken.create({ data: { userId, token, type: "VERIFY", expiresAt: new Date(Date.now() + 86400000) } });
  await sendEmail(user.email, "Verify your email", `Your verification code: ${token}`);
  ok(res, { sent: true });
}));

authExtraRouter.post("/verify-email", asyncHandler(async (req, res) => {
  const token = String(req.body?.token ?? "");
  const row = await prisma.emailToken.findUnique({ where: { token } });
  if (!row || row.type !== "VERIFY" || row.usedAt || row.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired token", "TOKEN_INVALID");
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { emailVerified: true } }),
    prisma.emailToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  ok(res, { verified: true });
}));

const changeEmailSchema = z.object({ newEmail: z.string().email(), password: z.string().min(1) });

authExtraRouter.post("/change-email", requireAuth, asyncHandler(async (req, res) => {
  const { newEmail, password } = changeEmailSchema.parse(req.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUserId(req) } });
  if (!(await verifyPassword(user.passwordHash, password))) throw new AppError(400, "Incorrect password", "BAD_PASSWORD");
  const taken = await prisma.user.findUnique({ where: { email: newEmail.toLowerCase() } });
  if (taken) throw new AppError(409, "Email already in use", "EMAIL_TAKEN");
  await prisma.user.update({ where: { id: user.id }, data: { email: newEmail.toLowerCase(), emailVerified: false } });
  ok(res, { email: newEmail.toLowerCase(), verificationRequired: true });
}));

// ── Sessions (devices) ────────────────────────────────────
authExtraRouter.get("/sessions", requireAuth, asyncHandler(async (req, res) => {
  const sessions = await prisma.refreshToken.findMany({
    where: { userId: authUserId(req), revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, userAgent: true, createdAt: true },
  });
  ok(res, sessions.map((s) => ({ id: s.id, userAgent: s.userAgent ?? "Unknown device", createdAt: s.createdAt.toISOString() })));
}));

authExtraRouter.delete("/sessions/:id", requireAuth, asyncHandler(async (req, res) => {
  await prisma.refreshToken.updateMany({ where: { id: req.params.id, userId: authUserId(req) }, data: { revokedAt: new Date() } });
  ok(res, { revoked: true });
}));

authExtraRouter.delete("/sessions", requireAuth, asyncHandler(async (req, res) => {
  await prisma.refreshToken.updateMany({ where: { userId: authUserId(req), revokedAt: null }, data: { revokedAt: new Date() } });
  ok(res, { revoked: true });
}));

// ── MFA (TOTP) — dev accepts any 6-digit code; wire otplib for prod ──
authExtraRouter.post("/mfa/setup", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const secret = crypto.randomBytes(20).toString("base64");
  await prisma.mfaSecret.upsert({ where: { userId }, create: { userId, secret }, update: { secret, enabled: false } });
  ok(res, { secret, otpauthUrl: `otpauth://totp/DollFace?secret=${encodeURIComponent(secret)}` });
}));

const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

authExtraRouter.post("/mfa/verify", requireAuth, asyncHandler(async (req, res) => {
  codeSchema.parse(req.body);
  await prisma.mfaSecret.update({ where: { userId: authUserId(req) }, data: { enabled: true } });
  ok(res, { enabled: true });
}));

authExtraRouter.post("/mfa/challenge", requireAuth, asyncHandler(async (req, res) => {
  codeSchema.parse(req.body);
  ok(res, { verified: true });
}));

authExtraRouter.delete("/mfa", requireAuth, asyncHandler(async (req, res) => {
  await prisma.mfaSecret.deleteMany({ where: { userId: authUserId(req) } });
  ok(res, { disabled: true });
}));

// ── Phone OTP — dev logs the code ─────────────────────────
authExtraRouter.post("/otp/request", asyncHandler(async (req, res) => {
  const phone = String(req.body?.phone ?? "");
  if (!phone) throw new AppError(400, "Missing phone", "NO_PHONE");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.otp.create({ data: { phone, codeHash: hashToken(code), expiresAt: new Date(Date.now() + 600000) } });
  console.log(`[otp:dev] ${phone} → ${code}`);
  ok(res, { sent: true });
}));

authExtraRouter.post("/otp/verify", asyncHandler(async (req, res) => {
  const phone = String(req.body?.phone ?? "");
  const code = String(req.body?.code ?? "");
  const otp = await prisma.otp.findFirst({
    where: { phone, codeHash: hashToken(code), usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) throw new AppError(400, "Invalid or expired code", "OTP_INVALID");
  await prisma.otp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  ok(res, { verified: true });
}));

// ── Magic link ────────────────────────────────────────────
authExtraRouter.post("/magic-link", asyncHandler(async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (user) {
    const token = randomToken();
    await prisma.emailToken.create({ data: { userId: user.id, token, type: "RESET", expiresAt: new Date(Date.now() + 900000) } });
    await sendEmail(email, "Your sign-in link", `Sign-in token: ${token}`);
  }
  ok(res, { message: "If that email exists, a sign-in link has been sent." });
}));

authExtraRouter.post("/magic-link/verify", asyncHandler(async (req, res) => {
  const token = String(req.body?.token ?? "");
  const row = await prisma.emailToken.findUnique({ where: { token }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw new AppError(400, "Invalid or expired link", "TOKEN_INVALID");
  await prisma.emailToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  const tokens = await issueTokens(row.user, req);
  ok(res, { user: presentUser(row.user), tokens });
}));
