import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { sendEmail } from "../providers/email.js";

// ── /support ──────────────────────────────────────────────
export const supportRouter = Router();

supportRouter.post("/contact", asyncHandler(async (req, res) => {
  const { name, email, message } = z.object({ name: z.string().min(1), email: z.string().email(), message: z.string().min(1) }).parse(req.body);
  await sendEmail("hello@dollface.app", `Contact from ${name}`, `${email}\n\n${message}`);
  ok(res, { received: true });
}));

supportRouter.get("/tickets", requireAuth, asyncHandler(async (req, res) => {
  const tickets = await prisma.supportTicket.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, tickets.map((t) => ({ id: t.id, subject: t.subject, status: t.status, createdAt: t.createdAt.toISOString() })));
}));

supportRouter.post("/tickets", requireAuth, asyncHandler(async (req, res) => {
  const { subject, message } = z.object({ subject: z.string().min(1), message: z.string().min(1) }).parse(req.body);
  const ticket = await prisma.supportTicket.create({
    data: { userId: authUserId(req), subject, messages: { create: { userId: authUserId(req), body: message } } },
  });
  ok(res, { id: ticket.id, subject: ticket.subject, status: ticket.status }, 201);
}));

supportRouter.get("/tickets/:id", requireAuth, asyncHandler(async (req, res) => {
  const ticket = await prisma.supportTicket.findFirst({ where: { id: req.params.id, userId: authUserId(req) }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!ticket) throw new AppError(404, "Ticket not found", "NOT_FOUND");
  ok(res, {
    id: ticket.id, subject: ticket.subject, status: ticket.status, createdAt: ticket.createdAt.toISOString(),
    messages: ticket.messages.map((m) => ({ id: m.id, body: m.body, mine: m.userId === req.userId, createdAt: m.createdAt.toISOString() })),
  });
}));

supportRouter.post("/tickets/:id/messages", requireAuth, asyncHandler(async (req, res) => {
  const ticket = await prisma.supportTicket.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!ticket) throw new AppError(404, "Ticket not found", "NOT_FOUND");
  const body = String(req.body?.body ?? "").trim();
  if (!body) throw new AppError(400, "Message cannot be empty", "EMPTY");
  const msg = await prisma.ticketMessage.create({ data: { ticketId: ticket.id, userId: authUserId(req), body } });
  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: "PENDING" } });
  ok(res, { id: msg.id, body: msg.body, createdAt: msg.createdAt.toISOString() }, 201);
}));

// ── /feedback ─────────────────────────────────────────────
export const feedbackRouter = Router();

feedbackRouter.post("/", asyncHandler(async (req, res) => {
  const message = String(req.body?.message ?? "").trim();
  if (!message) throw new AppError(400, "Message cannot be empty", "EMPTY");
  await prisma.feedback.create({ data: { userId: req.userId ?? null, kind: "general", message } });
  ok(res, { received: true }, 201);
}));

feedbackRouter.post("/bug", asyncHandler(async (req, res) => {
  await prisma.feedback.create({ data: { userId: req.userId ?? null, kind: "bug", message: String(req.body?.message ?? "Bug report"), meta: req.body?.logs ?? undefined } });
  ok(res, { received: true }, 201);
}));

feedbackRouter.post("/rating", asyncHandler(async (req, res) => {
  await prisma.feedback.create({ data: { userId: req.userId ?? null, kind: "rating", message: String(req.body?.rating ?? ""), meta: req.body ?? undefined } });
  ok(res, { received: true }, 201);
}));
