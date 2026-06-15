import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { requireAuth, authUserId } from "../middleware/auth.js";
import { sendPush } from "../providers/push.js";

export const devicesRouter = Router();
devicesRouter.use(requireAuth);

const registerSchema = z.object({
  expoPushToken: z.string().min(1).optional(),
  token: z.string().min(1).optional(),
  platform: z.enum(["ios", "android", "web"]),
  appVersion: z.string().optional(),
}).refine((d) => d.expoPushToken || d.token, { message: "token required" });

devicesRouter.post("/", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const body = registerSchema.parse(req.body);
  const token = (body.expoPushToken ?? body.token)!;
  const device = await prisma.device.upsert({
    where: { token },
    create: { userId, token, platform: body.platform, appVersion: body.appVersion },
    update: { userId, platform: body.platform, appVersion: body.appVersion },
  });
  ok(res, { id: device.id, registered: true }, 201);
}));

devicesRouter.delete("/:token", asyncHandler(async (req, res) => {
  await prisma.device.deleteMany({ where: { token: req.params.token, userId: authUserId(req) } });
  ok(res, { unregistered: true });
}));

devicesRouter.post("/test-push", asyncHandler(async (req, res) => {
  const tokens = (await prisma.device.findMany({ where: { userId: authUserId(req) }, select: { token: true } })).map((d) => d.token);
  await sendPush(tokens, "DollFace", "This is a test notification 💄");
  ok(res, { sent: tokens.length });
}));
