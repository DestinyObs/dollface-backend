import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT ?? 4200;

app.use(cors());
app.use(express.json());

// Health check (used by load balancers / uptime monitors)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dollface-backend", time: new Date().toISOString() });
});

// API routes — base path matches the mobile app's `EXPO_PUBLIC_API_URL` (.../api)
app.use("/api/auth", authRouter);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));

app.listen(PORT, () => {
  console.log(`DollFace API listening on http://localhost:${PORT}`);
});
