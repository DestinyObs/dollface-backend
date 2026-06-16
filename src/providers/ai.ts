import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";
import {
  SAMPLE_TONE, SAMPLE_MATCH_ITEMS, SAMPLE_MATCH_HEADLINE, SAMPLE_RECREATION,
} from "../lib/samples.js";

/**
 * Real AI vision for shade matching and look recreation.
 *
 * Multi-key failover: ANTHROPIC_API_KEYS holds one or more comma-separated keys.
 * We try them in order — on auth/rate-limit/quota/5xx we advance to the next key,
 * so a single dead or throttled key never takes the feature down. When no key is
 * configured the callers fall back to deterministic sample analysis, so the app
 * keeps working (clearly flagged via `source: "sample"`).
 */

export const aiConfigured = () => env.anthropicKeys.length > 0;

const clients = env.anthropicKeys.map((apiKey) => new Anthropic({ apiKey, maxRetries: 0 }));

type ImageInput = { buffer: Buffer; mimetype: string };

const RETRYABLE = new Set([401, 403, 429, 500, 502, 503, 529]);

/** Run a vision prompt, returning parsed JSON, failing over across keys. */
async function visionJSON<T>(image: ImageInput, system: string, instruction: string): Promise<T> {
  if (!clients.length) throw new Error("AI_NOT_CONFIGURED");
  const media = (image.mimetype || "image/jpeg").toLowerCase();
  const mediaType = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(media) ? media : "image/jpeg";
  const base64 = image.buffer.toString("base64");

  let lastErr: unknown;
  for (let i = 0; i < clients.length; i++) {
    try {
      const msg = await clients[i].messages.create({
        model: env.ANTHROPIC_VISION_MODEL,
        max_tokens: 1500,
        system,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as any, data: base64 } },
            { type: "text", text: `${instruction}\n\nRespond with ONLY valid minified JSON — no prose, no markdown fences.` },
          ],
        }],
      });
      const text = msg.content.filter((b) => b.type === "text").map((b: any) => b.text).join("").trim();
      return parseJSON<T>(text);
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      const keyLabel = `key#${i + 1}/${clients.length}`;
      if (status && RETRYABLE.has(status) && i < clients.length - 1) {
        logger.warn({ status, keyLabel }, "AI key failed, failing over to next key");
        continue;
      }
      // non-retryable, or last key exhausted
      logger.error({ status, keyLabel, err: err?.message }, "AI vision request failed");
      throw err;
    }
  }
  throw lastErr ?? new Error("AI_ALL_KEYS_FAILED");
}

/** Tolerant JSON parse — strips accidental markdown fences / leading text. */
function parseJSON<T>(raw: string): T {
  let s = raw.trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first > 0 || last < s.length - 1) s = s.slice(first, last + 1);
  return JSON.parse(s) as T;
}

// ── Shade match from a selfie ───────────────────────────────────────────────

export type ShadeAnalysis = {
  tone: { label: string; hex: string; confidence: string };
  headline: { name: string; brand: string; pct: string; color: string };
  items: typeof SAMPLE_MATCH_ITEMS;
  source: "ai" | "sample";
};

const SHADE_SYSTEM =
  "You are a professional makeup artist and colour-matching expert for an inclusive beauty app. " +
  "You analyse a selfie to determine skin tone, undertone and the best-matched foundation/concealer shades across real, widely-available brands (Fenty Beauty, MAC, NARS, NYX, Charlotte Tilbury, Maybelline, etc.). " +
  "Be accurate and inclusive across the full range of skin tones. Never refuse; give your best professional estimate.";

const SHADE_INSTRUCTION = `Analyse the person's skin in this selfie and return JSON exactly matching this TypeScript shape:
{
  "tone": { "label": string /* e.g. "Medium Tan · Warm Golden" */, "hex": string /* skin hex */, "confidence": string /* e.g. "High confidence match" */ },
  "headline": { "name": string /* best foundation shade name */, "brand": string, "pct": string /* e.g. "92%" */, "color": string /* hex */ },
  "items": [
    {
      "category": "Foundation" | "Concealer" | "Powder",
      "confidence": "High" | "Medium",
      "matchedShade": string, "brand": string, "product": string, "hex": string,
      "reason": string,
      "alternatives": [ { "brand": string, "product": string, "shade": string, "hex": string, "price": string /* e.g. "£29" */ } ]
    }
  ]
}
Return at least a Foundation and a Concealer item, each with 1-2 alternatives from different brands.`;

export async function analyzeSelfie(image: ImageInput): Promise<ShadeAnalysis> {
  if (!aiConfigured()) {
    return { tone: SAMPLE_TONE, headline: SAMPLE_MATCH_HEADLINE, items: SAMPLE_MATCH_ITEMS, source: "sample" };
  }
  try {
    const r = await visionJSON<Omit<ShadeAnalysis, "source">>(image, SHADE_SYSTEM, SHADE_INSTRUCTION);
    return { ...r, source: "ai" };
  } catch (err: any) {
    logger.error({ err: err?.message }, "analyzeSelfie failed — using sample fallback");
    return { tone: SAMPLE_TONE, headline: SAMPLE_MATCH_HEADLINE, items: SAMPLE_MATCH_ITEMS, source: "sample" };
  }
}

// ── Look recreation from an inspiration photo ───────────────────────────────

export type RecreationAnalysis = {
  versions: string[];
  aiNote: string;
  sections: typeof SAMPLE_RECREATION.sections;
  source: "ai" | "sample";
};

const RECREATE_SYSTEM =
  "You are a professional makeup artist. You analyse an inspiration photo of a makeup look and break it down into a step-by-step recreation with real, purchasable products across common brands. Be specific and practical.";

const RECREATE_INSTRUCTION = `Break down the makeup look in this photo. Return JSON exactly matching:
{
  "versions": ["Your Version", "Beginner", "Budget"],
  "aiNote": string /* one sentence on how it's adapted to the user */,
  "sections": [
    {
      "area": "BASE" | "BROWS" | "EYES" | "CHEEKS" | "LIPS",
      "icon": "sparkles-outline" | "pencil-outline" | "eye-outline" | "flower-outline" | "heart-outline",
      "label": string, "description": string, "technique": string,
      "products": [ { "name": string, "brand": string, "shade": string, "price": string /* e.g. "£34" */ } ]
    }
  ]
}
Cover BASE, BROWS, EYES, CHEEKS and LIPS with the matching icon for each.`;

export async function analyzeRecreation(image: ImageInput): Promise<RecreationAnalysis> {
  if (!aiConfigured()) {
    return { ...SAMPLE_RECREATION, source: "sample" };
  }
  try {
    const r = await visionJSON<Omit<RecreationAnalysis, "source">>(image, RECREATE_SYSTEM, RECREATE_INSTRUCTION);
    return { ...r, source: "ai" };
  } catch (err: any) {
    logger.error({ err: err?.message }, "analyzeRecreation failed — using sample fallback");
    return { ...SAMPLE_RECREATION, source: "sample" };
  }
}
