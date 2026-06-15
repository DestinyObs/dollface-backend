import { Router } from "express";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";

export const contentRouter = Router();

const UPDATED = "2026-06-01";

contentRouter.get("/banners", asyncHandler(async (req, res) => {
  const placement = req.query.placement ? String(req.query.placement) : undefined;
  const banners = await prisma.banner.findMany({ where: { active: true, ...(placement ? { placement } : {}) }, orderBy: { order: "asc" } });
  ok(res, banners.map((b) => ({ id: b.id, placement: b.placement, title: b.title, img: b.img, route: b.route ?? undefined })));
}));

contentRouter.get("/collections", asyncHandler(async (_req, res) => {
  const collections = await prisma.collection.findMany({ where: { kind: "editorial" }, orderBy: { order: "asc" } });
  ok(res, collections.map((c) => ({ id: c.id, title: c.title, items: c.items })));
}));

contentRouter.get("/articles", asyncHandler(async (_req, res) => {
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" }, take: 20 });
  ok(res, articles.map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, cover: a.cover ?? undefined, publishedAt: a.publishedAt.toISOString() })));
}));

contentRouter.get("/articles/:slug", asyncHandler(async (req, res) => {
  const a = await prisma.article.findUnique({ where: { slug: req.params.slug } });
  if (!a) throw new AppError(404, "Article not found", "NOT_FOUND");
  ok(res, { slug: a.slug, title: a.title, excerpt: a.excerpt, body: a.body, cover: a.cover ?? undefined, publishedAt: a.publishedAt.toISOString() });
}));

contentRouter.get("/faq", asyncHandler(async (_req, res) => {
  ok(res, [
    { q: "How does shade matching work?", a: "Our AI reads your skin tone, undertone and surface colour from a selfie, then matches it across hundreds of products." },
    { q: "Is DollFace free?", a: "Yes — core features are free. DollFace Pro unlocks unlimited matches, recreations and the full tutorial library." },
    { q: "Are my photos stored?", a: "Only if you allow scan storage in Settings. You can delete your data any time." },
    { q: "Which brands are included?", a: "We cover a wide, inclusive range across drugstore and luxury brands, and add more regularly." },
  ]);
}));

contentRouter.get("/help", asyncHandler(async (_req, res) => {
  ok(res, [
    { title: "Getting started", body: "Create an account, complete your beauty profile, and run your first shade match." },
    { title: "Managing your subscription", body: "Open Profile → Subscription to upgrade, cancel or restore DollFace Pro." },
    { title: "Orders & returns", body: "Track orders from Profile → Orders. Start a return within 30 days of delivery." },
  ]);
}));

contentRouter.get("/glossary", asyncHandler(async (_req, res) => {
  ok(res, [
    { term: "Undertone", definition: "The subtle hue beneath your skin's surface — cool, warm, neutral or olive." },
    { term: "Cut-crease", definition: "An eye technique with a sharp line carved into the crease for contrast." },
    { term: "Baking", definition: "Letting setting powder sit on the skin to set foundation before dusting away." },
  ]);
}));

contentRouter.get("/whats-new", asyncHandler(async (_req, res) => {
  ok(res, [
    { version: "1.0.0", date: UPDATED, notes: ["AI shade matching", "Look recreation", "Tutorials & shop", "DollFace Pro"] },
  ]);
}));

contentRouter.get("/terms", asyncHandler(async (_req, res) => {
  ok(res, {
    title: "Terms of Service",
    updatedAt: UPDATED,
    sections: [
      { heading: "Using DollFace", body: "DollFace provides personalised beauty recommendations, tutorials and shopping. You're responsible for keeping your account secure and for the activity under it." },
      { heading: "Your content", body: "Photos you upload for shade matching and look recreation are processed to generate recommendations. You own your content; you grant us a licence to process it to provide the service." },
      { heading: "Purchases & subscriptions", body: "Paid plans renew automatically until cancelled. Prices are shown before purchase and may vary by region." },
      { heading: "Acceptable use", body: "Don't misuse the service, attempt to disrupt it, or upload content you don't have the rights to." },
    ],
  });
}));

contentRouter.get("/privacy", asyncHandler(async (_req, res) => {
  ok(res, {
    title: "Privacy Policy",
    updatedAt: UPDATED,
    sections: [
      { heading: "What we collect", body: "Account details, your beauty profile, and the photos you submit for analysis. We collect usage data to improve recommendations." },
      { heading: "How we use it", body: "To personalise shade matches, tutorials and product picks, and to operate and improve DollFace." },
      { heading: "Your photos", body: "Selfies and inspiration images are used to generate your results. You can disable scan storage in Settings and delete your data at any time." },
      { heading: "Your rights", body: "You can access, export or delete your data from Settings, or by contacting hello@dollface.app." },
    ],
  });
}));
