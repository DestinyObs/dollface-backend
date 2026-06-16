import { env } from "../env.js";
import { logger } from "../lib/logger.js";

/**
 * Push notifications via the Expo Push service. Real Expo push tokens are
 * delivered through expo-server-sdk (EXPO_ACCESS_TOKEN improves reliability /
 * rate limits but isn't strictly required). Non-Expo or empty token lists are
 * logged in dev so notification flows are testable without devices.
 */
export async function sendPush(tokens: string[], title: string, body: string): Promise<void> {
  if (!tokens.length) return;

  const { Expo } = await import("expo-server-sdk");
  const valid = tokens.filter((t) => Expo.isExpoPushToken(t));
  if (!valid.length) {
    logger.info({ count: tokens.length }, `[push:dev] ${title} — ${body}`);
    return;
  }

  const expo = new Expo(env.EXPO_ACCESS_TOKEN ? { accessToken: env.EXPO_ACCESS_TOKEN } : {});
  const messages = valid.map((to) => ({ to, sound: "default" as const, title, body }));
  try {
    for (const chunk of expo.chunkPushNotifications(messages)) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    logger.info({ count: valid.length, title }, "push sent");
  } catch (err: any) {
    logger.error({ err: err?.message }, "push send failed");
  }
}
