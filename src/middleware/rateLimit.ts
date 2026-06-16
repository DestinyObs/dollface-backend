import rateLimit from "express-rate-limit";
import { env } from "../env.js";

// Skip in automated tests, and behind an explicit opt-out for local E2E /
// endpoint-transcript runs that fire many requests in a tight window.
const skip = () => env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "1";

/** Tight limit on auth endpoints (brute-force protection). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, message: "Too many attempts, please try again later.", code: "RATE_LIMIT" },
});

/** Generous global API limiter. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, message: "Too many requests.", code: "RATE_LIMIT" },
});
