import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { presentRoutine } from "../lib/presenters.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const routinesRouter = Router();
routinesRouter.use(requireAuth);

routinesRouter.get("/", asyncHandler(async (req, res) => {
  const items = await prisma.routine.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "asc" } });
  ok(res, items.map(presentRoutine));
}));

const routineSchema = z.object({
  name: z.string().min(1),
  time: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
});

routinesRouter.post("/", asyncHandler(async (req, res) => {
  const data = routineSchema.parse(req.body);
  const routine = await prisma.routine.create({ data: { userId: authUserId(req), ...data } });
  ok(res, presentRoutine(routine), 201);
}));

routinesRouter.get("/:id", asyncHandler(async (req, res) => {
  const routine = await prisma.routine.findFirst({ where: { id: req.params.id, userId: authUserId(req) } });
  if (!routine) throw new AppError(404, "Routine not found", "NOT_FOUND");
  ok(res, presentRoutine(routine));
}));

routinesRouter.patch("/:id", asyncHandler(async (req, res) => {
  const data = routineSchema.partial().parse(req.body);
  const result = await prisma.routine.updateMany({ where: { id: req.params.id, userId: authUserId(req) }, data });
  if (result.count === 0) throw new AppError(404, "Routine not found", "NOT_FOUND");
  const routine = await prisma.routine.findUniqueOrThrow({ where: { id: req.params.id } });
  ok(res, presentRoutine(routine));
}));

routinesRouter.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.routine.deleteMany({ where: { id: req.params.id, userId: authUserId(req) } });
  ok(res, { removed: true });
}));
