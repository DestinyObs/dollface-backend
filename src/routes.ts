import type { Router } from "express";
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

export interface Mount {
  base: string;
  router: Router;
  tag: string;
}

/** Single source of truth for route mounting AND the OpenAPI doc. Order matters. */
export const mounts: Mount[] = [
  { base: "/auth", router: authRouter, tag: "Auth" },
  { base: "/auth", router: authExtraRouter, tag: "Auth" },
  { base: "/me", router: accountRouter, tag: "Account" },
  { base: "/beauty-profile", router: beautyProfileRouter, tag: "Beauty Profile" },
  { base: "/feed", router: feedRouter, tag: "Feed" },
  { base: "/tutorials", router: tutorialsRouter, tag: "Tutorials" },
  { base: "/learning", router: learningRouter, tag: "Tutorials" },
  { base: "/products", router: productReviewsRouter, tag: "Reviews & Q&A" },
  { base: "/products", router: productsRouter, tag: "Products" },
  { base: "/brands", router: brandsRouter, tag: "Brands" },
  { base: "/reviews", router: reviewActionsRouter, tag: "Reviews & Q&A" },
  { base: "/questions", router: questionsRouter, tag: "Reviews & Q&A" },
  { base: "/match", router: matchRouter, tag: "Shade Match" },
  { base: "/recreate", router: recreateRouter, tag: "Recreate" },
  { base: "/shelf", router: shelfRouter, tag: "Shelf" },
  { base: "/cart", router: cartRouter, tag: "Cart" },
  { base: "/saved", router: savedRouter, tag: "Saved" },
  { base: "/wishlist", router: wishlistRouter, tag: "Wishlist" },
  { base: "/addresses", router: addressesRouter, tag: "Addresses" },
  { base: "/checkout", router: checkoutRouter, tag: "Checkout & Orders" },
  { base: "/orders", router: ordersRouter, tag: "Checkout & Orders" },
  { base: "/returns", router: returnsRouter, tag: "Checkout & Orders" },
  { base: "/payments", router: paymentsRouter, tag: "Payments" },
  { base: "/subscription", router: subscriptionRouter, tag: "Subscription" },
  { base: "/billing", router: billingRouter, tag: "Subscription" },
  { base: "/promos", router: promosRouter, tag: "Promos & Referrals" },
  { base: "/referrals", router: referralsRouter, tag: "Promos & Referrals" },
  { base: "/credits", router: creditsRouter, tag: "Promos & Referrals" },
  { base: "/notifications", router: notificationsRouter, tag: "Notifications" },
  { base: "/devices", router: devicesRouter, tag: "Notifications" },
  { base: "/routines", router: routinesRouter, tag: "Routines" },
  { base: "/search", router: searchRouter, tag: "Search" },
  { base: "/system", router: systemRouter, tag: "System" },
  { base: "/content", router: contentRouter, tag: "Content" },
  { base: "/support", router: supportRouter, tag: "Support" },
  { base: "/feedback", router: feedbackRouter, tag: "Support" },
  { base: "/media", router: mediaRouter, tag: "Media" },
  { base: "/events", router: eventsRouter, tag: "Analytics" },
  { base: "/marketing", router: marketingRouter, tag: "Marketing" },
  { base: "/webhooks", router: webhooksRouter, tag: "Webhooks" },
  { base: "/admin", router: adminRouter, tag: "Admin" },
];
