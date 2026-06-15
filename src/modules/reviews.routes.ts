import { Router } from "express";
import { z } from "zod";
import type { Review, Question } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

const presentReview = (r: Review & { user?: { name: string } }) => ({
  id: r.id, author: r.user?.name ?? "DollFace user", rating: r.rating, title: r.title ?? undefined,
  body: r.body, photos: r.photos, helpfulCount: r.helpfulCount, createdAt: r.createdAt.toISOString(),
});
const presentQuestion = (q: Question & { user?: { name: string }; answers?: { id: string; body: string; createdAt: Date }[] }) => ({
  id: q.id, author: q.user?.name ?? "DollFace user", body: q.body, createdAt: q.createdAt.toISOString(),
  answers: (q.answers ?? []).map((a) => ({ id: a.id, body: a.body, createdAt: a.createdAt.toISOString() })),
});

/** Recompute a product's rating + reviewCount from its reviews. */
async function refreshProductRating(productId: string) {
  const agg = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ? agg._avg.rating.toFixed(1) : "0.0",
      reviewCount: `${agg._count} review${agg._count === 1 ? "" : "s"}`,
    },
  });
}

// ── mounted at /products ──────────────────────────────────
export const productReviewsRouter = Router();

productReviewsRouter.get("/:id/reviews", asyncHandler(async (req, res) => {
  const sort = String(req.query.sort ?? "recent");
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.id }, include: { user: { select: { name: true } } },
    orderBy: sort === "helpful" ? { helpfulCount: "desc" } : { createdAt: "desc" },
  });
  ok(res, reviews.map(presentReview));
}));

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(2000),
  photos: z.array(z.string()).optional(),
});

productReviewsRouter.post("/:id/reviews", requireAuth, asyncHandler(async (req, res) => {
  const data = reviewSchema.parse(req.body);
  const review = await prisma.review.create({
    data: { productId: req.params.id, userId: authUserId(req), rating: data.rating, title: data.title ?? null, body: data.body, photos: data.photos ?? [] },
    include: { user: { select: { name: true } } },
  });
  await refreshProductRating(req.params.id);
  ok(res, presentReview(review), 201);
}));

productReviewsRouter.get("/:id/questions", asyncHandler(async (req, res) => {
  const questions = await prisma.question.findMany({
    where: { productId: req.params.id }, include: { user: { select: { name: true } }, answers: true }, orderBy: { createdAt: "desc" },
  });
  ok(res, questions.map(presentQuestion));
}));

productReviewsRouter.post("/:id/questions", requireAuth, asyncHandler(async (req, res) => {
  const body = String(req.body?.body ?? "").trim();
  if (!body) throw new AppError(400, "Question cannot be empty", "EMPTY");
  const q = await prisma.question.create({ data: { productId: req.params.id, userId: authUserId(req), body }, include: { user: { select: { name: true } }, answers: true } });
  ok(res, presentQuestion(q), 201);
}));

// ── mounted at /reviews ───────────────────────────────────
export const reviewActionsRouter = Router();

reviewActionsRouter.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const data = reviewSchema.partial().parse(req.body);
  const result = await prisma.review.updateMany({ where: { id: req.params.id, userId: authUserId(req) }, data });
  if (result.count === 0) throw new AppError(404, "Review not found", "NOT_FOUND");
  const review = await prisma.review.findUniqueOrThrow({ where: { id: req.params.id }, include: { user: { select: { name: true } } } });
  await refreshProductRating(review.productId);
  ok(res, presentReview(review));
}));

reviewActionsRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const review = await prisma.review.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!review) throw new AppError(404, "Review not found", "NOT_FOUND");
  await prisma.review.delete({ where: { id: review.id } });
  await refreshProductRating(review.productId);
  ok(res, { removed: true });
}));

reviewActionsRouter.post("/:id/helpful", requireAuth, asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const existing = await prisma.reviewVote.findUnique({ where: { userId_reviewId: { userId, reviewId: req.params.id } } });
  if (existing) return ok(res, { helpful: true });
  await prisma.$transaction([
    prisma.reviewVote.create({ data: { userId, reviewId: req.params.id } }),
    prisma.review.update({ where: { id: req.params.id }, data: { helpfulCount: { increment: 1 } } }),
  ]);
  ok(res, { helpful: true });
}));

reviewActionsRouter.post("/:id/report", requireAuth, asyncHandler(async (_req, res) => {
  ok(res, { reported: true });
}));

// ── mounted at /questions ─────────────────────────────────
export const questionsRouter = Router();

questionsRouter.post("/:id/answers", requireAuth, asyncHandler(async (req, res) => {
  const body = String(req.body?.body ?? "").trim();
  if (!body) throw new AppError(400, "Answer cannot be empty", "EMPTY");
  const a = await prisma.answer.create({ data: { questionId: req.params.id, userId: authUserId(req), body } });
  ok(res, { id: a.id, body: a.body, createdAt: a.createdAt.toISOString() }, 201);
}));
