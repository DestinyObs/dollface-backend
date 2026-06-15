import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

/**
 * Responses intentionally mirror the shape the mobile app already expects
 * (see dollface-mobile/lib/mockApi.ts):
 *   { success: true, data: { user, tokens } }
 * Swapping the app's mock for this API only requires setting EXPO_PUBLIC_API_URL.
 *
 * NOTE: this is a skeleton — replace the in-memory store with a real DB
 * (Postgres/Prisma) and hash passwords (bcrypt/argon2) before production.
 */

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}
const users: User[] = [];

const tokensFor = (id: string) => ({
  accessToken: jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ sub: id, t: "refresh" }, JWT_SECRET, { expiresIn: "30d" }),
});

const publicUser = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: "USER", createdAt: u.createdAt });

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid input" });
  const { name, email, password } = parsed.data;

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, message: "An account with this email already exists." });
  }
  const user: User = { id: `u_${Date.now()}`, name, email, password, createdAt: new Date().toISOString() };
  users.push(user);
  res.status(201).json({ success: true, data: { user: publicUser(user), tokens: tokensFor(user.id) } });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid input" });
  const { email, password } = parsed.data;

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Incorrect email or password." });
  }
  res.json({ success: true, data: { user: publicUser(user), tokens: tokensFor(user.id) } });
});

authRouter.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body ?? {};
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { sub: string };
    res.json({ success: true, data: { accessToken: jwt.sign({ sub: payload.sub }, JWT_SECRET, { expiresIn: "15m" }) } });
  } catch {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
});
