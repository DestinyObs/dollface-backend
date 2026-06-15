import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFoundHandler, errorMiddleware } from "./lib/errors.js";

import { authRouter } from "./modules/auth.routes.js";
import { authExtraRouter } from "./modules/authExtra.routes.js";
import { accountRouter } from "./modules/account.routes.js";
import { beautyProfileRouter } from "./modules/beautyProfile.routes.js";
import { feedRouter } from "./modules/feed.routes.js";
import { tutorialsRouter } from "./modules/tutorials.routes.js";
import { learningRouter } from "./modules/learning.routes.js";
import { productsRouter } from "./modules/products.routes.js";
import { brandsRouter } from "./modules/brands.routes.js";
import { productReviewsRouter, reviewActionsRouter, questionsRouter } from "./modules/reviews.routes.js";
import { matchRouter } from "./modules/match.routes.js";
import { recreateRouter } from "./modules/recreate.routes.js";
import { shelfRouter } from "./modules/shelf.routes.js";
import { cartRouter } from "./modules/cart.routes.js";
import { savedRouter } from "./modules/saved.routes.js";
import { wishlistRouter } from "./modules/wishlist.routes.js";
import { addressesRouter } from "./modules/addresses.routes.js";
import { checkoutRouter, ordersRouter, returnsRouter } from "./modules/orders.routes.js";
import { paymentsRouter } from "./modules/payments.routes.js";
import { subscriptionRouter, billingRouter } from "./modules/subscription.routes.js";
import { promosRouter, referralsRouter, creditsRouter } from "./modules/promos.routes.js";
import { notificationsRouter } from "./modules/notifications.routes.js";
import { devicesRouter } from "./modules/devices.routes.js";
import { routinesRouter } from "./modules/routines.routes.js";
import { searchRouter } from "./modules/search.routes.js";
import { systemRouter } from "./modules/system.routes.js";
import { contentRouter } from "./modules/content.routes.js";
import { supportRouter, feedbackRouter } from "./modules/support.routes.js";
import { mediaRouter } from "./modules/media.routes.js";
import { eventsRouter, marketingRouter, webhooksRouter } from "./modules/misc.routes.js";
import { adminRouter } from "./modules/admin.routes.js";

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

  // auth & account
  api.use("/auth", authRouter);
  api.use("/auth", authExtraRouter);
  api.use("/me", accountRouter);
  api.use("/beauty-profile", beautyProfileRouter);

  // content & learning
  api.use("/feed", feedRouter);
  api.use("/tutorials", tutorialsRouter);
  api.use("/learning", learningRouter);

  // catalog
  api.use("/products", productReviewsRouter); // /products/:id/reviews|questions (before product :id falls through)
  api.use("/products", productsRouter);
  api.use("/brands", brandsRouter);
  api.use("/reviews", reviewActionsRouter);
  api.use("/questions", questionsRouter);

  // beauty engine
  api.use("/match", matchRouter);
  api.use("/recreate", recreateRouter);
  api.use("/shelf", shelfRouter);

  // commerce
  api.use("/cart", cartRouter);
  api.use("/saved", savedRouter);
  api.use("/wishlist", wishlistRouter);
  api.use("/addresses", addressesRouter);
  api.use("/checkout", checkoutRouter);
  api.use("/orders", ordersRouter);
  api.use("/returns", returnsRouter);
  api.use("/payments", paymentsRouter);
  api.use("/subscription", subscriptionRouter);
  api.use("/billing", billingRouter);
  api.use("/promos", promosRouter);
  api.use("/referrals", referralsRouter);
  api.use("/credits", creditsRouter);

  // engagement & discovery
  api.use("/notifications", notificationsRouter);
  api.use("/devices", devicesRouter);
  api.use("/routines", routinesRouter);
  api.use("/search", searchRouter);

  // platform
  api.use("/system", systemRouter);
  api.use("/content", contentRouter);
  api.use("/support", supportRouter);
  api.use("/feedback", feedbackRouter);
  api.use("/media", mediaRouter);
  api.use("/events", eventsRouter);
  api.use("/marketing", marketingRouter);
  api.use("/webhooks", webhooksRouter);
  api.use("/admin", adminRouter);

  app.use("/api", api);
  app.use(notFoundHandler);
  app.use(errorMiddleware);
  return app;
}
