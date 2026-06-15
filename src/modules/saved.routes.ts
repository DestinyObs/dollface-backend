import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

/** Saved looks (snapshots). Saved tutorials/products live under their own routers. */
export const savedRouter = Router();
savedRouter.use(requireAuth);

savedRouter.get("/looks", asyncHandler(async (req, res) => {
  const looks = await prisma.savedLook.findMany({ where: { userId: authUserId(req) }, orderBy: { createdAt: "desc" } });
  ok(res, looks.map((l) => ({ id: l.lookId, title: l.title, subtitle: l.subtitle ?? undefined, img: l.img ?? undefined })));
}));

const saveLookSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  img: z.string().optional(),
});

savedRouter.post("/looks", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const body = saveLookSchema.parse(req.body);
  const look = await prisma.savedLook.upsert({
    where: { userId_lookId: { userId, lookId: body.id } },
    create: { userId, lookId: body.id, title: body.title, subtitle: body.subtitle ?? null, img: body.img ?? null },
    update: { title: body.title, subtitle: body.subtitle ?? null, img: body.img ?? null },
  });
  ok(res, { id: look.lookId, title: look.title, subtitle: look.subtitle ?? undefined, img: look.img ?? undefined }, 201);
}));

savedRouter.delete("/looks/:id", asyncHandler(async (req, res) => {
  await prisma.savedLook.deleteMany({ where: { userId: authUserId(req), lookId: req.params.id } });
  ok(res, { removed: true });
}));
