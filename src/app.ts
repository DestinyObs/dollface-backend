import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import pinoHttp from "pino-http";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";
import { UPLOAD_DIR } from "./providers/storage.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFoundHandler, errorMiddleware } from "./lib/errors.js";
import { mounts } from "./routes.js";
import { buildOpenApiSpec } from "./docs/openapi.js";

export function createApp() {
  const app = express();

  // Behind Render/Cloudflare: trust the first proxy hop so rate-limiting keys on
  // the real client IP (not the shared proxy IP) — otherwise all users share one bucket.
  app.set("trust proxy", 1);

  if (env.NODE_ENV !== "test") app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));
  app.use(helmet({ contentSecurityPolicy: false })); // CSP off so Swagger UI assets load
  app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true, credentials: true }));
  app.use(express.json({ limit: "2mb", verify: (req, _res, buf) => { (req as unknown as { rawBody: Buffer }).rawBody = buf; } }));

  // Uploaded media (dev-mode local storage; swap for S3/Cloudinary in prod)
  app.use("/uploads", express.static(UPLOAD_DIR));

  // Liveness (load balancers / uptime monitors)
  app.get("/health", (_req, res) =>
    res.json({ status: "ok", service: "dollface-backend", time: new Date().toISOString() }));

  // Interactive API docs
  const openapiSpec = buildOpenApiSpec();
  app.get("/api/docs.json", (_req, res) => res.json(openapiSpec));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: "DollFace API", swaggerOptions: { persistAuthorization: true } }));

  // All app endpoints live under /api (matches EXPO_PUBLIC_API_URL=.../api)
  const api = express.Router();
  api.use(apiLimiter);
  for (const { base, router } of mounts) api.use(base, router);
  app.use("/api", api);

  app.use(notFoundHandler);
  app.use(errorMiddleware);
  return app;
}
