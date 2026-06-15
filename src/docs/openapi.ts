import { mounts } from "../routes.js";
import { env } from "../env.js";

/* Express layer typing is loose; introspect the stack pragmatically. */
interface ExpressLayer {
  route?: { path: string; methods: Record<string, boolean> };
}

/** Public (no-bearer) endpoints. Everything else requires auth. */
function isPublic(method: string, path: string): boolean {
  if (path === "/health") return true;
  const publicAuth = /^\/api\/auth\/(register|login|refresh-token|forgot-password|reset-password|check-email|social|verify-email|magic-link|otp)/;
  if (publicAuth.test(path)) return true;
  if (/^\/api\/(system|content|marketing|webhooks)\b/.test(path)) return true;
  // public catalog reads
  if (method === "GET" && /^\/api\/(tutorials|products|brands|search)\b/.test(path)) return true;
  return false;
}

function summarise(method: string, path: string): string {
  const seg = path.replace(/^\/api\//, "").split("/").filter(Boolean);
  const verb = { GET: path.includes("{") ? "Get" : "List", POST: "Create", PUT: "Replace", PATCH: "Update", DELETE: "Delete" }[method] ?? method;
  const last = seg[seg.length - 1] ?? "";
  if (!last.startsWith("{") && method === "GET" && seg.length > 1) return `Get ${last.replace(/-/g, " ")}`;
  return `${verb} ${seg.filter((s) => !s.startsWith("{")).join(" ").replace(/-/g, " ")}`.trim();
}

export function buildOpenApiSpec() {
  const paths: Record<string, Record<string, unknown>> = {};
  const tagsSet = new Set<string>();

  for (const { base, router, tag } of mounts) {
    tagsSet.add(tag);
    const stack = (router as unknown as { stack: ExpressLayer[] }).stack ?? [];
    for (const layer of stack) {
      if (!layer.route) continue;
      const raw = layer.route.path === "/" ? "" : layer.route.path;
      const fullPath = `/api${base}${raw}`;
      const oaPath = fullPath.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
      const params = [...oaPath.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => ({
        name: m[1], in: "path", required: true, schema: { type: "string" },
      }));

      for (const method of Object.keys(layer.route.methods)) {
        const M = method.toUpperCase();
        if (M === "HEAD" || M === "OPTIONS") continue;
        paths[oaPath] ??= {};
        paths[oaPath][method] = {
          tags: [tag],
          summary: summarise(M, oaPath),
          ...(params.length ? { parameters: params } : {}),
          ...(isPublic(M, fullPath) ? {} : { security: [{ bearerAuth: [] }] }),
          ...(["POST", "PUT", "PATCH"].includes(M)
            ? { requestBody: { content: { "application/json": { schema: { type: "object" } } } } }
            : {}),
          responses: {
            "200": { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/Envelope" } } } },
            "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            ...(isPublic(M, fullPath) ? {} : { "401": { description: "Unauthenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } }),
          },
        };
      }
    }
  }

  const tags = [...tagsSet].sort().map((name) => ({ name }));

  return {
    openapi: "3.0.3",
    info: {
      title: "DollFace API",
      version: "1.0.0",
      description:
        "The DollFace beauty platform API. All responses use the envelope `{ success, data }`. " +
        "Authenticate with `POST /api/auth/login` (or `register`), then click **Authorize** and paste the `accessToken`.",
    },
    servers: [{ url: env.PUBLIC_URL, description: env.NODE_ENV }],
    tags,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Envelope: {
          type: "object",
          properties: { success: { type: "boolean", example: true }, data: {} },
          required: ["success"],
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            code: { type: "string" },
            errors: { type: "object", additionalProperties: { type: "string" } },
          },
        },
        Tokens: {
          type: "object",
          properties: { accessToken: { type: "string" }, refreshToken: { type: "string" } },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" }, name: { type: "string" }, email: { type: "string" },
            avatarUrl: { type: "string", nullable: true }, role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  };
}
