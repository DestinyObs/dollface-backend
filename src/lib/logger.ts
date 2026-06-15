import pino from "pino";
import { env } from "../env.js";

/** Structured logger. Pretty in dev, JSON in prod (ship to your log platform). */
export const logger = pino({
  level: env.isProd ? "info" : "debug",
  ...(env.isProd
    ? {}
    : { transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" } } }),
});
