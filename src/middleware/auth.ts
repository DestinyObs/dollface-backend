import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

/** Require a valid Bearer access token; attaches userId/userRole to the request. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token", "TOKEN_INVALID");
  }
}

/** Read the authenticated user id inside a handler (after requireAuth). */
export function authUserId(req: Request): string {
  if (!req.userId) throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
  return req.userId;
}

/** Require an ADMIN role (chain after requireAuth). */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN") throw new AppError(403, "Admin access required", "FORBIDDEN");
  next();
}
