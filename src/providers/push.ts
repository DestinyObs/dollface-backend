import { env } from "../env.js";

/**
 * Push notifications (Expo). With EXPO_ACCESS_TOKEN set, send via the Expo Push
 * API; dev-mode logs instead so notification flows work without it.
 */
export async function sendPush(tokens: string[], title: string, body: string): Promise<void> {
  if (!tokens.length) return;
  if (env.providers.push) {
    // TODO(prod): POST https://exp.host/--/api/v2/push/send with expo-server-sdk
    console.log(`[push] → ${tokens.length} device(s): ${title}`);
    return;
  }
  console.log(`[push:dev] → ${tokens.length} device(s): ${title} — ${body}`);
}
