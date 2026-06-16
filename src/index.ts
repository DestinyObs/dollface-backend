import { createApp } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { logger } from "./lib/logger.js";
import { initSentry } from "./lib/sentry.js";

await initSentry();
const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`DollFace API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully…`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
