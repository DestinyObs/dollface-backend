import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFoundHandler, errorMiddleware } from "./lib/errors.js";

import { authRouter } from "./modules/auth.routes.js";
import { accountRouter } from "./modules/account.routes.js";
import { beautyProfileRouter } from "./modules/beautyProfile.routes.js";
import { feedRouter } from "./modules/feed.routes.js";
import { tutorialsRouter } from "./modules/tutorials.routes.js";
import { productsRouter } from "./modules/products.routes.js";
import { matchRouter } from "./modules/match.routes.js";
import { recreateRouter } from "./modules/recreate.routes.js";
import { cartRouter } from "./modules/cart.routes.js";
import { savedRouter } from "./modules/saved.routes.js";
import { subscriptionRouter } from "./modules/subscription.routes.js";
import { notificationsRouter } from "./modules/notifications.routes.js";
import { routinesRouter } from "./modules/routines.routes.js";
import { systemRouter } from "./modules/system.routes.js";
import { contentRouter } from "./modules/content.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  // Liveness (load balancers / uptime monitors)
  app.get("/health", (_req, res) =>
    res.json({ status: "ok", service: "dollface-backend", time: new Date().toISOString() }));

  // All app endpoints live under /api (matches EXPO_PUBLIC_API_URL=.../api)
  const api = express.Router();
  api.use(apiLimiter);
  api.use("/auth", authRouter);
  api.use("/me", accountRouter);
  api.use("/beauty-profile", beautyProfileRouter);
  api.use("/feed", feedRouter);
  api.use("/tutorials", tutorialsRouter);
  api.use("/products", productsRouter);
  api.use("/match", matchRouter);
  api.use("/recreate", recreateRouter);
  api.use("/cart", cartRouter);
  api.use("/saved", savedRouter);
  api.use("/subscription", subscriptionRouter);
  api.use("/notifications", notificationsRouter);
  api.use("/routines", routinesRouter);
  api.use("/system", systemRouter);
  api.use("/content", contentRouter);
  app.use("/api", api);

  app.use(notFoundHandler);
  app.use(errorMiddleware);
  return app;
}
