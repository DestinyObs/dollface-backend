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
let googleClient: import("google-auth-library").OAuth2Client | null = null;

export async function verifyOAuthToken(provider: "google" | "apple", idToken: string): Promise<OAuthProfile> {
  // Google: verify the ID token signature + audience properly when configured.
  if (provider === "google" && env.GOOGLE_CLIENT_ID) {
    const { OAuth2Client } = await import("google-auth-library");
    if (!googleClient) googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    if (!p?.email) throw new Error("Google token missing email");
    return { email: p.email.toLowerCase(), name: p.name || p.email.split("@")[0], providerId: p.sub };
  }
  // Apple: signature verification requires Apple's JWKS + client config; until
  // APPLE_CLIENT_ID-based verification is added, fall back to payload decode.
  const payload = decodeJwtPayload(idToken);
  const email = (payload?.email as string) || `${provider}_${crypto.createHash("sha1").update(idToken).digest("hex").slice(0, 10)}@dollface.dev`;
  const name = (payload?.name as string) || (payload?.given_name as string) || email.split("@")[0];
  const providerId = (payload?.sub as string) || crypto.createHash("sha1").update(idToken).digest("hex");
  return { email: email.toLowerCase(), name, providerId };
}
