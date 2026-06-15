# DollFace API

The backend for the **DollFace** beauty app — auth, beauty profiles, AI shade
matching, look recreation, tutorials, products & commerce.

**Stack:** Node.js + Express + TypeScript · Prisma + PostgreSQL · JWT (access +
refresh rotation) · Argon2 · Zod · Helmet · rate limiting.

Responses use the envelope the app already expects — `{ success, data }` — so the
mobile app switches from its built-in mock to this API just by setting
`EXPO_PUBLIC_API_URL=http://localhost:4200/api`.

---

## Getting started

```bash
npm install
cp .env.example .env          # dev defaults work as-is
docker compose up -d          # Postgres on localhost:5434
npx prisma migrate dev        # create the schema
npm run seed                  # tutorials, products & looks catalog
npm run dev                   # http://localhost:4200
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | watch-mode dev server (tsx) |
| `npm run build` | `prisma generate` + `tsc` → `dist/` |
| `npm start` | run the compiled server |
| `npm run seed` | seed the catalog |
| `npm run db:up` / `db:down` | start/stop the Postgres container |
| `npm run prisma:studio` | browse the database |

## Architecture

```
prisma/schema.prisma     data model (Phase 1) + migrations + seed
src/
  app.ts                 express app — mounts every router under /api
  index.ts               bootstrap + graceful shutdown
  env.ts  db.ts          validated env · Prisma client
  lib/                   http envelope, errors, jwt, password, presenters, samples
  middleware/            requireAuth, rate limiters
  modules/               one router per domain (auth, account, beauty-profile,
                         feed, tutorials, products, match, recreate, cart, saved,
                         subscription, notifications, routines, system, content)
```

Every DB row is mapped to the app's exact shape in `lib/presenters.ts` — the one
place the wire contract lives.

## Endpoints

This phase implements the **MVP surface (~55 endpoints)** of
[`API_SPEC.md`](./API_SPEC.md): auth & sessions, account/settings/stats, beauty
profile, home feed, shade match (+ history & scans), look recreation, tutorials
(+ saves/completion), products (+ saves), cart, saved looks, subscription,
notifications, routines, system config/flags/version/health, and terms/privacy.
Later phases (commerce checkout, payments, reviews, search, admin…) slot into the
same module structure.

```bash
curl http://localhost:4200/health
curl http://localhost:4200/api/tutorials
```

## Security

- Passwords hashed with **Argon2id**.
- **JWT** access tokens (~15 min) + persisted, hashed **refresh tokens** with
  revocation (logout, change-password) and a unique `jti` per token.
- **Helmet** headers, **CORS** allow-list, and **rate limiting** (tight on auth).
- Validation with **Zod**; consistent error envelope with field-level messages.
