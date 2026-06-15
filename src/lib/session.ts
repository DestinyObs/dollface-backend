import type { Request } from "express";
import { prisma } from "../db.js";
import { signAccessToken, signRefreshToken, hashToken, refreshExpiry } from "./jwt.js";

/** Issue an access token + a persisted (hashed) refresh token for a user. */
export async function issueTokens(user: { id: string; role: string }, req: Request) {
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent: req.headers["user-agent"]?.slice(0, 255),
      expiresAt: refreshExpiry(),
    },
  });
  return { accessToken, refreshToken };
}
