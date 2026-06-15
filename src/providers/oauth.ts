import crypto from "node:crypto";
import { env } from "../env.js";

export interface OAuthProfile {
  email: string;
  name: string;
  providerId: string;
}

/** Best-effort decode of a JWT payload (no signature check) — dev only. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Verify a Google/Apple identity token and return a normalised profile.
 * Dev-mode trusts the token's payload (or synthesises one) so social login works
 * without OAuth credentials. With GOOGLE_CLIENT_ID/APPLE_CLIENT_ID set, verify
 * the signature + audience properly in the marked spot.
 */
export async function verifyOAuthToken(provider: "google" | "apple", idToken: string): Promise<OAuthProfile> {
  const live = provider === "google" ? env.providers.googleAuth : env.providers.appleAuth;
  if (live) {
    // TODO(prod): verify signature + aud with google-auth-library / apple-signin
  }
  const payload = decodeJwtPayload(idToken);
  const email = (payload?.email as string) || `${provider}_${crypto.createHash("sha1").update(idToken).digest("hex").slice(0, 10)}@dollface.dev`;
  const name = (payload?.name as string) || (payload?.given_name as string) || email.split("@")[0];
  const providerId = (payload?.sub as string) || crypto.createHash("sha1").update(idToken).digest("hex");
  return { email: email.toLowerCase(), name, providerId };
}
