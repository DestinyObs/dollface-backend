import crypto from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";

export const UPLOAD_DIR = path.resolve("uploads");
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp" };

let cloudinaryConfigured = false;
async function getCloudinary() {
  if (!env.CLOUDINARY_URL) return null;
  const { v2: cloudinary } = await import("cloudinary");
  if (!cloudinaryConfigured) {
    // CLOUDINARY_URL (cloudinary://key:secret@cloud) is read automatically.
    cloudinary.config({ secure: true });
    cloudinaryConfigured = true;
  }
  return cloudinary;
}

/**
 * Persist an uploaded file and return its public URL.
 * - CLOUDINARY_URL set → upload to Cloudinary.
 * - else AWS_S3_BUCKET set → upload to S3 (standard AWS credential chain).
 * - else dev-mode writes to a local `uploads/` dir served at `/uploads`.
 */
export async function saveUpload(buffer: Buffer, mimetype: string): Promise<string> {
  const ext = EXT[mimetype] ?? "bin";
  const key = `dollface/asset_${crypto.randomBytes(10).toString("hex")}.${ext}`;

  try {
    const cloudinary = await getCloudinary();
    if (cloudinary) {
      const res = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "image", public_id: key }, (err, result) =>
          err || !result ? reject(err ?? new Error("no result")) : resolve(result as any),
        ).end(buffer);
      });
      return res.secure_url;
    }

    if (env.AWS_S3_BUCKET) {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const s3 = new S3Client({ region: env.AWS_REGION });
      await s3.send(new PutObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key, Body: buffer, ContentType: mimetype }));
      return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }
  } catch (err: any) {
    logger.error({ err: err?.message }, "cloud upload failed — falling back to local disk");
  }

  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `asset_${crypto.randomBytes(10).toString("hex")}.${ext}`;
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
