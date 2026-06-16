# DollFace — Full Stack Setup

Three apps: **backend** (Node/Express + Postgres + Prisma), **mobile** (Expo/React Native), **web** (Next.js marketing site). Everything talks to the real backend — there is no mock.

## 1. Backend (`dollface-backend`)

```bash
cd dollface-backend
npm install
cp .env.example .env            # then fill the required values below
docker compose up -d            # Postgres (container: dollface-postgres)
npx prisma migrate deploy       # apply schema
npx prisma db seed              # admin@dollface.app / demo@dollface.app (password123) + catalogue
npm run dev                     # http://localhost:4200  (Swagger: /api/docs)
```

Required `.env`: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (any 8+ char strings for dev).

Useful:
- `npm test` — 51 endpoint/integration tests
- `npm run transcript` — live request/response transcript of every endpoint → `ENDPOINT_TRANSCRIPT.md` (run with `DISABLE_RATE_LIMIT=1 npm run dev` alongside)

## 2. Mobile (`dollface-mobile`)

```bash
cd dollface-mobile
npm install
cp .env.example .env            # EXPO_PUBLIC_API_URL defaults to localhost:4200/api
npm run start                   # Expo — press i / a / w
```

- **Simulator / web on this Mac:** keep `EXPO_PUBLIC_API_URL=http://localhost:4200/api`.
- **Physical phone (Expo Go, same Wi-Fi):** set it to your Mac's LAN IP, e.g. `http://192.168.18.3:4200/api`.
- **Standalone builds / push:** run `eas init` (fills `app.json` → `extra.eas.projectId`), then `eas build` using the profiles in `eas.json`.

## 3. Web (`dollface-web`)

```bash
cd dollface-web
npm install
cp .env.example .env            # NEXT_PUBLIC_API_URL defaults to localhost:4200/api
npm run dev                     # http://localhost:4100
npm run e2e                     # Playwright happy-path (needs `npm run e2e:install` once)
```

## 4. Integration keys — each goes REAL the moment it's set (graceful fallback otherwise)

All live in `dollface-backend/.env` unless noted. None are required to run; the app works end-to-end without them and each key flips one integration from dev-fallback to real.

| Capability | Key(s) | Without it |
|---|---|---|
| **AI shade match + look recreation** | `ANTHROPIC_API_KEYS` (1+, comma-separated, failover) · `ANTHROPIC_VISION_MODEL` (default haiku) | sample analysis flagged `source:"sample"` |
| Payments | `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` | deterministic dev intents |
| Email (password reset, etc.) | `RESEND_API_KEY` **or** `SMTP_URL` · `EMAIL_FROM` | logged, not sent |
| Push notifications | `EXPO_ACCESS_TOKEN` (+ EAS projectId + device) | logged |
| Media storage | `CLOUDINARY_URL` **or** `AWS_S3_BUCKET`+`AWS_REGION` | local `uploads/` dir |
| Social login (Google) | `GOOGLE_CLIENT_ID` | token payload decode |
| Error tracking (backend) | `SENTRY_DSN` | console/pino only |
| Error tracking (mobile) | `EXPO_PUBLIC_SENTRY_DSN` (in mobile `.env`) | console only |

### Enable real AI (the main one)
```bash
# dollface-backend/.env
ANTHROPIC_API_KEYS=sk-ant-key1,sk-ant-key2     # 2-3 keys → automatic failover
```
Restart the backend; `/match/selfie`, `/match/manual` and `/recreate/upload` now return real analysis (`source:"ai"`).

## 5. Going-live checklist

- [ ] Provision the keys above for the integrations you need
- [ ] Deploy the backend + managed Postgres (`render.yaml` blueprint included) and point `EXPO_PUBLIC_API_URL` / `NEXT_PUBLIC_API_URL` at it
- [ ] `eas init` + `eas build` for the mobile app (sets the push projectId)
- [ ] Deploy the web app (Vercel/Netlify) with `NEXT_PUBLIC_API_URL` set
