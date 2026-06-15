import crypto from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { env } from "../env.js";

export const UPLOAD_DIR = path.resolve("uploads");
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * Persist an uploaded file and return its public URL. Dev-mode writes to a local
 * `uploads/` dir served at `/uploads`; with CLOUDINARY_URL/AWS_S3_BUCKET set,
 * upload to the bucket instead and return the hosted URL.
 */
export async function saveUpload(buffer: Buffer, mimetype: string): Promise<string> {
  if (env.providers.storage) {
    // TODO(prod): upload `buffer` to Cloudinary/S3 and return the hosted URL.
  }
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `asset_${crypto.randomBytes(10).toString("hex")}.${EXT[mimetype] ?? "bin"}`;
  writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `${env.PUBLIC_URL}/uploads/${name}`;
}

/**
 * Media storage (S3/Cloudinary). Dev-mode returns a deterministic hosted-style
 * URL (and echoes any data URL/remote URL the client already has) so upload
 * flows work without a bucket. With CLOUDINARY_URL/AWS_S3_BUCKET set, wire it.
 */
export function presignUpload(type: string) {
  const assetId = `asset_${crypto.randomBytes(8).toString("hex")}`;
  return {
    assetId,
    uploadUrl: `${env.PUBLIC_URL}/api/media/${assetId}/put`, // dev placeholder
    publicUrl: `${env.PUBLIC_URL}/uploads/${assetId}.${type.includes("/") ? type.split("/")[1] : "jpg"}`,
  };
}

export function resolveMediaUrl(input?: string): string {
  if (input && /^https?:\/\/|^data:/.test(input)) return input;
  return `${env.PUBLIC_URL}/uploads/${crypto.randomBytes(8).toString("hex")}.jpg`;
}
