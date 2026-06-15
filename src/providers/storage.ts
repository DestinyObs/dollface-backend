import crypto from "node:crypto";
import { env } from "../env.js";

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
