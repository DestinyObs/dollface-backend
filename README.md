# DollFace API

The backend for the **DollFace** beauty app — auth, beauty profiles, AI shade
matching, look recreation, tutorials, full commerce (cart → checkout → orders →
payments), subscriptions, reviews, search, support, CMS, analytics and admin.

**Stack:** Node.js + Express + TypeScript · Prisma + PostgreSQL · JWT (access +
refresh rotation) · Argon2 · Zod · Helmet · rate limiting.

Responses use the envelope the app expects — `{ success, data }` — so the mobile
app switches from its built-in mock to this API just by setting
`EXPO_PUBLIC_API_URL=http://localhost:4200/api`.

The **entire** API surface (~255 handlers across all phases of
[`API_SPEC.md`](./API_SPEC.md)) is implemented and works end-to-end **with no
external accounts** — every third-party integration has a dev-mode fallback (see
[“What needs your keys”](#what-needs-your-keys-to-go-live)).

---

## Getting started

```bash
npm install
cp .env.example .env          # dev defaults work as-is
docker compose up -d          # Postgres on localhost:5434
npx prisma migrate dev        # create the schema
npm run seed                  # brands, tutorials, products, looks, coupons…
npm run dev                   # http://localhost:4200
```

```bash
curl http://localhost:4200/health
curl http://localhost:4200/api/tutorials
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | watch-mode dev server (tsx) |
| `npm run build` | `prisma generate` + `tsc` → `dist/` |
| `npm start` | run the compiled server |
| `npm run seed` | seed the catalog |
| `npm run db:up` / `db:down` | start/stop Postgres |
| `npm run prisma:studio` | browse the database |

## Architecture

```
prisma/schema.prisma     full data model + migrations + seed
src/
  app.ts                 express app — mounts every router under /api
  index.ts               bootstrap + graceful shutdown
  env.ts  db.ts          validated env (+ provider flags) · Prisma client
  lib/                   http envelope, errors, jwt, password, session,
                         presenters (the wire contract), samples
  middleware/            requireAuth, requireAdmin, rate limiters
  providers/             email · push · payments · storage · oauth
                         (dev-mode fallbacks; real SDKs drop in here)
  modules/               one router per domain
```

`lib/presenters.ts` maps every DB row to the app's exact shape — the single
place the contract lives.

## Coverage

Auth & sessions (incl. social, MFA, OTP, magic-link) · account, settings,
preferences, consents, export · beauty profile · home feed · tutorials (saves,
progress, likes, comments) · learning progress & achievements · products
(variants, recommendations, reviews, Q&A, trending) · brands · shade match &
scans · look recreation · shelf · cart, wishlist, saved · addresses · checkout,
orders, returns · payments & IAP · subscriptions & billing · promos, referrals,
credits · notifications & devices · routines · search · content/CMS · support &
feedback · media · analytics · marketing/waitlist · webhooks · admin.

---

## What needs your keys to go live

Everything runs **today in dev-mode** (fake intents, console email/push, trusted
tokens) so the whole app works without any accounts. To take a feature to
production, add the key(s) to `.env` and wire the real SDK in the matching
`src/providers/*` file (each has a `TODO(prod)` marker). All are **optional**.

| Feature | Env var(s) | Provider file | Without keys (dev-mode) |
|---------|-----------|---------------|--------------------------|
| Card payments, checkout, refunds | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | `providers/payments.ts` | Fake payment/setup intents; orders still complete |
| In-app purchases (Pro) | (RevenueCat or App Store/Play keys) `REVENUECAT_WEBHOOK_SECRET` | `providers/payments.ts` | Receipts accepted, Pro granted |
| Transactional email (verify, reset, contact) | `RESEND_API_KEY` **or** `SMTP_URL` | `providers/email.ts` | Logged to the server console |
| Push notifications | `EXPO_ACCESS_TOKEN` | `providers/push.ts` | Logged to the server console |
| Media uploads (selfies, avatars, review photos) | `CLOUDINARY_URL` **or** `AWS_S3_BUCKET` (+ AWS creds) | `providers/storage.ts` | Returns hosted-style URLs / echoes provided URL |
| Google / Apple social login | `GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID` | `providers/oauth.ts` | Token payload trusted (no signature check) |
| Admin access | `ADMIN_EMAILS` (comma-separated) | — | Those emails become `ADMIN` on sign-in |

> SMS OTP and TOTP MFA also run in dev-mode (code logged / any 6-digit code
> accepted). Add a Twilio key + `otplib` to harden them for production.

## Security

- Passwords hashed with **Argon2id**.
- **JWT** access tokens (~15 min) + persisted, hashed **refresh tokens** with
  revocation (logout, change-password, per-session) and a unique `jti` per token.
- **Helmet** headers, **CORS** allow-list, **rate limiting** (tight on auth).
- Validation with **Zod**; consistent error envelope with field-level messages.
- Admin routes gated by `requireAdmin`; ownership checked on every user resource.
