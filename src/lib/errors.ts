import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../env.js";
import { logger } from "./logger.js";
import { captureException } from "./sentry.js";

/** Throwable application error with an HTTP status + optional machine code. */
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFoundHandler = (_req: Request, res: Response) =>
  res.status(404).json({ success: false, message: "Not found", code: "NOT_FOUND" });

/** Central error middleware — maps known error types to the error envelope. */
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) fields[issue.path.join(".") || "_"] = issue.message;
    return res.status(400).json({ success: false, message: "Validation failed", code: "VALIDATION", errors: fields });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message, code: err.code, errors: err.details });
  }

  // Prisma: unique constraint, not found
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Already exists", code: "CONFLICT" });
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Not found", code: "NOT_FOUND" });
  }

  captureException(err);
  logger.error({ err }, "Unhandled error");
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    code: "INTERNAL",
    ...(env.isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
