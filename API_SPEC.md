# DollFace API — Complete Specification

The full endpoint surface for the DollFace platform: the **mobile app**, the
**web** site, and **admin/ops**. Grounded in the real app (`dollface-mobile`)
plus everything a production beauty-tech + commerce + content + AI product needs.

The app currently fakes a subset via `dollface-mobile/lib/mockApi.ts`; this is
the contract to build against. Match the JSON shapes exactly so the app only
needs `EXPO_PUBLIC_API_URL` set.

**Tier column:** `M` = MVP / first launch · `1` = v1.x · `2` = later/admin.

---

## 1. Conventions

- **Base URL:** `{API_BASE_URL}` (local `http://localhost:4200/api`). Versioned: prefix everything with `/v1`.
- **Auth:** `Authorization: Bearer <accessToken>` (JWT, ~15 min). Refresh via `/auth/refresh-token` (~30 d). On `401` the app refreshes once then retries (`lib/api.ts`).
- **Envelope:** success `{ "success": true, "data": ... }` · error `{ "success": false, "message": string, "code"?: string, "errors"?: { field: msg } }`.
- **Status:** 200/201/204 · 400 validation · 401 auth · 403 forbidden · 404 · 409 conflict · 422 · 429 rate-limit · 5xx.
- **Pagination:** `?page=&limit=&cursor=` → `{ items, page, limit, total, hasMore, nextCursor }`.
- **Sorting/filter:** `?sort=field:asc&filter[key]=val`.
- **Uploads:** `multipart/form-data`, ≤10 MB, `image/jpeg|png|webp`; returns hosted `url`.
- **Idempotency:** `Idempotency-Key` header on money/mutations.
- **Localisation:** `Accept-Language`, `?currency=GBP&country=GB`.
- **Conditional:** `ETag` / `If-None-Match` on catalog reads.
- **Webhooks:** signed (`X-DollFace-Signature`).

---

## 2. Core data models (abridged — see §1 of prior draft for full field lists)

`User, Session, Device, BeautyProfile, ShadeMatch, ShadeMatchResult, SavedShade,
LookRecreation, LookVersion, Tutorial, TutorialStep, LearningProgress, Achievement,
Product, ProductVariant, Brand, Review, Question, Answer, WishlistItem, Cart,
CartItem, Address, Order, OrderItem, Shipment, Return, PaymentMethod, Transaction,
Subscription, Plan, Coupon, Referral, Notification, NotificationPref, Routine,
SearchResult, FeedItem, Banner, Article, FaqItem, SupportTicket, AnalyticsEvent,
MediaAsset, FeatureFlag, AppConfig, Waitlist`.

---

# 3. ENDPOINTS

## 3.1 Auth & sessions — `/auth`
| # | M/1/2 | Method | Path | Purpose |
|--|--|--|--|--|
|1|M|POST|`/auth/register`|email+password signup → `{user,tokens}`|
|2|M|POST|`/auth/login`|→ `{user,tokens}`|
|3|M|POST|`/auth/logout`|revoke current refresh token|
|4|M|POST|`/auth/refresh-token`|`{refreshToken}` → `{accessToken}` (rotate)|
|5|M|POST|`/auth/forgot-password`|send reset link|
|6|M|POST|`/auth/reset-password`|`{token,password}`|
|7|M|GET|`/auth/me`|session bootstrap → `{user,beautyProfile,subscription,flags}`|
|8|M|GET|`/auth/check-email`|`?email=` → `{available}`|
|9|1|POST|`/auth/verify-email`|`{token}`|
|10|1|POST|`/auth/resend-verification`||
|11|1|POST|`/auth/change-email`|`{newEmail,password}` → re-verify|
|12|M|POST|`/auth/change-password`|`{currentPassword,newPassword}`|
|13|1|POST|`/auth/social/google`|`{idToken}` → `{user,tokens,isNewUser}`|
|14|1|POST|`/auth/social/apple`|`{idToken}`|
|15|2|POST|`/auth/social/link`|link a provider to existing account|
|16|2|DELETE|`/auth/social/:provider`|unlink|
|17|2|POST|`/auth/magic-link`|passwordless request|
|18|2|POST|`/auth/magic-link/verify`||
|19|2|POST|`/auth/otp/request`|phone OTP|
|20|2|POST|`/auth/otp/verify`||
|21|1|POST|`/auth/mfa/setup`|TOTP enroll → `{secret,qr}`|
|22|1|POST|`/auth/mfa/verify`|confirm enroll|
|23|1|POST|`/auth/mfa/challenge`|verify at login|
|24|1|DELETE|`/auth/mfa`|disable|
|25|1|GET|`/auth/sessions`|list active sessions/devices|
|26|1|DELETE|`/auth/sessions/:id`|revoke one|
|27|1|DELETE|`/auth/sessions`|revoke all others (logout everywhere)|

## 3.2 Account & profile — `/me`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|28|M|GET|`/me`|current user|
|29|M|PATCH|`/me`|name, avatarUrl, bio|
|30|1|POST|`/me/avatar`|multipart → `{avatarUrl}`|
|31|1|DELETE|`/me/avatar`||
|32|M|DELETE|`/me`|delete account (cascade, GDPR)|
|33|M|GET|`/me/stats`|`{looksSaved,tutorialsDone,shadesMatched}`|
|34|1|POST|`/me/export`|request data export (GDPR) → emailed|
|35|1|GET|`/me/export/:jobId`|export status/download|
|36|2|GET|`/me/activity`|account activity log|
|37|2|POST|`/me/deactivate`|soft-disable (vs delete)|
|38|2|POST|`/me/reactivate`||

## 3.3 Preferences & consent — `/me/settings`, `/me/consents`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|39|M|GET|`/me/settings`|all toggles|
|40|M|PATCH|`/me/settings`|push/email/tips/analytics/personalisation/storeScans|
|41|1|GET|`/me/preferences`|language, theme, currency, country, units|
|42|1|PATCH|`/me/preferences`||
|43|1|GET|`/me/consents`|marketing, data-processing, cookies|
|44|1|PATCH|`/me/consents`||

## 3.4 Beauty profile & onboarding — `/beauty-profile`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|45|M|GET|`/beauty-profile`|current profile|
|46|M|PUT|`/beauty-profile`|upsert full profile|
|47|M|PATCH|`/beauty-profile`|per-step partial (goals, skin type, undertone…)|
|48|M|POST|`/beauty-profile/complete`|finish onboarding → `onboardingComplete:true`|
|49|M|GET|`/beauty-profile/options`|chip catalogs (goals, concerns, brands, tones)|
|50|1|POST|`/beauty-profile/re-analyse`|re-run from a new selfie|
|51|2|GET|`/beauty-profile/history`|profile versions over time|

## 3.5 Shade match — `/match`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|52|M|POST|`/match/selfie`|multipart `selfie` → `ShadeMatch`|
|53|M|POST|`/match/manual`|`{shade,brand?,category}` → `ShadeMatch`|
|54|1|GET|`/match/selfie/:jobId/status`|async analysis poll|
|55|M|GET|`/match/:id`|a result set|
|56|M|GET|`/match/history`|paginated|
|57|M|GET|`/match/recent`|home/Match strip|
|58|M|POST|`/match/:id/save`||
|59|1|DELETE|`/match/:id`||
|60|M|GET|`/match/categories`|Foundation/Concealer/…|
|61|1|POST|`/match/compare`|compare two shades / convert cross-brand|
|62|1|GET|`/match/scans`|selfie scan history|
|63|1|DELETE|`/match/scans/:id`||
|64|2|POST|`/match/undertone-test`|guided undertone quiz scoring|

## 3.6 Shade library / "my shelf" — `/shelf`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|65|1|GET|`/shelf`|user's owned/saved shades|
|66|1|POST|`/shelf`|add a shade `{productId,shade}`|
|67|1|DELETE|`/shelf/:id`||
|68|2|GET|`/shelf/dupes/:productId`|cheaper equivalents|

## 3.7 Recreate / look analysis — `/recreate`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|69|M|POST|`/recreate/upload`|multipart `image` → `{id,status:PROCESSING}`|
|70|M|GET|`/recreate/:id/status`|poll (Analyzing screen)|
|71|M|GET|`/recreate/:id`|breakdown + 3 versions|
|72|M|POST|`/recreate/:id/save`||
|73|1|GET|`/recreate/history`||
|74|1|DELETE|`/recreate/:id`||
|75|2|GET|`/recreate/gallery`|public trending recreations|
|76|2|POST|`/recreate/:id/share`|create share link|
|77|2|POST|`/recreate/:id/report`||

## 3.8 Tutorials & learning — `/tutorials`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|78|M|GET|`/tutorials`|`?category=&level=&search=&page=`|
|79|M|GET|`/tutorials/featured`|this week's pick|
|80|M|GET|`/tutorials/:id`|detail + steps|
|81|M|GET|`/tutorials/categories`||
|82|M|POST|`/tutorials/:id/save`||
|83|M|DELETE|`/tutorials/:id/save`||
|84|M|GET|`/tutorials/saved`||
|85|M|POST|`/tutorials/:id/complete`||
|86|1|GET|`/tutorials/:id/related`||
|87|1|POST|`/tutorials/:id/progress`|`{step,percent}` resume tracking|
|88|1|GET|`/tutorials/:id/stream`|signed video URL|
|89|2|POST|`/tutorials/:id/like`||
|90|2|GET|`/tutorials/:id/comments`||
|91|2|POST|`/tutorials/:id/comments`||
|92|2|GET|`/learning/progress`|overall progress|
|93|2|GET|`/learning/achievements`|badges|
|94|2|GET|`/learning/playlists`|curated collections|

## 3.9 Products / catalog — `/products`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|95|M|GET|`/products`|`?category=&brand=&search=&sort=&page=&filter[…]`|
|96|M|GET|`/products/:id`|detail (shades, highlights, rating)|
|97|M|GET|`/products/categories`||
|98|1|GET|`/products/:id/variants`|shade/size variants + stock|
|99|1|GET|`/products/:id/recommendations`|"you may also like"|
|100|1|GET|`/products/:id/related`||
|101|1|GET|`/products/recently-viewed`||
|102|1|POST|`/products/:id/view`|track view|
|103|1|GET|`/products/trending`||
|104|1|GET|`/products/new`||
|105|2|GET|`/products/:id/ingredients`||
|106|2|GET|`/products/:id/price-history`||
|107|2|POST|`/products/:id/restock-alert`||
|108|2|GET|`/products/barcode/:code`|barcode lookup|

## 3.10 Brands — `/brands`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|109|1|GET|`/brands`|list|
|110|1|GET|`/brands/:id`|brand detail + products|
|111|2|POST|`/brands/:id/follow`||
|112|2|DELETE|`/brands/:id/follow`||

## 3.11 Reviews & Q&A — `/reviews`, `/products/:id/questions`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|113|1|GET|`/products/:id/reviews`|`?sort=&rating=`|
|114|1|POST|`/products/:id/reviews`|`{rating,title,body,photos[]}`|
|115|1|PATCH|`/reviews/:id`|edit own|
|116|1|DELETE|`/reviews/:id`||
|117|1|POST|`/reviews/:id/helpful`|vote|
|118|2|POST|`/reviews/:id/report`||
|119|2|GET|`/products/:id/questions`||
|120|2|POST|`/products/:id/questions`||
|121|2|POST|`/questions/:id/answers`||

## 3.12 Wishlist & saved — `/wishlist`, `/saved`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|122|M|GET|`/products/saved`|Saved Products screen|
|123|M|POST|`/products/:id/save`||
|124|M|DELETE|`/products/:id/save`||
|125|M|GET|`/saved/looks`|Saved Looks|
|126|M|POST|`/saved/looks`||
|127|M|DELETE|`/saved/looks/:id`||
|128|2|GET|`/wishlist`|multiple named wishlists|
|129|2|POST|`/wishlist`|create list|
|130|2|POST|`/wishlist/:id/items`||

## 3.13 Cart — `/cart`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|131|M|GET|`/cart`||
|132|M|POST|`/cart/items`|`{productId,variantId?,shade?,qty}`|
|133|M|PATCH|`/cart/items/:id`|`{qty}`|
|134|M|DELETE|`/cart/items/:id`||
|135|M|DELETE|`/cart`|clear|
|136|1|POST|`/cart/merge`|merge guest cart on login|
|137|1|POST|`/cart/coupon`|apply promo|
|138|1|DELETE|`/cart/coupon`||
|139|1|GET|`/cart/estimate`|tax + shipping estimate|

## 3.14 Addresses — `/addresses`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|140|1|GET|`/addresses`||
|141|1|POST|`/addresses`||
|142|1|PATCH|`/addresses/:id`||
|143|1|DELETE|`/addresses/:id`||
|144|1|POST|`/addresses/:id/default`||
|145|2|POST|`/addresses/validate`|address verification|

## 3.15 Checkout & orders — `/checkout`, `/orders`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|146|1|POST|`/checkout/session`|create checkout (Idempotency-Key)|
|147|1|GET|`/checkout/shipping-options`||
|148|1|POST|`/orders`|place order → `Order`|
|149|1|GET|`/orders`|history|
|150|1|GET|`/orders/:id`||
|151|1|POST|`/orders/:id/cancel`||
|152|1|POST|`/orders/:id/reorder`||
|153|1|GET|`/orders/:id/tracking`|shipment tracking|
|154|1|GET|`/orders/:id/invoice`|PDF/url|
|155|2|POST|`/orders/:id/returns`|start a return|
|156|2|GET|`/returns/:id`||

## 3.16 Payments — `/payments`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|157|1|GET|`/payments/methods`||
|158|1|POST|`/payments/methods`|add (Stripe SetupIntent)|
|159|1|DELETE|`/payments/methods/:id`||
|160|1|POST|`/payments/methods/:id/default`||
|161|1|POST|`/payments/intent`|PaymentIntent for an order|
|162|1|POST|`/payments/iap/apple/verify`|App Store receipt|
|163|1|POST|`/payments/iap/google/verify`|Play purchase token|
|164|1|GET|`/payments/transactions`|history|
|165|2|POST|`/payments/:id/refund`|admin/refund|

## 3.17 Subscriptions & billing — `/subscription`, `/billing`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|166|M|GET|`/subscription`|current plan/status|
|167|M|GET|`/subscription/plans`|Free vs Pro|
|168|1|POST|`/subscription/checkout`|start trial/subscribe|
|169|1|POST|`/subscription/cancel`||
|170|1|POST|`/subscription/resume`||
|171|1|POST|`/subscription/change`|upgrade/downgrade|
|172|1|GET|`/subscription/preview`|proration preview|
|173|1|POST|`/subscription/restore`|restore IAP|
|174|1|GET|`/subscription/entitlements`|what Pro unlocks|
|175|1|GET|`/billing/portal`|hosted billing portal url|
|176|2|GET|`/billing/invoices`||
|177|2|POST|`/subscription/gift`|gift a subscription|

## 3.18 Promotions, coupons & referrals — `/promos`, `/referrals`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|178|1|POST|`/promos/validate`|`{code}` → discount|
|179|2|GET|`/promos/active`|current campaigns/banners|
|180|1|GET|`/referrals/me`|your code + stats|
|181|1|POST|`/referrals/redeem`|`{code}`|
|182|2|GET|`/credits`|store credit balance|

## 3.19 Notifications — `/notifications`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|183|M|GET|`/notifications`|inbox (paginated)|
|184|M|GET|`/notifications/unread-count`|home bell badge|
|185|M|POST|`/notifications/:id/read`||
|186|M|POST|`/notifications/read-all`||
|187|1|DELETE|`/notifications/:id`||
|188|1|GET|`/notifications/preferences`|per-channel/type|
|189|1|PATCH|`/notifications/preferences`||
|190|2|POST|`/notifications/:id/snooze`||

## 3.20 Push & devices — `/devices`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|191|1|POST|`/devices`|register `{expoPushToken,platform,appVersion}`|
|192|1|DELETE|`/devices/:token`|unregister on logout|
|193|2|POST|`/devices/test-push`|send self a test|

## 3.21 Routines & reminders — `/routines`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|194|1|GET|`/routines`||
|195|1|POST|`/routines`|`{name,time,steps[]}`|
|196|1|GET|`/routines/:id`||
|197|1|PATCH|`/routines/:id`||
|198|1|DELETE|`/routines/:id`||
|199|2|POST|`/routines/:id/reminders`|schedule reminders|

## 3.22 Search & discovery — `/search`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|200|1|GET|`/search`|global `?q=&type=products,tutorials,looks,brands`|
|201|1|GET|`/search/autocomplete`|`?q=` suggestions|
|202|1|GET|`/search/trending`|trending terms|
|203|1|GET|`/search/recent`|user's recent searches|
|204|1|DELETE|`/search/recent`|clear|
|205|2|GET|`/search/filters`|facets for a query|

## 3.23 Home feed & content/CMS — `/feed`, `/content`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|206|M|GET|`/feed/home`|aggregated Home payload|
|207|1|GET|`/content/banners`|promo banners by placement|
|208|1|GET|`/content/collections`|editorial product/look collections|
|209|2|GET|`/content/articles`|blog/editorial|
|210|2|GET|`/content/articles/:slug`||
|211|1|GET|`/content/faq`||
|212|1|GET|`/content/help`|help center articles|
|213|M|GET|`/content/terms`|(or ship statically)|
|214|M|GET|`/content/privacy`||
|215|1|GET|`/content/glossary`|beauty terms|
|216|1|GET|`/content/whats-new`|changelog / release notes|

## 3.24 Support & feedback — `/support`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|217|1|POST|`/support/contact`|contact form|
|218|2|GET|`/support/tickets`||
|219|2|POST|`/support/tickets`||
|220|2|GET|`/support/tickets/:id`||
|221|2|POST|`/support/tickets/:id/messages`||
|222|1|POST|`/feedback`|in-app feedback|
|223|1|POST|`/feedback/bug`|bug report (+ logs)|
|224|1|POST|`/feedback/rating`|app rating prompt result|

## 3.25 Media / uploads — `/media`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|225|1|POST|`/media/presign`|presigned S3 URL `{type}` → `{uploadUrl,assetId}`|
|226|1|POST|`/media`|direct multipart upload|
|227|1|GET|`/media/:id`|asset meta/url|
|228|1|DELETE|`/media/:id`||

## 3.26 App config, flags & system — `/system`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|229|M|GET|`/system/config`|app config (urls, toggles)|
|230|M|GET|`/system/feature-flags`|per-user flags|
|231|M|GET|`/system/version-check`|`?platform=&version=` → force/soft update|
|232|1|GET|`/system/maintenance`|maintenance banner status|
|233|M|GET|`/health`|liveness|
|234|1|GET|`/ready`|readiness (db, cache)|
|235|2|GET|`/system/locales`|supported languages|
|236|2|GET|`/system/countries`|shipping/currency lists|
|237|2|GET|`/system/i18n/:locale`|UI string bundle (if server-driven)|

## 3.27 Analytics / telemetry — `/events`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|238|1|POST|`/events`|batch client events `[{name,props,ts}]`|
|239|1|POST|`/events/screen`|screen views|

## 3.28 Waitlist / marketing (web + app) — `/marketing`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|240|1|POST|`/marketing/waitlist`|web pre-launch capture|
|241|1|POST|`/marketing/newsletter`|subscribe `{email}`|
|242|1|POST|`/marketing/newsletter/unsubscribe`||

## 3.29 Webhooks (inbound, server-to-server) — `/webhooks`
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|243|1|POST|`/webhooks/stripe`|payments/subscription events|
|244|1|POST|`/webhooks/revenuecat`|IAP entitlement events|
|245|1|POST|`/webhooks/apple`|App Store server notifications|
|246|1|POST|`/webhooks/google`|Play RTDN|
|247|2|POST|`/webhooks/shipping`|carrier tracking updates|

## 3.30 Admin — `/admin` (separate auth scope: `ADMIN`)
| # | T | Method | Path | Purpose |
|--|--|--|--|--|
|248|2|GET|`/admin/users`|search/manage users|
|249|2|PATCH|`/admin/users/:id`|ban/role/flag|
|250|2|GET|`/admin/orders`||
|251|2|POST|`/admin/products`|create catalog item|
|252|2|PATCH|`/admin/products/:id`||
|253|2|DELETE|`/admin/products/:id`||
|254|2|POST|`/admin/products/import`|bulk CSV import|
|255|2|POST|`/admin/tutorials`|publish tutorial|
|256|2|PATCH|`/admin/tutorials/:id`||
|257|2|POST|`/admin/banners`|merchandising|
|258|2|GET|`/admin/reviews/queue`|moderation queue|
|259|2|POST|`/admin/reviews/:id/moderate`||
|260|2|POST|`/admin/notifications/broadcast`|push campaign|
|261|2|GET|`/admin/analytics/overview`|dashboards|
|262|2|GET|`/admin/feature-flags`||
|263|2|PATCH|`/admin/feature-flags/:key`||
|264|2|POST|`/admin/promos`|create coupon/campaign|

---

# 4. Totals & build order

- **~264 endpoints** across **30 domains** (mobile + web + admin/webhooks).
- **MVP (`M`, ~55):** auth core, me/settings/stats, beauty-profile, match, tutorials, products + saved, cart, saved looks, notifications core, subscription read, home feed, system config/flags/version/health, content terms/privacy.
- **v1 (`1`, ~120):** social/MFA/sessions, recreate polling, reviews/Q&A, brands, addresses, checkout/orders, payments/IAP, subscription mgmt, promos/referrals, search, push/devices, routines, media, support, telemetry, marketing.
- **later/admin (`2`, ~90):** community/comments/likes, advanced catalog (ingredients/barcode/price-history), wishlists, returns, gifting, full support tickets, CMS articles, and the entire `/admin` surface.

# 5. Implementation notes
- **DB:** Postgres + Prisma/Drizzle; the models in §2 map to tables.
- **Auth:** argon2 hashing, JWT access+refresh w/ rotation + revocation, session table for §3.1.25-27.
- **Money:** decide **IAP (RevenueCat)** vs **Stripe** before building §3.16-17; webhooks in §3.29 differ accordingly.
- **AI services:** `/match/selfie` and `/recreate/upload` call a model service → async jobs → status polling (`/…/status`).
- **Storage:** S3/Cloudinary behind `/media`.
- **Source of truth for JSON shapes:** `dollface-mobile/lib/mockApi.ts` — match it so the app needs zero changes beyond `EXPO_PUBLIC_API_URL`.
