import { createApp } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./db.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`DollFace API listening on http://localhost:${env.PORT}  (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
