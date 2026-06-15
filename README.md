# DollFace Backend

API for the DollFace beauty app (auth, beauty profiles, shade matching, products).

**Stack:** Node.js + Express + TypeScript + Zod + JWT.

## Getting started

```bash
cd dollface-backend
npm install
cp .env.example .env   # then edit JWT_SECRET
npm run dev            # http://localhost:4200
```

## Endpoints (skeleton)

| Method | Path                     | Notes                                   |
| ------ | ------------------------ | --------------------------------------- |
| GET    | `/health`                | health check                            |
| POST   | `/api/auth/register`     | `{ name, email, password }`             |
| POST   | `/api/auth/login`        | `{ email, password }`                   |
| POST   | `/api/auth/refresh-token`| `{ refreshToken }`                      |

Responses use the envelope `{ success, data }` — the **same shape** the mobile
app's mock (`dollface-mobile/lib/mockApi.ts`) returns, so connecting the app is
just setting `EXPO_PUBLIC_API_URL=http://localhost:4200/api`.

## TODO before production
- Replace the in-memory user store with Postgres (Prisma/Drizzle).
- Hash passwords (bcrypt/argon2).
- Add beauty-profile, shade-match and product routes.
- Rate limiting, request logging, validation middleware.
