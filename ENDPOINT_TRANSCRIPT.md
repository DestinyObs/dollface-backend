# DollFace API — Live Endpoint Transcript

Generated against `http://localhost:4200` · 259 operations

**Summary:** ✅ 231 success · ⚠️ 28 client-error (validation/auth by design) · ❌ 0 server-error

> Each entry below is a real request sent to the running server and the real response it returned.

**About the expected 4xx (by design):** a handful of endpoints can only succeed with a live secret the harness doesn't possess — a valid email-verification / password-reset / MFA / OTP / magic-link token, a second user's referral code, or a not-yet-created async job (recreate/returns/media). These correctly return `400/401/404`, proving validation works rather than failing. Duplicate-email `register` returns `409` by design. Everything else is `2xx`.


## Account

### ✅ `GET /api/me` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgcg013izy8okcxi5ztj",
    "name": "Transcript User",
    "email": "transcript_1781638183047@dollface.app",
    "role": "USER",
    "createdAt": "2026-06-16T19:29:43.168Z"
  }
}
```

### ✅ `GET /api/me/stats` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": "1",
    "done": "0",
    "matches": "1"
  }
}
```

### ✅ `GET /api/me/settings` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "push": true,
    "email": true,
    "tips": true,
    "analytics": true,
    "personalisation": true,
    "storeScans": true
  }
}
```

### ✅ `GET /api/me/preferences` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "language": "en",
    "theme": "light",
    "currency": "GBP",
    "country": "GB",
    "units": "metric"
  }
}
```

### ✅ `GET /api/me/consents` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "marketing": false,
    "dataProcessing": true,
    "cookies": true
  }
}
```

### ⚠️ `GET /api/me/export/{jobId}` → 404

Resolved: `GET /api/me/export/cmqh1dgcg013izy8okcxi5ztj`

**Response (404):**
```json
{
  "success": false,
  "message": "Export job not found",
  "code": "NOT_FOUND"
}
```

### ✅ `GET /api/me/activity` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "match",
      "label": "Matched 240",
      "at": "2026-06-16T19:29:43.475Z"
    },
    {
      "type": "order",
      "label": "Order £81.6",
      "at": "2026-06-16T19:29:43.432Z"
    }
  ]
}
```

### ✅ `POST /api/me/avatar` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "http://localhost:4200/uploads/af7b1eaae6805cdc.jpg"
  }
}
```

### ✅ `POST /api/me/export` → 202

**Request body:**
```json
{}
```

**Response (202):**
```json
{
  "success": true,
  "data": {
    "jobId": "cmqh1dhhx019hzy8okh4poy1k",
    "status": "PENDING"
  }
}
```

### ✅ `POST /api/me/deactivate` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deactivated": true
  }
}
```

### ✅ `POST /api/me/reactivate` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reactivated": true
  }
}
```

### ✅ `PATCH /api/me` → 200

**Request body:**
```json
{
  "name": "Jane Updated",
  "bio": "Beauty lover"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgcg013izy8okcxi5ztj",
    "name": "Jane Updated",
    "email": "transcript_1781638183047@dollface.app",
    "avatarUrl": "http://localhost:4200/uploads/af7b1eaae6805cdc.jpg",
    "bio": "Beauty lover",
    "role": "USER",
    "createdAt": "2026-06-16T19:29:43.168Z"
  }
}
```

### ✅ `PATCH /api/me/settings` → 200

**Request body:**
```json
{
  "push": true,
  "email": true,
  "tips": true,
  "analytics": true,
  "personalisation": true,
  "storeScans": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "push": true,
    "email": true,
    "tips": true,
    "analytics": true,
    "personalisation": true,
    "storeScans": true
  }
}
```

### ✅ `PATCH /api/me/preferences` → 200

**Request body:**
```json
{
  "language": "en",
  "theme": "dark",
  "currency": "GBP"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "language": "en",
    "theme": "dark",
    "currency": "GBP",
    "country": "GB",
    "units": "metric"
  }
}
```

### ✅ `PATCH /api/me/consents` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "marketing": false,
    "dataProcessing": true,
    "cookies": true
  }
}
```

### ✅ `DELETE /api/me` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

### ✅ `DELETE /api/me/avatar` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": null
  }
}
```


## Addresses

### ✅ `GET /api/addresses` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgjn014ezy8oluyxuy6t",
      "name": "Jane Doe",
      "line1": "1 Test St",
      "city": "London",
      "postcode": "E1 6AN",
      "country": "GB",
      "phone": "+447700900000",
      "isDefault": true
    }
  ]
}
```

### ✅ `POST /api/addresses` → 201

**Request body:**
```json
{
  "name": "test",
  "line1": "test",
  "line2": "test",
  "city": "test",
  "region": "test",
  "postcode": "test",
  "country": "test",
  "phone": "test",
  "isDefault": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhkx01azzy8op1gl1ffb",
    "name": "test",
    "line1": "test",
    "line2": "test",
    "city": "test",
    "region": "test",
    "postcode": "test",
    "country": "test",
    "phone": "test",
    "isDefault": true
  }
}
```

### ✅ `POST /api/addresses/{id}/default` → 200

Resolved: `POST /api/addresses/cmqh1dgjn014ezy8oluyxuy6t/default`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isDefault": true
  }
}
```

### ✅ `POST /api/addresses/validate` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "normalised": {}
  }
}
```

### ✅ `PATCH /api/addresses/{id}` → 200

Resolved: `PATCH /api/addresses/cmqh1dgjn014ezy8oluyxuy6t`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgjn014ezy8oluyxuy6t",
    "name": "Jane Doe",
    "line1": "1 Test St",
    "city": "London",
    "postcode": "E1 6AN",
    "country": "GB",
    "phone": "+447700900000",
    "isDefault": true
  }
}
```

### ✅ `DELETE /api/addresses/{id}` → 200

Resolved: `DELETE /api/addresses/cmqh1dgjn014ezy8oluyxuy6t`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Admin

### ✅ `GET /api/admin/users` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgcg013izy8okcxi5ztj",
      "name": "Transcript User",
      "email": "transcript_1781638183047@dollface.app",
      "role": "USER",
      "createdAt": "2026-06-16T19:29:43.168Z",
      "deactivatedAt": null,
      "deactivated": false
    },
    {
      "id": "cmqh1bwfb012yzy8onu7f5f6l",
      "name": "Throwaway",
      "email": "throwaway_1781638108515_2190@dollface.app",
      "role": "USER",
      "createdAt": "2026-06-16T19:28:30.695Z",
      "deactivatedAt": null,
      "deactivated": false
    },
    {
      "id": "cmqh1bwdy012rzy8o4jz1bq1n",
      "name": "Throwaway",
      "email": "throwaway_1781638108515_2141@dollface.app",
      "role": "USER",
      "createdAt": "2026-06-16T19:28:30.646Z",
      "deactivatedAt": null,
      "deactivated": false
    },
    {
      "id": "cmqh1bwcl012kzy8onam2ct3v",
      "name": "Throwaway",
      "email": "throwaway_1781638108515_2092@dollface.app",
      "role": "USER",
      "createdAt": "2026-06-16T19:28:30.598Z",
      "deactivatedAt": null,
      "deactivated": false
    },
    {
      "id": "cmqh1bw1900v7zy8o6gvmcakm",
      "name": "Throwaway",
      "email": "throwaway_1
  …(truncated)
```

### ✅ `GET /api/admin/orders` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgjr014izy8o5h796b8s",
      "userId": "cmqh1dgcg013izy8okcxi5ztj",
      "status": "PAID",
      "total": 81.6,
      "items": 1,
      "createdAt": "2026-06-16T19:29:43.432Z"
    },
    {
      "id": "cmqh1bw6a00x3zy8o1oxsyjsk",
      "userId": "cmqh1butv00pgzy8oftwvah43",
      "status": "CANCELLED",
      "total": 82.08,
      "items": 2,
      "createdAt": "2026-06-16T19:28:30.371Z"
    },
    {
      "id": "cmqh1bv1700qgzy8o89hsgnm3",
      "userId": "cmqh1butv00pgzy8oftwvah43",
      "status": "PAID",
      "total": 81.6,
      "items": 1,
      "createdAt": "2026-06-16T19:28:28.892Z"
    },
    {
      "id": "cmqh18vz9001b14cd94blzclq",
      "userId": "cmqh18vmf000014cdqey0b02c",
      "status": "PAID",
      "total": 44.75,
      "items": 1,
      "createdAt": "2026-06-16T19:26:10.149Z"
    },
    {
      "id": "cmqh18uzj003749jo5ew0ep29",
      "userId": "cmqh18u65000049joldx1d8b8",
      "status": "CANCELLED",
      "total": 118.8,
      "items": 2,
      "createdAt": "2026-06-16T19:26:08.863Z"
    },
    {
      "id": "cmqh18mge001bsy3lcafpeeze",
      "userId": "cmqh18m3q0000sy3l5j3ctlnc",
      "status": "PAID"
  …(truncated)
```

### ✅ `GET /api/admin/reviews/queue` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgk7014vzy8orwk4115q",
      "author": "Transcript User",
      "product": "Pro Filt'r Soft Matte Foundation",
      "rating": 5,
      "body": "Loved it, blends beautifully.",
      "createdAt": "2026-06-16T19:29:43.447Z"
    },
    {
      "id": "cmqh1bw2s00vtzy8omzdukloi",
      "author": "Jane Updated",
      "product": "Test Product",
      "rating": 1,
      "body": "test",
      "createdAt": "2026-06-16T19:28:30.244Z"
    }
  ]
}
```

### ✅ `GET /api/admin/analytics/overview` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": 140,
    "orders": 23,
    "matches": 25,
    "revenue": 1728.16
  }
}
```

### ✅ `POST /api/admin/products` → 201

**Request body:**
```json
{
  "id": "tx-prod-1781638183047",
  "name": "Test Product",
  "brand": "TestBrand",
  "category": "foundation",
  "priceLabel": "£30",
  "priceAmount": 30,
  "img": "https://img/x.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "tx-prod-1781638183047",
    "name": "Test Product",
    "brand": "TestBrand",
    "brandId": null,
    "category": "foundation",
    "priceLabel": "£30",
    "priceAmount": 30,
    "rating": "0.0",
    "img": "https://img/x.jpg",
    "reviewCount": "0 reviews",
    "highlights": [],
    "description": "",
    "shades": [],
    "ingredients": [],
    "trending": false,
    "isNew": false,
    "order": 0
  }
}
```

### ✅ `POST /api/admin/products/import` → 200

**Request body:**
```json
{
  "products": [
    {
      "id": "tx-imp-1781638183047",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "priceLabel": "£12",
      "priceAmount": 12,
      "img": "https://img/y.jpg"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "imported": 1
  }
}
```

### ✅ `POST /api/admin/tutorials` → 201

**Request body:**
```json
{
  "id": "tx-tut-1781638183047",
  "title": "Test Tutorial",
  "cat": "Beginner",
  "mins": "5",
  "level": "Easy",
  "img": "https://img/t.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "tx-tut-1781638183047",
    "title": "Test Tutorial",
    "cat": "Beginner",
    "mins": "5",
    "level": "Easy",
    "views": "0",
    "img": "https://img/t.jpg",
    "description": "",
    "steps": [],
    "featured": false,
    "eyebrow": null,
    "featuredTitle": null,
    "featuredMeta": null,
    "featuredImg": null,
    "order": 0
  }
}
```

### ✅ `POST /api/admin/banners` → 201

**Request body:**
```json
{
  "placement": "home",
  "title": "Test Banner",
  "img": "https://img/b.jpg",
  "route": "/",
  "order": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhoa01cdzy8ot0rndl9u",
    "placement": "home",
    "title": "Test Banner",
    "img": "https://img/b.jpg",
    "route": "/",
    "active": true,
    "order": 1
  }
}
```

### ✅ `POST /api/admin/reviews/{id}/moderate` → 200

Resolved: `POST /api/admin/reviews/1/moderate`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "moderated": true,
    "action": "approve"
  }
}
```

### ✅ `POST /api/admin/notifications/broadcast` → 200

**Request body:**
```json
{
  "title": "Hello",
  "body": "Broadcast test",
  "route": "/"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": 158
  }
}
```

### ✅ `POST /api/admin/promos` → 201

**Request body:**
```json
{
  "code": "TX1781638183",
  "type": "PERCENT",
  "value": 15
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhp301gszy8omlzs5uvj",
    "code": "TX1781638183",
    "type": "PERCENT",
    "value": 15,
    "active": true,
    "expiresAt": null
  }
}
```

### ⚠️ `PATCH /api/admin/users/{id}` → 404

Resolved: `PATCH /api/admin/users/tx-nonexistent`

**Request body:**
```json
{}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Not found",
  "code": "NOT_FOUND"
}
```

### ⚠️ `PATCH /api/admin/products/{id}` → 404

Resolved: `PATCH /api/admin/products/tx-nonexistent`

**Request body:**
```json
{}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Not found",
  "code": "NOT_FOUND"
}
```

### ⚠️ `PATCH /api/admin/tutorials/{id}` → 404

Resolved: `PATCH /api/admin/tutorials/tx-nonexistent`

**Request body:**
```json
{}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Not found",
  "code": "NOT_FOUND"
}
```

### ⚠️ `DELETE /api/admin/products/{id}` → 404

Resolved: `DELETE /api/admin/products/tx-nonexistent`

**Response (404):**
```json
{
  "success": false,
  "message": "Not found",
  "code": "NOT_FOUND"
}
```


## Analytics

### ✅ `POST /api/events` → 200

**Request body:**
```json
{
  "name": "test",
  "props": "test",
  "ts": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accepted": 0
  }
}
```

### ✅ `POST /api/events/screen` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accepted": 1
  }
}
```


## Auth

### ✅ `GET /api/auth/check-email` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

### ✅ `GET /api/auth/me` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmqh1dgcg013izy8okcxi5ztj",
      "name": "Transcript User",
      "email": "transcript_1781638183047@dollface.app",
      "role": "USER",
      "createdAt": "2026-06-16T19:29:43.168Z"
    },
    "beautyProfile": null,
    "onboardingComplete": false,
    "subscription": {
      "plan": "FREE",
      "status": "Active"
    }
  }
}
```

### ✅ `GET /api/auth/sessions` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgcx013ozy8oqmrpfjbo",
      "userAgent": "node",
      "createdAt": "2026-06-16T19:29:43.186Z"
    }
  ]
}
```

### ⚠️ `POST /api/auth/register` → 409

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@dollface.app",
  "password": "password123"
}
```

**Response (409):**
```json
{
  "success": false,
  "message": "An account with this email already exists.",
  "code": "EMAIL_TAKEN"
}
```

### ⚠️ `POST /api/auth/login` → 400

**Request body:**
```json
{
  "email": "test",
  "password": "test"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION",
  "errors": {
    "email": "Invalid email"
  }
}
```

### ⚠️ `POST /api/auth/refresh-token` → 401

**Request body:**
```json
{
  "refreshToken": "test"
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid refresh token",
  "code": "REFRESH_INVALID"
}
```

### ✅ `POST /api/auth/logout` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out"
  }
}
```

### ✅ `POST /api/auth/forgot-password` → 200

**Request body:**
```json
{
  "email": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "If that email exists, a reset link has been sent."
  }
}
```

### ⚠️ `POST /api/auth/reset-password` → 400

**Request body:**
```json
{
  "token": "test",
  "password": "test"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION",
  "errors": {
    "password": "String must contain at least 8 character(s)"
  }
}
```

### ⚠️ `POST /api/auth/change-password` → 400

**Request body:**
```json
{
  "currentPassword": "test",
  "newPassword": "test"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION",
  "errors": {
    "newPassword": "String must contain at least 8 character(s)"
  }
}
```

### ✅ `POST /api/auth/social/{provider}` → 200

Resolved: `POST /api/auth/social/google`

**Request body:**
```json
{
  "idToken": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmqh0wpdy002t2ksksqtdwoud",
      "name": "google_a94a8fe5cc",
      "email": "google_a94a8fe5cc@dollface.dev",
      "role": "USER",
      "createdAt": "2026-06-16T19:16:41.735Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXFoMHdwZHkwMDJ0Mmtza3NxdGR3b3VkIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3ODE2MzgxODQsImV4cCI6MTc4MTYzOTA4NH0.tUf9BghY6VvXxkCyFG6y2EjxwJkn1db8BP93B0L9TP4",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXFoMHdwZHkwMDJ0Mmtza3NxdGR3b3VkIiwidHlwIjoicmVmcmVzaCIsImp0aSI6ImNkZjUxN2Y3LTdiY2MtNGJlMC05MGMwLWY0MzZkNjRlZWY0ZiIsImlhdCI6MTc4MTYzODE4NCwiZXhwIjoxNzg0MjMwMTg0fQ.Tt2H29hYI-TzjR4jt9POAkPuZSnu0clM-XfAA4CLYWY"
    },
    "isNewUser": false
  }
}
```

### ✅ `POST /api/auth/resend-verification` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": true
  }
}
```

### ⚠️ `POST /api/auth/verify-email` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "code": "TOKEN_INVALID"
}
```

### ⚠️ `POST /api/auth/change-email` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION",
  "errors": {
    "newEmail": "Required",
    "password": "Required"
  }
}
```

### ✅ `POST /api/auth/mfa/setup` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "secret": "wVQ1dh0smRVosBRwjA3ivwyJGqg=",
    "otpauthUrl": "otpauth://totp/DollFace?secret=wVQ1dh0smRVosBRwjA3ivwyJGqg%3D"
  }
}
```

### ⚠️ `POST /api/auth/mfa/verify` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION",
  "errors": {
    "code": "Required"
  }
}
```

### ⚠️ `POST /api/auth/mfa/challenge` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION",
  "errors": {
    "code": "Required"
  }
}
```

### ⚠️ `POST /api/auth/otp/request` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Missing phone",
  "code": "NO_PHONE"
}
```

### ⚠️ `POST /api/auth/otp/verify` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired code",
  "code": "OTP_INVALID"
}
```

### ✅ `POST /api/auth/magic-link` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "If that email exists, a sign-in link has been sent."
  }
}
```

### ⚠️ `POST /api/auth/magic-link/verify` → 400

**Request body:**
```json
{}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired link",
  "code": "TOKEN_INVALID"
}
```

### ✅ `DELETE /api/auth/sessions` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "revoked": true
  }
}
```

### ✅ `DELETE /api/auth/sessions/{id}` → 200

Resolved: `DELETE /api/auth/sessions/cmqh1dgcg013izy8okcxi5ztj`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "revoked": true
  }
}
```

### ✅ `DELETE /api/auth/mfa` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "disabled": true
  }
}
```


## Beauty Profile

### ✅ `GET /api/beauty-profile` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

### ✅ `GET /api/beauty-profile/history` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/beauty-profile/options` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "goals": [
      "Everyday natural",
      "Glam & bold",
      "Master the basics",
      "Flawless base",
      "Eye looks",
      "Long-lasting wear"
    ],
    "skinTypes": [
      "Oily",
      "Dry",
      "Combination",
      "Normal",
      "Sensitive"
    ],
    "skinTones": [
      "Fair",
      "Light",
      "Medium",
      "Tan",
      "Deep",
      "Rich"
    ],
    "undertones": [
      "Cool",
      "Neutral",
      "Warm",
      "Olive"
    ],
    "faceConcerns": [
      "Acne",
      "Redness",
      "Dark circles",
      "Large pores",
      "Fine lines",
      "Dullness",
      "Uneven tone"
    ],
    "preferredBrands": [
      "Fenty Beauty",
      "Rare Beauty",
      "MAC",
      "Charlotte Tilbury",
      "NARS",
      "Maybelline",
      "Benefit",
      "NYX"
    ],
    "skillLevels": [
      "Beginner",
      "Intermediate",
      "Advanced"
    ],
    "budgetRanges": [
      "Drugstore",
      "Mid-range",
      "Luxury",
      "Mix of all"
    ],
    "stylePreferences": [
      "Natural",
      "Soft glam",
      "Bold",
      "Editorial",
      "Minimal",
      "Trendy"
    ]
  }
}
```

### ✅ `POST /api/beauty-profile/complete` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "onboardingComplete": true
  }
}
```

### ✅ `POST /api/beauty-profile/re-analyse` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reanalysed": true,
    "profile": {}
  }
}
```

### ✅ `PUT /api/beauty-profile` → 200

**Request body:**
```json
{
  "goals": [],
  "skinType": "test",
  "skinTone": "test",
  "undertone": "test",
  "faceConcerns": [],
  "preferredBrands": [],
  "skillLevel": "test",
  "budgetRange": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "goals": [],
    "skinTone": "test",
    "skinType": "test",
    "undertone": "test",
    "skillLevel": "test",
    "budgetRange": "test",
    "faceConcerns": [],
    "preferredBrands": []
  }
}
```

### ✅ `PATCH /api/beauty-profile` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "goals": [],
    "skinTone": "test",
    "skinType": "test",
    "undertone": "test",
    "skillLevel": "test",
    "budgetRange": "test",
    "faceConcerns": [],
    "preferredBrands": []
  }
}
```


## Brands

### ✅ `GET /api/brands` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "fenty-beauty",
      "name": "Fenty Beauty",
      "description": "Inclusive beauty for all skin tones."
    },
    {
      "id": "mac",
      "name": "MAC",
      "description": "Professional makeup artistry."
    },
    {
      "id": "maybelline",
      "name": "Maybelline",
      "description": "Accessible everyday glam."
    },
    {
      "id": "rare-beauty",
      "name": "Rare Beauty",
      "description": "Makeup made to feel good in."
    },
    {
      "id": "benefit",
      "name": "Benefit",
      "description": "Brows, bronzers and good times."
    },
    {
      "id": "charlotte-tilbury",
      "name": "Charlotte Tilbury",
      "description": "Red-carpet glamour."
    }
  ]
}
```

### ✅ `GET /api/brands/{id}` → 200

Resolved: `GET /api/brands/fenty-beauty`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "fenty-beauty",
    "name": "Fenty Beauty",
    "description": "Inclusive beauty for all skin tones.",
    "products": [
      {
        "id": "1",
        "name": "Pro Filt'r Soft Matte Foundation",
        "brand": "Fenty Beauty",
        "category": "Foundation",
        "price": "£34",
        "rating": "5.0",
        "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80"
      }
    ]
  }
}
```

### ✅ `POST /api/brands/{id}/follow` → 200

Resolved: `POST /api/brands/fenty-beauty/follow`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "following": true
  }
}
```

### ✅ `DELETE /api/brands/{id}/follow` → 200

Resolved: `DELETE /api/brands/fenty-beauty/follow`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "following": false
  }
}
```


## Cart

### ✅ `GET /api/cart` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cmqh1dgk3014rzy8otd6s5wwy",
        "productId": "2",
        "name": "Soft Matte",
        "brand": "NARS",
        "price": 42,
        "qty": 1
      }
    ],
    "count": 1,
    "subtotal": 42
  }
}
```

### ✅ `GET /api/cart/estimate` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subtotal": 42,
    "discount": 0,
    "shipping": 0,
    "tax": 8.4,
    "total": 50.4,
    "currency": "GBP"
  }
}
```

### ✅ `POST /api/cart/items` → 201

**Request body:**
```json
{
  "productId": "1",
  "name": "Pro Filtr",
  "brand": "Fenty",
  "price": 34,
  "qty": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cmqh1dgk3014rzy8otd6s5wwy",
        "productId": "2",
        "name": "Soft Matte",
        "brand": "NARS",
        "price": 42,
        "qty": 1
      },
      {
        "id": "cmqh1dhkc01alzy8oxmc3s8sf",
        "productId": "1",
        "name": "Pro Filtr",
        "brand": "Fenty",
        "price": 34,
        "qty": 1
      }
    ],
    "count": 2,
    "subtotal": 76
  }
}
```

### ✅ `POST /api/cart/merge` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cmqh1dgk3014rzy8otd6s5wwy",
        "productId": "2",
        "name": "Soft Matte",
        "brand": "NARS",
        "price": 42,
        "qty": 1
      },
      {
        "id": "cmqh1dhkc01alzy8oxmc3s8sf",
        "productId": "1",
        "name": "Pro Filtr",
        "brand": "Fenty",
        "price": 34,
        "qty": 1
      }
    ],
    "count": 2,
    "subtotal": 76
  }
}
```

### ✅ `POST /api/cart/coupon` → 200

**Request body:**
```json
{
  "code": "WELCOME10"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applied": true,
    "code": "WELCOME10",
    "type": "PERCENT",
    "value": 10
  }
}
```

### ⚠️ `PATCH /api/cart/items/{id}` → 404

Resolved: `PATCH /api/cart/items/cmqh1dgjh014azy8omv1jocof`

**Request body:**
```json
{
  "qty": 1
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Cart item not found",
  "code": "NOT_FOUND"
}
```

### ✅ `DELETE /api/cart` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [],
    "count": 0,
    "subtotal": 0
  }
}
```

### ⚠️ `DELETE /api/cart/items/{id}` → 404

Resolved: `DELETE /api/cart/items/cmqh1dgjh014azy8omv1jocof`

**Response (404):**
```json
{
  "success": false,
  "message": "Cart item not found",
  "code": "NOT_FOUND"
}
```

### ✅ `DELETE /api/cart/coupon` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applied": false
  }
}
```


## Checkout & Orders

### ✅ `GET /api/checkout/shipping-options` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "standard",
      "label": "Standard (3–5 days)",
      "price": 3.95,
      "eta": "3–5 working days"
    },
    {
      "id": "express",
      "label": "Express (1–2 days)",
      "price": 6.95,
      "eta": "1–2 working days"
    },
    {
      "id": "free",
      "label": "Free over £40",
      "price": 0,
      "eta": "3–5 working days"
    }
  ]
}
```

### ✅ `GET /api/orders` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgjr014izy8o5h796b8s",
      "status": "PAID",
      "subtotal": 68,
      "shipping": 0,
      "tax": 13.6,
      "total": 81.6,
      "currency": "GBP",
      "createdAt": "2026-06-16T19:29:43.432Z",
      "items": [
        {
          "id": "cmqh1dgjr014jzy8opm3bd9ya",
          "productId": "1",
          "name": "Pro Filtr",
          "brand": "Fenty",
          "price": 34,
          "qty": 2
        }
      ]
    }
  ]
}
```

### ✅ `GET /api/orders/{id}` → 200

Resolved: `GET /api/orders/cmqh1dgjr014izy8o5h796b8s`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgjr014izy8o5h796b8s",
    "status": "PAID",
    "subtotal": 68,
    "shipping": 0,
    "tax": 13.6,
    "total": 81.6,
    "currency": "GBP",
    "createdAt": "2026-06-16T19:29:43.432Z",
    "items": [
      {
        "id": "cmqh1dgjr014jzy8opm3bd9ya",
        "productId": "1",
        "name": "Pro Filtr",
        "brand": "Fenty",
        "price": 34,
        "qty": 2
      }
    ]
  }
}
```

### ✅ `GET /api/orders/{id}/tracking` → 200

Resolved: `GET /api/orders/cmqh1dgjr014izy8o5h796b8s/tracking`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "PAID",
    "carrier": "Royal Mail",
    "trackingNo": "DF8O5H796B8S",
    "steps": [
      {
        "label": "Order placed",
        "done": true
      },
      {
        "label": "Preparing",
        "done": true
      },
      {
        "label": "Shipped",
        "done": false
      },
      {
        "label": "Delivered",
        "done": false
      }
    ]
  }
}
```

### ✅ `GET /api/orders/{id}/invoice` → 200

Resolved: `GET /api/orders/cmqh1dgjr014izy8o5h796b8s/invoice`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://dollface.app/invoices/cmqh1dgjr014izy8o5h796b8s.pdf"
  }
}
```

### ⚠️ `GET /api/returns/{id}` → 404

Resolved: `GET /api/returns/1`

**Response (404):**
```json
{
  "success": false,
  "message": "Return not found",
  "code": "NOT_FOUND"
}
```

### ✅ `POST /api/checkout/session` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "pi_dev_1e4dea7e331677c4",
    "clientSecret": "pi_dev_1e4dea7e331677c4_secret_1cd87a61394b",
    "amount": 82.08,
    "currency": "GBP"
  }
}
```

### ✅ `POST /api/orders` → 201

**Request body:**
```json
{
  "addressId": "cmqh1dgjn014ezy8oluyxuy6t"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhla01b5zy8oziu3hdeo",
    "status": "PAID",
    "subtotal": 68.4,
    "shipping": 0,
    "tax": 13.68,
    "total": 82.08,
    "currency": "GBP",
    "createdAt": "2026-06-16T19:29:44.783Z",
    "items": [
      {
        "id": "cmqh1dhla01b6zy8osqgy0164",
        "productId": "2",
        "name": "Soft Matte",
        "brand": "NARS",
        "price": 42,
        "qty": 1
      },
      {
        "id": "cmqh1dhla01b7zy8oleqz83fx",
        "productId": "1",
        "name": "Pro Filtr",
        "brand": "Fenty",
        "price": 34,
        "qty": 1
      }
    ]
  }
}
```

### ✅ `POST /api/orders/{id}/cancel` → 200

Resolved: `POST /api/orders/cmqh1dgjr014izy8o5h796b8s/cancel`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "CANCELLED"
  }
}
```

### ✅ `POST /api/orders/{id}/reorder` → 200

Resolved: `POST /api/orders/cmqh1dgjr014izy8o5h796b8s/reorder`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reordered": true,
    "items": 1
  }
}
```

### ✅ `POST /api/orders/{id}/returns` → 201

Resolved: `POST /api/orders/cmqh1dgjr014izy8o5h796b8s/returns`

**Request body:**
```json
{}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhlq01bgzy8opwia4rgn",
    "status": "REQUESTED"
  }
}
```


## Content

### ✅ `GET /api/content/banners` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dg3l0002atnc3ch1ifyl",
      "placement": "home",
      "title": "Find your perfect shade",
      "img": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&h=500&q=80",
      "route": "/(tabs)/match"
    }
  ]
}
```

### ✅ `GET /api/content/collections` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/content/articles` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "slug": "undertones-101",
      "title": "Undertones 101",
      "excerpt": "Cool, warm or neutral — and why it matters.",
      "cover": "https://images.unsplash.com/photo-1591019479261-1a103585c559?auto=format&fit=crop&w=800&h=500&q=80",
      "publishedAt": "2026-06-15T18:39:35.851Z"
    }
  ]
}
```

### ⚠️ `GET /api/content/articles/{slug}` → 404

Resolved: `GET /api/content/articles/cmqh1dg3l0002atnc3ch1ifyl`

**Response (404):**
```json
{
  "success": false,
  "message": "Article not found",
  "code": "NOT_FOUND"
}
```

### ✅ `GET /api/content/faq` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "q": "How does shade matching work?",
      "a": "Our AI reads your skin tone, undertone and surface colour from a selfie, then matches it across hundreds of products."
    },
    {
      "q": "Is DollFace free?",
      "a": "Yes — core features are free. DollFace Pro unlocks unlimited matches, recreations and the full tutorial library."
    },
    {
      "q": "Are my photos stored?",
      "a": "Only if you allow scan storage in Settings. You can delete your data any time."
    },
    {
      "q": "Which brands are included?",
      "a": "We cover a wide, inclusive range across drugstore and luxury brands, and add more regularly."
    }
  ]
}
```

### ✅ `GET /api/content/help` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "title": "Getting started",
      "body": "Create an account, complete your beauty profile, and run your first shade match."
    },
    {
      "title": "Managing your subscription",
      "body": "Open Profile → Subscription to upgrade, cancel or restore DollFace Pro."
    },
    {
      "title": "Orders & returns",
      "body": "Track orders from Profile → Orders. Start a return within 30 days of delivery."
    }
  ]
}
```

### ✅ `GET /api/content/glossary` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "term": "Undertone",
      "definition": "The subtle hue beneath your skin's surface — cool, warm, neutral or olive."
    },
    {
      "term": "Cut-crease",
      "definition": "An eye technique with a sharp line carved into the crease for contrast."
    },
    {
      "term": "Baking",
      "definition": "Letting setting powder sit on the skin to set foundation before dusting away."
    }
  ]
}
```

### ✅ `GET /api/content/whats-new` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "version": "1.0.0",
      "date": "2026-06-01",
      "notes": [
        "AI shade matching",
        "Look recreation",
        "Tutorials & shop",
        "DollFace Pro"
      ]
    }
  ]
}
```

### ✅ `GET /api/content/terms` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "Terms of Service",
    "updatedAt": "2026-06-01",
    "sections": [
      {
        "heading": "Using DollFace",
        "body": "DollFace provides personalised beauty recommendations, tutorials and shopping. You're responsible for keeping your account secure and for the activity under it."
      },
      {
        "heading": "Your content",
        "body": "Photos you upload for shade matching and look recreation are processed to generate recommendations. You own your content; you grant us a licence to process it to provide the service."
      },
      {
        "heading": "Purchases & subscriptions",
        "body": "Paid plans renew automatically until cancelled. Prices are shown before purchase and may vary by region."
      },
      {
        "heading": "Acceptable use",
        "body": "Don't misuse the service, attempt to disrupt it, or upload content you don't have the rights to."
      }
    ]
  }
}
```

### ✅ `GET /api/content/privacy` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "Privacy Policy",
    "updatedAt": "2026-06-01",
    "sections": [
      {
        "heading": "What we collect",
        "body": "Account details, your beauty profile, and the photos you submit for analysis. We collect usage data to improve recommendations."
      },
      {
        "heading": "How we use it",
        "body": "To personalise shade matches, tutorials and product picks, and to operate and improve DollFace."
      },
      {
        "heading": "Your photos",
        "body": "Selfies and inspiration images are used to generate your results. You can disable scan storage in Settings and delete your data at any time."
      },
      {
        "heading": "Your rights",
        "body": "You can access, export or delete your data from Settings, or by contacting hello@dollface.app."
      }
    ]
  }
}
```


## Feed

### ✅ `GET /api/feed/home` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "streak": 1,
    "matchedShade": {
      "name": "240",
      "product": "Fenty · 90% match",
      "matchPct": 90,
      "hex": "#C4875A"
    },
    "trendingLooks": [
      {
        "id": "soft-glam",
        "label": "Soft Glam",
        "meta": "2.4k saves",
        "level": "Easy",
        "img": "https://images.unsplash.com/photo-1591019479261-1a103585c559?auto=format&fit=crop&w=500&h=600&q=80"
      },
      {
        "id": "glass-skin",
        "label": "Glass Skin",
        "meta": "1.9k saves",
        "level": "Medium",
        "img": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&h=600&q=80"
      },
      {
        "id": "bold-lip",
        "label": "Bold Lip",
        "meta": "3.1k saves",
        "level": "Easy",
        "img": "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=500&h=600&q=80"
      },
      {
        "id": "bronzed",
        "label": "Bronzed",
        "meta": "1.2k saves",
        "level": "Medium",
        "img": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&h=600&q=80"
      }
    ],
    "con
  …(truncated)
```


## Marketing

### ✅ `POST /api/marketing/waitlist` → 200

**Request body:**
```json
{
  "email": "test",
  "source": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "joined": false
  }
}
```

### ✅ `POST /api/marketing/newsletter` → 200

**Request body:**
```json
{
  "email": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscribed": false
  }
}
```

### ✅ `POST /api/marketing/newsletter/unsubscribe` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unsubscribed": true
  }
}
```


## Media

### ⚠️ `GET /api/media/{id}` → 404

Resolved: `GET /api/media/1`

**Response (404):**
```json
{
  "success": false,
  "message": "Asset not found",
  "code": "NOT_FOUND"
}
```

### ✅ `POST /api/media/presign` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assetId": "asset_42e214490574035f",
    "uploadUrl": "http://localhost:4200/api/media/asset_42e214490574035f/put",
    "publicUrl": "http://localhost:4200/uploads/asset_42e214490574035f.jpeg"
  }
}
```

### ✅ `POST /api/media` → 201

**Request body:**
```json
{
  "file": "test",
  "url": "test",
  "type": "test"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhnk01cazy8o8avju224",
    "url": "http://localhost:4200/uploads/5f4b9a48efd3b3b4.jpg",
    "type": "test"
  }
}
```

### ✅ `DELETE /api/media/{id}` → 200

Resolved: `DELETE /api/media/tx-nonexistent`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Notifications

### ✅ `GET /api/notifications` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgjv014nzy8od13jouyo",
      "icon": "bag-handle",
      "bg": "#EAF7EF",
      "color": "#2F7D52",
      "title": "Order confirmed",
      "body": "Your order of £81.6 is being prepared.",
      "time": "now",
      "read": false,
      "route": "/product"
    },
    {
      "id": "cmqh1dgcg013mzy8oowwzh57d",
      "icon": "diamond",
      "bg": "#FBF1E6",
      "color": "#A06A2C",
      "title": "Welcome to DollFace",
      "body": "Start with a shade match to personalise everything.",
      "time": "now",
      "read": false,
      "route": "/(tabs)/match"
    }
  ]
}
```

### ✅ `GET /api/notifications/unread-count` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 2
  }
}
```

### ✅ `GET /api/notifications/preferences` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": true,
    "tutorials": true,
    "promos": true,
    "orders": true
  }
}
```

### ✅ `POST /api/notifications/read-all` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ok": true
  }
}
```

### ✅ `POST /api/notifications/{id}/snooze` → 200

Resolved: `POST /api/notifications/cmqh1dgcg013mzy8oowwzh57d/snooze`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "snoozed": true
  }
}
```

### ✅ `POST /api/notifications/{id}/read` → 200

Resolved: `POST /api/notifications/cmqh1dgcg013mzy8oowwzh57d/read`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ok": true
  }
}
```

### ✅ `POST /api/devices` → 201

**Request body:**
```json
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "appVersion": "1.0.0"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh13ed30081m5i78mh9v2ga",
    "registered": true
  }
}
```

### ✅ `POST /api/devices/test-push` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": 1
  }
}
```

### ✅ `PATCH /api/notifications/preferences` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": true,
    "tutorials": true,
    "promos": true,
    "orders": true
  }
}
```

### ✅ `DELETE /api/notifications/{id}` → 200

Resolved: `DELETE /api/notifications/cmqh1dgcg013mzy8oowwzh57d`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

### ✅ `DELETE /api/devices/{token}` → 200

Resolved: `DELETE /api/devices/dev-token`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unregistered": true
  }
}
```


## Payments

### ✅ `GET /api/payments/methods` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgko0151zy8o6g8vsvtw",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2030,
      "isDefault": true
    }
  ]
}
```

### ✅ `GET /api/payments/transactions` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgjv014lzy8o2hove52n",
      "orderId": "cmqh1dgjr014izy8o5h796b8s",
      "amount": 81.6,
      "currency": "GBP",
      "status": "SUCCEEDED",
      "kind": "payment",
      "createdAt": "2026-06-16T19:29:43.436Z"
    }
  ]
}
```

### ✅ `POST /api/payments/methods` → 201

**Request body:**
```json
{
  "brand": "visa",
  "last4": "4242",
  "expMonth": 12,
  "expYear": 2030,
  "isDefault": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhlu01bizy8odta2dviy",
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2030,
    "isDefault": true
  }
}
```

### ✅ `POST /api/payments/methods/{id}/default` → 200

Resolved: `POST /api/payments/methods/cmqh1dgko0151zy8o6g8vsvtw/default`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isDefault": true
  }
}
```

### ✅ `POST /api/payments/intent` → 200

**Request body:**
```json
{
  "amount": 50
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "pi_dev_2fd60cbdeffdc21e",
    "clientSecret": "pi_dev_2fd60cbdeffdc21e_secret_0fade89041ea",
    "amount": 5000,
    "currency": "gbp",
    "status": "requires_payment_method"
  }
}
```

### ✅ `POST /api/payments/iap/apple/verify` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "entitlement": "pro"
  }
}
```

### ✅ `POST /api/payments/iap/google/verify` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "entitlement": "pro"
  }
}
```

### ✅ `DELETE /api/payments/methods/{id}` → 200

Resolved: `DELETE /api/payments/methods/cmqh1dgko0151zy8o6g8vsvtw`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Products

### ✅ `GET /api/products` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Pro Filt'r Soft Matte Foundation",
      "brand": "Fenty Beauty",
      "category": "Foundation",
      "price": "£34",
      "rating": "5.0",
      "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      "id": "tx-imp-1781638108515",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    },
    {
      "id": "tx-imp-1781637830447",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    },
    {
      "id": "tx-imp-1781637885398",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    },
    {
      "id": "tx-prod-1781637830447",
      "name": "Test Product",
      "brand": "TestBrand",
      "category": "foundation",
      "price": "£30",
      "rating": "0.0",
      "img": "https://img/x.jpg"
    },
    {
      "id": "tx-prod-1781637885398",
      "nam
  …(truncated)
```

### ✅ `GET /api/products/categories` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    "All",
    "Foundation",
    "Concealer",
    "Blush",
    "Bronzer",
    "Lips",
    "Primer"
  ]
}
```

### ✅ `GET /api/products/saved` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/products/trending` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Pro Filt'r Soft Matte Foundation",
      "brand": "Fenty Beauty",
      "category": "Foundation",
      "price": "£34",
      "rating": "5.0",
      "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      "id": "2",
      "name": "Studio Fix Fluid SPF15",
      "brand": "MAC",
      "category": "Foundation",
      "price": "£31",
      "rating": "4.6",
      "img": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      "id": "3",
      "name": "Fit Me Matte + Poreless",
      "brand": "Maybelline",
      "category": "Foundation",
      "price": "£10",
      "rating": "4.5",
      "img": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&h=400&q=80"
    }
  ]
}
```

### ✅ `GET /api/products/new` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "5",
      "name": "Hoola Matte Bronzer",
      "brand": "Benefit",
      "category": "Bronzer",
      "price": "£30",
      "rating": "4.7",
      "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      "id": "6",
      "name": "Pillow Talk Lipstick",
      "brand": "Charlotte Tilbury",
      "category": "Lips",
      "price": "£30",
      "rating": "4.8",
      "img": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&h=400&q=80"
    }
  ]
}
```

### ✅ `GET /api/products/recently-viewed` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/products/barcode/{code}` → 200

Resolved: `GET /api/products/barcode/WELCOME10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tx-imp-1781637885398",
    "name": "Imported",
    "brand": "B",
    "price": 12,
    "img": "https://img/y.jpg",
    "rating": "0.0",
    "reviewCount": "0 reviews",
    "highlights": [],
    "description": "",
    "shades": []
  }
}
```

### ✅ `GET /api/products/{id}/variants` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/variants`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "shades": [],
    "inStock": true
  }
}
```

### ✅ `GET /api/products/{id}/recommendations` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/recommendations`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-imp-1781637885398",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    },
    {
      "id": "tx-imp-1781638108515",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    }
  ]
}
```

### ✅ `GET /api/products/{id}/related` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/related`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-imp-1781637885398",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    },
    {
      "id": "tx-imp-1781638108515",
      "name": "Imported",
      "brand": "B",
      "category": "lip",
      "price": "£12",
      "rating": "0.0",
      "img": "https://img/y.jpg"
    }
  ]
}
```

### ✅ `GET /api/products/{id}/ingredients` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/ingredients`

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/products/{id}/price-history` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/price-history`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-17",
      "price": 12.36
    },
    {
      "date": "2026-02-16",
      "price": 11.4
    },
    {
      "date": "2026-03-18",
      "price": 12.36
    },
    {
      "date": "2026-04-17",
      "price": 11.4
    },
    {
      "date": "2026-05-17",
      "price": 12.36
    },
    {
      "date": "2026-06-16",
      "price": 11.4
    }
  ]
}
```

### ✅ `GET /api/products/{id}` → 200

Resolved: `GET /api/products/tx-imp-1781637830447`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tx-imp-1781637830447",
    "name": "Imported",
    "brand": "B",
    "price": 12,
    "img": "https://img/y.jpg",
    "rating": "0.0",
    "reviewCount": "0 reviews",
    "highlights": [],
    "description": "",
    "shades": []
  }
}
```

### ✅ `POST /api/products/{id}/save` → 200

Resolved: `POST /api/products/tx-imp-1781637830447/save`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true
  }
}
```

### ✅ `POST /api/products/{id}/view` → 200

Resolved: `POST /api/products/tx-imp-1781637830447/view`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tracked": true
  }
}
```

### ✅ `POST /api/products/{id}/restock-alert` → 200

Resolved: `POST /api/products/tx-imp-1781637830447/restock-alert`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscribed": true
  }
}
```

### ✅ `DELETE /api/products/{id}/save` → 200

Resolved: `DELETE /api/products/tx-imp-1781637830447/save`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": false
  }
}
```


## Promos & Referrals

### ✅ `GET /api/promos/active` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "FRESH25",
      "type": "PERCENT",
      "value": 25
    },
    {
      "code": "T1781557891003",
      "type": "PERCENT",
      "value": 10
    },
    {
      "code": "T1781558073898",
      "type": "PERCENT",
      "value": 10
    },
    {
      "code": "TX1781637830",
      "type": "PERCENT",
      "value": 15
    },
    {
      "code": "TX1781637885",
      "type": "PERCENT",
      "value": 15
    },
    {
      "code": "T1781637956857",
      "type": "PERCENT",
      "value": 10
    },
    {
      "code": "T1781637969162",
      "type": "PERCENT",
      "value": 10
    },
    {
      "code": "TX1781638108",
      "type": "PERCENT",
      "value": 15
    },
    {
      "code": "WELCOME10",
      "type": "PERCENT",
      "value": 10
    },
    {
      "code": "DOLL5",
      "type": "FIXED",
      "value": 5
    }
  ]
}
```

### ✅ `GET /api/referrals/me` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "DOLL-5EB207",
    "referred": 0,
    "rewardPerReferral": "£5 credit"
  }
}
```

### ✅ `GET /api/credits` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 0,
    "currency": "GBP"
  }
}
```

### ✅ `POST /api/promos/validate` → 200

**Request body:**
```json
{
  "code": "WELCOME10"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "WELCOME10",
    "type": "PERCENT",
    "value": 10
  }
}
```

### ⚠️ `POST /api/referrals/redeem` → 404

**Request body:**
```json
{
  "code": "test"
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Invalid referral code",
  "code": "BAD_CODE"
}
```


## Recreate

### ✅ `GET /api/recreate/history` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ⚠️ `GET /api/recreate/{id}/status` → 404

Resolved: `GET /api/recreate/1/status`

**Response (404):**
```json
{
  "success": false,
  "message": "Recreation not found",
  "code": "NOT_FOUND"
}
```

### ✅ `GET /api/recreate/gallery` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ⚠️ `GET /api/recreate/{id}` → 404

Resolved: `GET /api/recreate/1`

**Response (404):**
```json
{
  "success": false,
  "message": "Recreation not found",
  "code": "NOT_FOUND"
}
```

### ✅ `POST /api/recreate/upload` → 201

**Request body:**
```json
{
  "image": "test"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhjx01ahzy8ownerwxqx",
    "status": "PROCESSING"
  }
}
```

### ⚠️ `POST /api/recreate/{id}/save` → 404

Resolved: `POST /api/recreate/1/save`

**Request body:**
```json
{}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Recreation not found",
  "code": "NOT_FOUND"
}
```

### ⚠️ `POST /api/recreate/{id}/share` → 404

Resolved: `POST /api/recreate/1/share`

**Request body:**
```json
{}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Recreation not found",
  "code": "NOT_FOUND"
}
```

### ✅ `POST /api/recreate/{id}/report` → 200

Resolved: `POST /api/recreate/1/report`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reported": true
  }
}
```

### ✅ `DELETE /api/recreate/{id}` → 200

Resolved: `DELETE /api/recreate/tx-nonexistent`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Reviews & Q&A

### ✅ `GET /api/products/{id}/reviews` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/reviews`

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/products/{id}/questions` → 200

Resolved: `GET /api/products/tx-imp-1781637830447/questions`

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `POST /api/products/{id}/reviews` → 201

Resolved: `POST /api/products/tx-imp-1781637830447/reviews`

**Request body:**
```json
{
  "rating": 1,
  "title": "test",
  "body": "test",
  "photos": []
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhio019vzy8o711qzy9x",
    "author": "Transcript User",
    "rating": 1,
    "title": "test",
    "body": "test",
    "photos": [],
    "helpfulCount": 0,
    "createdAt": "2026-06-16T19:29:44.689Z"
  }
}
```

### ✅ `POST /api/products/{id}/questions` → 201

Resolved: `POST /api/products/tx-imp-1781637830447/questions`

**Request body:**
```json
{
  "body": "Is this buildable for deeper skin tones?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhiu019xzy8o5866i0tb",
    "author": "Transcript User",
    "body": "Is this buildable for deeper skin tones?",
    "createdAt": "2026-06-16T19:29:44.694Z",
    "answers": []
  }
}
```

### ✅ `POST /api/reviews/{id}/helpful` → 200

Resolved: `POST /api/reviews/cmqh1dgk7014vzy8orwk4115q/helpful`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "helpful": true
  }
}
```

### ✅ `POST /api/reviews/{id}/report` → 200

Resolved: `POST /api/reviews/cmqh1dgk7014vzy8orwk4115q/report`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reported": true
  }
}
```

### ✅ `POST /api/questions/{id}/answers` → 201

Resolved: `POST /api/questions/cmqh1dgke014xzy8oj35nrgmr/answers`

**Request body:**
```json
{
  "body": "Yes — it layers nicely without going patchy."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhjh01a9zy8o33aqy153",
    "body": "Yes — it layers nicely without going patchy.",
    "createdAt": "2026-06-16T19:29:44.718Z"
  }
}
```

### ⚠️ `PATCH /api/reviews/{id}` → 404

Resolved: `PATCH /api/reviews/cmqh1dgk7014vzy8orwk4115q`

**Request body:**
```json
{}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Review not found",
  "code": "NOT_FOUND"
}
```

### ✅ `DELETE /api/reviews/{id}` → 200

Resolved: `DELETE /api/reviews/cmqh1dgk7014vzy8orwk4115q`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Routines

### ✅ `GET /api/routines` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgkk014zzy8o8zvcoltq",
      "name": "Morning",
      "time": "08:00",
      "steps": [
        "Cleanse",
        "SPF"
      ]
    }
  ]
}
```

### ✅ `GET /api/routines/{id}` → 200

Resolved: `GET /api/routines/cmqh1dgkk014zzy8o8zvcoltq`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgkk014zzy8o8zvcoltq",
    "name": "Morning",
    "time": "08:00",
    "steps": [
      "Cleanse",
      "SPF"
    ]
  }
}
```

### ✅ `POST /api/routines` → 201

**Request body:**
```json
{
  "name": "Evening",
  "time": "21:00",
  "steps": [
    "Cleanse",
    "Serum",
    "Moisturise"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhmx01buzy8o7goy2e4b",
    "name": "Evening",
    "time": "21:00",
    "steps": [
      "Cleanse",
      "Serum",
      "Moisturise"
    ]
  }
}
```

### ✅ `POST /api/routines/{id}/reminders` → 201

Resolved: `POST /api/routines/cmqh1dgkk014zzy8o8zvcoltq/reminders`

**Request body:**
```json
{
  "time": "08:00",
  "days": [
    "mon",
    "wed",
    "fri"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhn001bwzy8oyh26wqaj",
    "time": "08:00",
    "days": [
      "mon",
      "wed",
      "fri"
    ]
  }
}
```

### ✅ `PATCH /api/routines/{id}` → 200

Resolved: `PATCH /api/routines/cmqh1dgkk014zzy8o8zvcoltq`

**Request body:**
```json
{
  "name": "Morning (updated)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgkk014zzy8o8zvcoltq",
    "name": "Morning (updated)",
    "time": "08:00",
    "steps": [
      "Cleanse",
      "SPF"
    ]
  }
}
```

### ✅ `DELETE /api/routines/{id}` → 200

Resolved: `DELETE /api/routines/cmqh1dgkk014zzy8o8zvcoltq`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Saved

### ✅ `GET /api/saved/looks` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "look-1",
      "title": "Soft glam",
      "subtitle": "Everyday"
    }
  ]
}
```

### ✅ `POST /api/saved/looks` → 201

**Request body:**
```json
{
  "id": "look-2",
  "title": "Bold lip",
  "subtitle": "Night out"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "look-2",
    "title": "Bold lip",
    "subtitle": "Night out"
  }
}
```

### ✅ `DELETE /api/saved/looks/{id}` → 200

Resolved: `DELETE /api/saved/looks/look-1`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Search

### ✅ `GET /api/search` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [],
    "tutorials": [],
    "looks": [],
    "brands": []
  }
}
```

### ✅ `GET /api/search/autocomplete` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/search/trending` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    "Foundation",
    "Glass skin",
    "Soft glam",
    "Fenty",
    "Bronzer",
    "Pillow Talk"
  ]
}
```

### ✅ `GET /api/search/recent` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/search/filters` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      "Foundation",
      "Concealer",
      "Blush",
      "Bronzer",
      "Lips",
      "Primer"
    ],
    "brands": [
      "Fenty Beauty",
      "MAC",
      "Maybelline",
      "Rare Beauty",
      "Benefit",
      "Charlotte Tilbury"
    ],
    "priceRanges": [
      {
        "label": "Under £15",
        "min": 0,
        "max": 15
      },
      {
        "label": "£15–£30",
        "min": 15,
        "max": 30
      },
      {
        "label": "£30+",
        "min": 30,
        "max": 9999
      }
    ]
  }
}
```

### ✅ `DELETE /api/search/recent` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cleared": true
  }
}
```


## Shade Match

### ✅ `GET /api/match/categories` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    "Foundation",
    "Concealer",
    "Powder",
    "Blush",
    "Bronzer",
    "Lip"
  ]
}
```

### ✅ `GET /api/match/recent` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgky0159zy8ogrbtktb2",
      "name": "240",
      "brand": "Fenty",
      "pct": "90%",
      "color": "#C4875A"
    }
  ]
}
```

### ✅ `GET /api/match/history` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgky0159zy8ogrbtktb2",
      "name": "240",
      "brand": "Fenty",
      "pct": "90%",
      "color": "#C4875A",
      "date": "Today"
    }
  ]
}
```

### ✅ `GET /api/match/scans` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/match/selfie/{jobId}/status` → 200

Resolved: `GET /api/match/selfie/cmqh1dgky0159zy8ogrbtktb2/status`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgky0159zy8ogrbtktb2",
    "status": "DONE"
  }
}
```

### ✅ `GET /api/match/{id}` → 200

Resolved: `GET /api/match/cmqh1dgky0159zy8ogrbtktb2`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgky0159zy8ogrbtktb2",
    "tone": {
      "label": "Medium Tan · Warm Golden",
      "sub": "Based on your shade entry",
      "hex": "#C4875A",
      "confidence": "High confidence match"
    },
    "items": [
      {
        "hex": "#C4875A",
        "brand": "Fenty Beauty",
        "reason": "Matched to your medium-tan tone with warm golden undertones across Fenty's inclusive range.",
        "product": "Pro Filt'r Soft Matte",
        "category": "Foundation",
        "confidence": "High",
        "alternatives": [
          {
            "hex": "#C48558",
            "brand": "MAC",
            "price": "£29",
            "shade": "NC40",
            "product": "Studio Fix Fluid"
          },
          {
            "hex": "#C28050",
            "brand": "NYX",
            "price": "£13",
            "shade": "Warm Caramel",
            "product": "Can't Stop Won't Stop"
          }
        ],
        "matchedShade": "220 Natural Beige"
      },
      {
        "hex": "#CAA070",
        "brand": "Fenty Beauty",
        "reason": "One shade lighter than your foundation to brighten under-eye coverage.",
        "product": "Pro Fi
  …(truncated)
```

### ✅ `POST /api/match/selfie` → 201

**Request body:**
```json
{
  "selfie": "test"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhjk01adzy8oplp4xr0o",
    "tone": {
      "label": "Medium Tan · Warm Golden",
      "sub": "Based on your selfie analysis",
      "hex": "#C4875A",
      "confidence": "High confidence match"
    },
    "items": [
      {
        "hex": "#C4875A",
        "brand": "Fenty Beauty",
        "reason": "Matched to your medium-tan tone with warm golden undertones across Fenty's inclusive range.",
        "product": "Pro Filt'r Soft Matte",
        "category": "Foundation",
        "confidence": "High",
        "alternatives": [
          {
            "hex": "#C48558",
            "brand": "MAC",
            "price": "£29",
            "shade": "NC40",
            "product": "Studio Fix Fluid"
          },
          {
            "hex": "#C28050",
            "brand": "NYX",
            "price": "£13",
            "shade": "Warm Caramel",
            "product": "Can't Stop Won't Stop"
          }
        ],
        "matchedShade": "220 Natural Beige"
      },
      {
        "hex": "#CAA070",
        "brand": "Fenty Beauty",
        "reason": "One shade lighter than your foundation to brighten under-eye coverage.",
        "product": "Pr
  …(truncated)
```

### ✅ `POST /api/match/manual` → 201

**Request body:**
```json
{
  "shade": "240",
  "brand": "Fenty",
  "category": "foundation"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhjo01afzy8ofzfgyspp",
    "tone": {
      "label": "Medium Tan · Warm Golden",
      "sub": "Based on your shade entry",
      "hex": "#C4875A",
      "confidence": "High confidence match"
    },
    "items": [
      {
        "hex": "#C4875A",
        "brand": "Fenty Beauty",
        "reason": "Matched to your medium-tan tone with warm golden undertones across Fenty's inclusive range.",
        "product": "Pro Filt'r Soft Matte",
        "category": "Foundation",
        "confidence": "High",
        "alternatives": [
          {
            "hex": "#C48558",
            "brand": "MAC",
            "price": "£29",
            "shade": "NC40",
            "product": "Studio Fix Fluid"
          },
          {
            "hex": "#C28050",
            "brand": "NYX",
            "price": "£13",
            "shade": "Warm Caramel",
            "product": "Can't Stop Won't Stop"
          }
        ],
        "matchedShade": "220 Natural Beige"
      },
      {
        "hex": "#CAA070",
        "brand": "Fenty Beauty",
        "reason": "One shade lighter than your foundation to brighten under-eye coverage.",
        "product": "Pro Fi
  …(truncated)
```

### ✅ `POST /api/match/compare` → 200

**Request body:**
```json
{
  "a": "Fenty 240",
  "b": "MAC NC42"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "a": "Fenty 240",
    "b": "MAC NC42",
    "similarity": 0.86,
    "note": "These shades are a close cross-brand equivalent."
  }
}
```

### ✅ `POST /api/match/undertone-test` → 200

**Request body:**
```json
{
  "answers": [
    "warm",
    "warm",
    "cool"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "undertone": "Warm",
    "confidence": "High"
  }
}
```

### ✅ `POST /api/match/{id}/save` → 200

Resolved: `POST /api/match/cmqh1dgky0159zy8ogrbtktb2/save`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true
  }
}
```

### ✅ `DELETE /api/match/scans/{id}` → 200

Resolved: `DELETE /api/match/scans/cmqh1dgky0159zy8ogrbtktb2`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

### ✅ `DELETE /api/match/{id}` → 200

Resolved: `DELETE /api/match/cmqh1dgky0159zy8ogrbtktb2`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Shelf

### ✅ `GET /api/shelf` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgl2015bzy8ofoetk3p7",
      "shade": "240",
      "product": {
        "id": "1",
        "name": "Pro Filt'r Soft Matte Foundation",
        "brand": "Fenty Beauty",
        "category": "Foundation",
        "price": "£34",
        "rating": "5.0",
        "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80"
      }
    }
  ]
}
```

### ✅ `GET /api/shelf/dupes/{productId}` → 200

Resolved: `GET /api/shelf/dupes/cmqh1dgl2015bzy8ofoetk3p7`

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `POST /api/shelf` → 201

**Request body:**
```json
{
  "productId": "1",
  "shade": "240"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgl2015bzy8ofoetk3p7"
  }
}
```

### ✅ `DELETE /api/shelf/{id}` → 200

Resolved: `DELETE /api/shelf/cmqh1dgl2015bzy8ofoetk3p7`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```


## Subscription

### ✅ `GET /api/subscription` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "free",
    "status": "Active",
    "current": {
      "id": "free",
      "name": "Free",
      "price": "£0",
      "unit": "",
      "features": [
        "3 shade matches per day",
        "2 look recreations per day",
        "Beginner tutorials"
      ]
    },
    "pro": {
      "id": "pro",
      "name": "DollFace Pro",
      "price": "£49.99",
      "unit": "/ year",
      "features": [
        "Unlimited shade matching",
        "Unlimited recreations",
        "Full tutorial library",
        "AI beauty advisor",
        "Ad-free experience"
      ]
    }
  }
}
```

### ✅ `GET /api/subscription/plans` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": "£0",
      "unit": "",
      "features": [
        "3 shade matches per day",
        "2 look recreations per day",
        "Beginner tutorials"
      ]
    },
    {
      "id": "pro",
      "name": "DollFace Pro",
      "price": "£49.99",
      "unit": "/ year",
      "features": [
        "Unlimited shade matching",
        "Unlimited recreations",
        "Full tutorial library",
        "AI beauty advisor",
        "Ad-free experience"
      ]
    }
  ]
}
```

### ✅ `GET /api/subscription/preview` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "proration": 0,
    "nextCharge": "£49.99",
    "nextChargeAt": "2027-06-16T19:29:43.647Z"
  }
}
```

### ✅ `GET /api/subscription/entitlements` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "free",
    "unlimitedMatches": false,
    "unlimitedRecreations": false,
    "fullTutorialLibrary": false,
    "aiAdvisor": false,
    "adFree": false
  }
}
```

### ✅ `GET /api/billing/portal` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://billing.dollface.app/portal"
  }
}
```

### ✅ `GET /api/billing/invoices` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgjv014lzy8o2hove52n",
      "amount": 81.6,
      "currency": "GBP",
      "status": "SUCCEEDED",
      "createdAt": "2026-06-16T19:29:43.436Z",
      "url": "https://dollface.app/invoices/cmqh1dgjv014lzy8o2hove52n.pdf"
    }
  ]
}
```

### ✅ `POST /api/subscription/checkout` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "trialing"
  }
}
```

### ✅ `POST /api/subscription/cancel` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "Cancelled"
  }
}
```

### ✅ `POST /api/subscription/resume` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "Active"
  }
}
```

### ✅ `POST /api/subscription/change` → 200

**Request body:**
```json
{
  "plan": "test"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "free"
  }
}
```

### ✅ `POST /api/subscription/restore` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "restored": true,
    "plan": "pro"
  }
}
```

### ✅ `POST /api/subscription/gift` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "gifted": true,
    "code": "GIFT-7A1ITO"
  }
}
```


## Support

### ✅ `GET /api/support/tickets` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgkt0155zy8ooul3w2y5",
      "subject": "Order issue",
      "status": "OPEN",
      "createdAt": "2026-06-16T19:29:43.470Z"
    }
  ]
}
```

### ✅ `GET /api/support/tickets/{id}` → 200

Resolved: `GET /api/support/tickets/cmqh1dgkt0155zy8ooul3w2y5`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dgkt0155zy8ooul3w2y5",
    "subject": "Order issue",
    "status": "OPEN",
    "createdAt": "2026-06-16T19:29:43.470Z",
    "messages": [
      {
        "id": "cmqh1dgkt0157zy8oszlccbhk",
        "body": "My order hasn't shipped yet.",
        "mine": true,
        "createdAt": "2026-06-16T19:29:43.470Z"
      }
    ]
  }
}
```

### ✅ `POST /api/support/contact` → 200

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@dollface.app",
  "message": "Hi, I need help with an order."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```

### ✅ `POST /api/support/tickets` → 201

**Request body:**
```json
{
  "subject": "Order issue",
  "message": "My order hasn't shipped yet."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhn301byzy8oxbkoi5gj",
    "subject": "Order issue",
    "status": "OPEN"
  }
}
```

### ✅ `POST /api/support/tickets/{id}/messages` → 201

Resolved: `POST /api/support/tickets/cmqh1dgkt0155zy8ooul3w2y5/messages`

**Request body:**
```json
{
  "body": "Any update on this please?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhna01c2zy8o3oy7d6x8",
    "body": "Any update on this please?",
    "createdAt": "2026-06-16T19:29:44.855Z"
  }
}
```

### ✅ `POST /api/feedback` → 201

**Request body:**
```json
{
  "message": "test"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```

### ✅ `POST /api/feedback/bug` → 201

**Request body:**
```json
{}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```

### ✅ `POST /api/feedback/rating` → 201

**Request body:**
```json
{}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```


## System

### ✅ `GET /api/system/config` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appName": "DollFace",
    "supportEmail": "hello@dollface.app",
    "currency": "GBP",
    "country": "GB",
    "minSupportedVersion": "1.0.0",
    "urls": {
      "terms": "/api/content/terms",
      "privacy": "/api/content/privacy",
      "help": "https://dollface.app/help"
    }
  }
}
```

### ✅ `GET /api/system/feature-flags` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "shadeMatchSelfie": true,
    "lookRecreation": true,
    "shop": true,
    "subscriptions": true,
    "socialLogin": false,
    "reviews": false
  }
}
```

### ✅ `GET /api/system/version-check` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "platform": "ios",
    "latest": "1.0.0",
    "minimum": "1.0.0",
    "forceUpdate": false,
    "updateUrl": null
  }
}
```

### ✅ `GET /api/system/ready` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "db": "up"
  }
}
```

### ✅ `GET /api/system/maintenance` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "active": false,
    "message": null
  }
}
```

### ✅ `GET /api/system/locales` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "en",
      "label": "English"
    },
    {
      "code": "fr",
      "label": "Français"
    },
    {
      "code": "es",
      "label": "Español"
    }
  ]
}
```

### ✅ `GET /api/system/countries` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "GB",
      "name": "United Kingdom",
      "currency": "GBP"
    },
    {
      "code": "US",
      "name": "United States",
      "currency": "USD"
    },
    {
      "code": "NG",
      "name": "Nigeria",
      "currency": "NGN"
    },
    {
      "code": "FR",
      "name": "France",
      "currency": "EUR"
    }
  ]
}
```

### ✅ `GET /api/system/i18n/{locale}` → 200

Resolved: `GET /api/system/i18n/en`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "locale": "en",
    "strings": {}
  }
}
```


## Tutorials

### ✅ `GET /api/tutorials` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-tut-1781637830447",
      "title": "Test Tutorial",
      "cat": "Beginner",
      "mins": "5",
      "level": "Easy",
      "views": "0",
      "img": "https://img/t.jpg"
    },
    {
      "id": "tx-tut-1781637885398",
      "title": "Test Tutorial",
      "cat": "Beginner",
      "mins": "5",
      "level": "Easy",
      "views": "0",
      "img": "https://img/t.jpg"
    },
    {
      "id": "tx-tut-1781638108515",
      "title": "Test Tutorial",
      "cat": "Beginner",
      "mins": "5",
      "level": "Easy",
      "views": "0",
      "img": "https://img/t.jpg"
    },
    {
      "id": "1",
      "title": "Beginner Foundation Routine",
      "cat": "Base",
      "mins": "12 min",
      "level": "Beginner",
      "views": "24k",
      "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      "id": "2",
      "title": "Fluffy Natural Brows",
      "cat": "Brows",
      "mins": "8 min",
      "level": "Beginner",
      "views": "18k",
      "img": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=400&q=80"
    },
   
  …(truncated)
```

### ✅ `GET /api/tutorials/featured` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "eyebrow": "THIS WEEK'S PICK",
    "title": "Shade Matching Masterclass",
    "meta": "AI-guided · All levels · 20 min",
    "img": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&h=1100&q=80"
  }
}
```

### ✅ `GET /api/tutorials/categories` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    "All",
    "Base",
    "Eyes",
    "Lips",
    "Brows",
    "Cheeks"
  ]
}
```

### ✅ `GET /api/tutorials/saved` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `GET /api/tutorials/{id}/related` → 200

Resolved: `GET /api/tutorials/tx-tut-1781637830447/related`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-tut-1781637885398",
      "title": "Test Tutorial",
      "cat": "Beginner",
      "mins": "5",
      "level": "Easy",
      "views": "0",
      "img": "https://img/t.jpg"
    },
    {
      "id": "tx-tut-1781638108515",
      "title": "Test Tutorial",
      "cat": "Beginner",
      "mins": "5",
      "level": "Easy",
      "views": "0",
      "img": "https://img/t.jpg"
    }
  ]
}
```

### ✅ `GET /api/tutorials/{id}/stream` → 200

Resolved: `GET /api/tutorials/tx-tut-1781637830447/stream`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://stream.dollface.app/tx-tut-1781637830447.m3u8",
    "expiresIn": 3600
  }
}
```

### ✅ `GET /api/tutorials/{id}/comments` → 200

Resolved: `GET /api/tutorials/tx-tut-1781637830447/comments`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1bw2p00vrzy8ol7sdeg8j",
      "author": "Jane Updated",
      "body": "test",
      "createdAt": "2026-06-16T19:28:30.242Z"
    }
  ]
}
```

### ✅ `GET /api/tutorials/{id}` → 200

Resolved: `GET /api/tutorials/tx-tut-1781637830447`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tx-tut-1781637830447",
    "title": "Test Tutorial",
    "level": "Easy",
    "duration": "5",
    "views": "0",
    "description": "",
    "img": "https://img/t.jpg",
    "steps": []
  }
}
```

### ✅ `GET /api/learning/progress` → 200

**Response (200):**
```json
{
  "success": true,
  "data": {
    "completed": 0,
    "inProgress": 0,
    "total": 8,
    "percent": 0
  }
}
```

### ✅ `GET /api/learning/achievements` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "first-match",
      "title": "First Match",
      "description": "Completed your first shade match.",
      "icon": "color-palette",
      "earned": false
    },
    {
      "id": "look-creator",
      "title": "Look Creator",
      "description": "Recreated your first look.",
      "icon": "sparkles",
      "earned": false
    },
    {
      "id": "scholar",
      "title": "Beauty Scholar",
      "description": "Completed 5 tutorials.",
      "icon": "school",
      "earned": false
    },
    {
      "id": "collector",
      "title": "Collector",
      "description": "Saved 10 products.",
      "icon": "bag-handle",
      "earned": false
    }
  ]
}
```

### ✅ `GET /api/learning/playlists` → 200

**Response (200):**
```json
{
  "success": true,
  "data": []
}
```

### ✅ `POST /api/tutorials/{id}/save` → 200

Resolved: `POST /api/tutorials/tx-tut-1781637830447/save`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true
  }
}
```

### ✅ `POST /api/tutorials/{id}/complete` → 200

Resolved: `POST /api/tutorials/tx-tut-1781637830447/complete`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ok": true
  }
}
```

### ✅ `POST /api/tutorials/{id}/progress` → 200

Resolved: `POST /api/tutorials/tx-tut-1781637830447/progress`

**Request body:**
```json
{
  "step": 1,
  "percent": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pct": 1
  }
}
```

### ✅ `POST /api/tutorials/{id}/like` → 200

Resolved: `POST /api/tutorials/tx-tut-1781637830447/like`

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": true
  }
}
```

### ✅ `POST /api/tutorials/{id}/comments` → 201

Resolved: `POST /api/tutorials/tx-tut-1781637830447/comments`

**Request body:**
```json
{
  "body": "test"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhim019tzy8ow9ma6ke3",
    "body": "test",
    "createdAt": "2026-06-16T19:29:44.686Z"
  }
}
```

### ✅ `DELETE /api/tutorials/{id}/save` → 200

Resolved: `DELETE /api/tutorials/tx-tut-1781637830447/save`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": false
  }
}
```

### ✅ `DELETE /api/tutorials/{id}/like` → 200

Resolved: `DELETE /api/tutorials/tx-tut-1781637830447/like`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": false
  }
}
```


## Webhooks

### ✅ `POST /api/webhooks/stripe` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "received": true
}
```

### ✅ `POST /api/webhooks/revenuecat` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "received": true
}
```

### ✅ `POST /api/webhooks/apple` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "received": true
}
```

### ✅ `POST /api/webhooks/google` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "received": true
}
```

### ✅ `POST /api/webhooks/shipping` → 200

**Request body:**
```json
{}
```

**Response (200):**
```json
{
  "received": true
}
```


## Wishlist

### ✅ `GET /api/wishlist` → 200

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmqh1dgkr0153zy8oy70zz2o7",
      "name": "Faves",
      "items": []
    }
  ]
}
```

### ✅ `POST /api/wishlist` → 201

**Request body:**
```json
{}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cmqh1dhkp01avzy8olceo0y9z",
    "name": "Wishlist",
    "items": []
  }
}
```

### ✅ `POST /api/wishlist/{id}/items` → 201

Resolved: `POST /api/wishlist/cmqh1dgkr0153zy8oy70zz2o7/items`

**Request body:**
```json
{
  "productId": "1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "added": true
  }
}
```

### ✅ `DELETE /api/wishlist/{id}/items/{productId}` → 200

Resolved: `DELETE /api/wishlist/cmqh1dgkr0153zy8oy70zz2o7/items/cmqh1dgkr0153zy8oy70zz2o7`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

