# Environment Variables — Complete Reference

This document is the exhaustive reference for every environment variable used across the repository. Each app loads its own `.env` file:

| App | Env file | Loaded by | What it holds |
| --- | --- | --- | --- |
| `server/` | `server/.env` | `dotenv/config` in `app.ts` + `whatsapp.helper.ts` | Secrets + service config |
| `client/` | `client/.env` | Vite (at build time) | Public/browser-safe config |
| `mobile/` | `mobile/.env` (dev) or `eas.json` env (cloud builds) | Expo/Metro | Public config baked into the bundle |
| `scripts/deploy.sh` | shell environment | deploy script | Deploy-time controls |

> **Never commit `.env` files.** They are gitignored. Keep `.env.example` files up to date so new developers know what to configure.
>
> Environment variables with a trailing `=` and no value in `.env.example` are **empty by default** — the service typically degrades gracefully (e.g. disables that integration) until you set them.

---

## Server (`server/.env`)

### Core

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | (unset) | Optional | Runtime environment. Controls Express/Urubuto startup strictness and OneSignal. **Does not** control payment amounts anymore — use `PAYMENT_MODE` instead. | `app.ts:21`, `oneSignalClient.ts:114` |
| `PAYMENT_MODE` | `simulate` (non-production) / `live` (production) | Optional | Payment behavior: `simulate` (instant SUCCESSFUL, no provider), `dev_price` (real provider, 10 RWF), `live` (real provider, catalog amount). Forced to `live` when `NODE_ENV=production`. | `paymentMode.helper.ts`, `payment.service.ts` |
| `PUBLIC_API_BASE_URL` | — | Yes (for payments) | Public base URL of this API. Used to construct the webhook URLs registered with UrubutoPay (`${PUBLIC_API_BASE_URL}/api/v1/webhooks/urubuto/*`). Logs a startup warning if unset while UrubutoPay is the active provider. | `urubuto.config.ts:153`, `urubuto-smoke-test.ts:53` |
| `PAYMENT_PROVIDER_DEFAULT` | `URUBUTO` | Optional | Selects the payment gateway. Supported values: `URUBUTO`. (Kpay integration exists but is not the default.) When it equals `URUBUTO`, startup validation runs against the Urubuto config. | `urubuto.config.ts:76`, `payment.service.ts:620` |
| `PORT` | `8080` | Optional | Server port. `server.ts` reads it (default `8080`); the deploy script sets it when starting under PM2. Default local URL: http://localhost:8080 | `server.ts:37`, deploy script |

### Database

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `DB_HOST` | — | Yes | PostgreSQL host. | `data-source.ts:8` |
| `DB_PORT` | `5433` (in example) | Yes | PostgreSQL port. | `data-source.ts:9` |
| `DB_NAME` | `peekaboo` | Yes | PostgreSQL database name (used in the connection and the "connected" log line). | `data-source.ts:12`, `app.ts:52` |
| `DB_USER` | — | Yes | PostgreSQL user. | `data-source.ts:10` |
| `DB_PASSWORD` | — | Yes | PostgreSQL password. | `data-source.ts:11` |

### JWT / Auth

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `JWT_SECRET` | `default_secret` / `peekaboo` (fallbacks) | Yes in production | Signs access tokens. Used directly by `auth.middleware.ts` and the auth/organization controllers; also used as a fallback for `URUBUTO_WEBHOOK_JWT_SECRET`. **Use a long random value; never ship the default in production.** | `auth.middleware.ts:29`, `organization.controller.ts:41,1157`, `auth.controller.ts:104`, `urubuto.config.ts:63` |

### WhatsApp Business API

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `WHATSAPP_BUSINESS_ACCESS_TOKEN` | — | Yes (for WhatsApp) | Bearer token for the WhatsApp Business Cloud API. | `whatsapp.helper.ts:12,24` |
| `WHATSAPP_BUSINESS_PHONE_NUMBER_ID` | — | Yes (for WhatsApp) | The business phone number ID; part of the messages URL. | `whatsapp.helper.ts:11,19` |
| `WHATSAPP_BUSINESS_API_VERSION` | `v20.0` | Yes (for WhatsApp) | Cloud API version segment in the messages URL. | `whatsapp.helper.ts:10,19` |
| `WHATSAPP_BUSINESS_API_URL` | `https://graph.facebook.com` | Optional | Base host of the Cloud API. | `whatsapp.helper.ts:9,19` |
| `WHATSAPP_BUSINESS_VERIFY_TOKEN` | — | Yes (for webhook) | Verify token the WhatsApp webhook handshake compares against (`hub.verify_token`). | `whatsapp.controller.ts:18` |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | — | Optional | Business account ID. Documented for external setup/reference; not read directly in `src`. | `.env.example` |
| `WHATSAPP_TEST_PHONE_NUMBER` | — | Optional | A test phone number (E.164, e.g. `+15556036149`). Documented for manual testing; not read directly in `src`. | `.env.example` |

### WhatsApp Flows

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `WHATSAPP_FLOW_ID` | — | Optional (for Flows) | Published Meta WhatsApp Flow ID used for order placement flows. When set, the service can send flow-based order creation messages. | `whatsapp.service.ts:204,703` |
| `WHATSAPP_FLOW_TOKEN_SECRET` | — | Optional (for Flows) | Secret used to sign/verify WhatsApp Flow JWT tokens in webhook requests. | `whatsapp.controller.ts:82`, `whatsapp.service.ts:704` |
| `WHATSAPP_FLOW_PRIVATE_KEY` | — | Optional (for Flows) | RSA private key used to decrypt WhatsApp Flow **data-exchange** requests. **Gotcha:** when set through an env file, newlines must be escaped (`\n`). | `whatsapp.flows.helper.ts:25` |
| `WHATSAPP_ORDER_INITIAL_FEE` | `1500` | Optional | Initial fee applied to orders created via WhatsApp. **Not in `.env.example`** — set it to override `DEFAULT_ORDER_FEE` in `whatsapp.service.ts:32`. | `whatsapp.service.ts:574` |

### Kpay (secondary payment gateway)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `KPAY_USERNAME` | — | Only if using Kpay | Basic-auth username for the Kpay API. | `kpay.service.ts:26` |
| `KPAY_PASSWORD` | — | Only if using Kpay | Basic-auth password for the Kpay API. | `kpay.service.ts:27` |
| `KPAY_BASE_URL` | `https://pay.esicia.com` | Only if using Kpay | Kpay endpoint. `pay.esicia.rw` = production, `pay.esicia.com` = sandbox. | `kpay.service.ts:28` |
| `KPAY_RETAILER_ID` | — | Only if using Kpay | Retailer ID provided by Kpay. | `kpay.service.ts:29` |
| `KPAY_WEBHOOK_URL` | — | Only if using Kpay | URL Kpay calls for payment notifications (example: `https://your-domain.com/api/v1/webhooks/kpay`). | `kpay.service.ts:30` |
| `KPAY_API_KEY` | — | Only if using Kpay | API key. **Not in `.env.example`** — used by the Kpay service. | `kpay.service.ts:32` |
| `KPAY_SECRET_KEY` | — | Only if using Kpay | Secret key. **Not in `.env.example`** — used by the Kpay service. | `kpay.service.ts:33` |
| `KPAY_MERCHANT_ID` | — | Only if using Kpay | Merchant ID. **Not in `.env.example`** — used by the Kpay service. | `kpay.service.ts:34` |

### UrubutoPay (primary payment gateway)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `URUBUTO_BASE_URL` | `https://staging.urubutopay.rw` | Yes (for Urubuto) | API base URL. `staging.urubutopay.rw` = staging, `urubutopay.rw` = production. The environment is auto-detected from this URL and cross-checked against the checkout URL. | `urubuto.config.ts:53` |
| `URUBUTO_API_KEY` | — | Yes (for Urubuto) | API key from the UrubutoPay developer menu (format `upg:...`). Startup validation warns on missing/placeholder/test-looking keys. | `urubuto.config.ts:57,115-129` |
| `URUBUTO_MERCHANT_CODE` | — | Yes (for Urubuto) | Merchant code. Validation rejects placeholder values and codes identical to the service code. | `urubuto.config.ts:58,131-151` |
| `URUBUTO_SERVICE_CODE` | — | Yes (for Urubuto) | Service code **linked to the merchant** in the same environment as `URUBUTO_BASE_URL`. | `urubuto.config.ts:59` |
| `URUBUTO_WEBHOOK_USERNAME` | — | Yes (for Urubuto) | Basic-auth username for inbound Urubuto webhooks. | `urubuto.config.ts:60` |
| `URUBUTO_WEBHOOK_PASSWORD` | — | Yes (for Urubuto) | Basic-auth password for inbound Urubuto webhooks. | `urubuto.config.ts:61` |
| `URUBUTO_WEBHOOK_JWT_SECRET` | falls back to `JWT_SECRET`, then `peekaboo` | Optional | Secret for verifying webhook JWTs. Set a strong, dedicated value. | `urubuto.config.ts:62-65` |
| `URUBUTO_CHECKOUT_BASE_URL` | derived from `URUBUTO_BASE_URL` | Optional | Public checkout URL used in redirects. When unset, resolves from the API base (staging → `https://staging.urubutopay.rw`, otherwise `https://urubutopay.rw`). Startup validation rejects mismatched staging/production combinations. | `urubuto.config.ts:36-49,66-69,96-113` |
| `URUBUTO_CARD_REDIRECT_BASE_URL` | falls back to `FRONTEND_URL` | Optional | Public HTTPS origin approved by UrubutoPay for `CARD` payment redirects. Server builds `{base}/p/orders/{orderId}/payment-pending?paymentId={paymentId}` after trimming whitespace/trailing slashes. **Must be the approved domain in production.** | `payment.service.ts` |

**UrubutoPay webhook URLs** registered with the provider (constructed from `PUBLIC_API_BASE_URL`):

```
${PUBLIC_API_BASE_URL}/api/v1/webhooks/urubuto/auth
${PUBLIC_API_BASE_URL}/api/v1/webhooks/urubuto/validation
${PUBLIC_API_BASE_URL}/api/v1/webhooks/urubuto/callback
${PUBLIC_API_BASE_URL}/api/v1/webhooks/urubuto/notification
${PUBLIC_API_BASE_URL}/api/v1/webhooks/urubuto/reversal
```

### Google OAuth

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `GOOGLE_CLIENT_ID` | — | Only if using Google OAuth | Google OAuth client ID. Server logs a warning if either ID or secret is missing. | `passport.config.ts:9,19` |
| `GOOGLE_CLIENT_SECRET` | — | Only if using Google OAuth | Google OAuth client secret. | `passport.config.ts:9,20` |
| `GOOGLE_CALLBACK_URL` | — | Only if using Google OAuth | Server-side OAuth callback (e.g. `http://localhost:8080/api/v1/auth/google/callback`). | `passport.config.ts:22` |
| `FRONTEND_URL` | `http://localhost:5173` (fallbacks) | Optional | Base URL of the web frontend. Used for Kpay payment redirects, order activity links, and Urubuto card redirects when `URUBUTO_CARD_REDIRECT_BASE_URL` is unset. | `kpay.service.ts:143`, `orderActivity.service.ts:121,302`, `payment.service.ts:636` |
| `FRONTEND_AUTH_SUCCESS_URL` | `http://localhost:5173/auth/callback` | Optional | Frontend URL to redirect to after successful Google OAuth. | `auth.controller.ts:135` |
| `FRONTEND_AUTH_FAILURE_URL` | `http://localhost:5173/auth/login` | Optional | Frontend URL to redirect to after failed Google OAuth. | `auth.routes.ts:29`, `auth.controller.ts:129` |
| `CLIENT_URL` | `http://localhost:5173` | Optional | Base URL used in emails and account links (password resets, onboarding invites, member-added emails). | `user.service.ts:220`, `auth.service.ts:334,439`, `email.service.ts:113`, email templates |

### Email (Resend)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `RESEND_API_KEY` | — | Yes (for email) | Resend API key (`re_...`). Emails are skipped gracefully when unset. | `email.service.ts:82`, `payment.service.test.ts` |
| `RESEND_EMAIL` | `noreply@peekaboo.co.rw` | Optional | Sender ("from") address for all emails. | `email.service.ts:83` |
| `ADMIN_NOTIFICATION_EMAIL` | `info@peekaboo.co.rw` | Optional | Recipient for internal/admin notifications (new organizations, problem reports, critical alerts). | `email.service.ts:85` |

### SMS (Pindo)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `PINDO_API_URL` | `https://api.pindo.io/v1/sms/` | Optional | Pindo SMS API base URL. | `sms.service.ts:18` |
| `PINDO_TOKEN` | — | Yes (for SMS) | Pindo bearer token. | `sms.service.ts:20` |
| `PINDO_SENDER_ID` | `Peekaboo` | Optional | SMS sender ID shown to recipients. | `sms.service.ts:24` |

### Maps & Location search

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `MAPS_PROVIDER` | `google` | Optional | Location search provider: `google` or `mapbox`. | `locationSearch.facade.ts:12`, `locationSearchSession.service.ts:27` |
| `GOOGLE_MAPS_API_KEY` | — | Only if `MAPS_PROVIDER=google` | Google Places key for pickup-location search (WhatsApp Flows) and distance calculations. | `locationSearch.facade.ts:23,61` |
| `MAPBOX_ACCESS_TOKEN` | — | Only if `MAPS_PROVIDER=mapbox` | Mapbox access token used when `MAPS_PROVIDER=mapbox`. | `locationSearch.facade.ts:16,54` |
| `DEFAULT_COUNTRY` | `RW` | Optional | Country code bias for location search results. | `locationSearch.facade.ts:37` |
| `DEFAULT_CITY` | `Kigali` | Optional | City bias for location search results. | `locationSearch.facade.ts:38` |
| `MAX_LOCATION_SUGGESTIONS` | `5` | Optional | Max autocomplete suggestions returned. | `locationSearch.facade.ts:34` |
| `LOCATION_SEARCH_SESSION_TTL_MINUTES` | `30` | Optional | TTL (minutes) for location-search sessions; floored at 5. | `locationSearchSession.service.ts:11` |
| `PENDING_ORDER_SESSION_TTL_MINUTES` | `30` | Optional | TTL (minutes) for pending-order WhatsApp sessions; floored at 5. | `pendingOrderSession.service.ts:9` |

### Push notifications (OneSignal)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `ONESIGNAL_APP_ID` | — | Yes (for push) | OneSignal app ID. **Must match the mobile app's `EXPO_PUBLIC_ONESIGNAL_APP_ID`.** Values are trimmed. | `oneSignalClient.ts:62` |
| `ONESIGNAL_REST_API_KEY` | — | Yes (for push) | OneSignal REST API key (Settings → Keys & IDs) for the same app as `ONESIGNAL_APP_ID`. Trimmed. | `oneSignalClient.ts:63` |
| `ONESIGNAL_ANDROID_CHANNEL_ASSIGNMENTS` | — | Optional | Android channel UUID for assignment notifications. Omit to use the default channel. | (read via OneSignal payload) |
| `ONESIGNAL_ANDROID_CHANNEL_ASSIGNMENTS_URGENT` | — | Optional | Android channel UUID for urgent assignments. Omit to use the default channel. | (read via OneSignal payload) |
| `PUSH_NOTIFICATIONS_DISABLED` | (unset) | Optional | Set `true` to skip **all** OneSignal API calls (handy locally; assignment flows still work). Parsed as a truthy flag. | `oneSignalClient.ts:64` |

### Cloudinary (media)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | — | Yes (for uploads) | Cloudinary cloud name. | `cloudinary.service.ts:13,24` |
| `CLOUDINARY_API_KEY` | — | Yes (for uploads) | Cloudinary API key. | `cloudinary.service.ts:14,25` |
| `CLOUDINARY_API_SECRET` | — | Yes (for uploads) | Cloudinary API secret. | `cloudinary.service.ts:15,26` |
| `CLOUDINARY_AVATAR_FOLDER` | `peekaboo/avatars` | Optional | Folder for user avatar uploads. | `cloudinary.service.ts:128` |
| `CLOUDINARY_STATUS_PROOF_FOLDER` | `peekaboo/status-proofs` | Optional | Folder for rider status-proof uploads. | `cloudinary.service.ts:149` |
| `CLOUDINARY_PROBLEM_REPORT_FOLDER` | `peekaboo/problem-reports` | Optional | Folder for problem-report media (video/images). | `cloudinary.service.ts:259` |
| `CLOUDINARY_PROBLEM_REPORT_WATERMARK_PUBLIC_ID` | — | Optional | Public ID of the logo used to watermark problem-report videos. If empty, the service falls back to uploading `PROBLEM_REPORT_WATERMARK_LOCAL_PATH`. | `cloudinary.service.ts:210` |
| `PROBLEM_REPORT_WATERMARK_LOCAL_PATH` | `src/assets/watermarks/peekaboo-black-yellow.jpeg` | Optional | Local logo path auto-uploaded for watermarking when the public ID above is empty. | `cloudinary.service.ts:234` |
| `CLOUDINARY_WATERMARK_FOLDER` | `peekaboo/watermarks` | Optional | Folder used when auto-uploading the watermark logo. | `cloudinary.service.ts:239` |
| `CLOUDINARY_PROBLEM_REPORT_WATERMARK_NAME` | `peekaboo-black-yellow` | Optional | Public name used for the auto-uploaded watermark. | `cloudinary.service.ts:241` |
| `CLOUDINARY_WATERMARK_PUBLIC_ID` | — | Optional | Alternate watermark public ID. **Not in `.env.example`** — read by the Cloudinary service as a fallback. | `cloudinary.service.ts:217` |

### Admin seeding (`npm run seed:admin`)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `SEED_ADMIN_EMAIL` | `info@peekaboo.co.rw` | Optional | Email of the seeded admin. | `seed-admin.ts:11` |
| `SEED_ADMIN_PHONE` | `0780000000` | Optional | Phone of the seeded admin. | `seed-admin.ts:12` |
| `SEED_ADMIN_PASSWORD` | `Admin123!` | Optional | Password of the seeded admin. | `seed-admin.ts:13` |
| `SEED_ADMIN_NAME` | `Admin` | Optional | Display name of the seeded admin. | `seed-admin.ts:14` |
| `SEED_ADMIN_RESET_PASSWORD` | `false` | Optional | Set `true` to force a password reset on first login. Parsed as boolean string. | `seed-admin.ts:15` |

### Support display info

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `PEEKABOO_SUPPORT_EMAIL` | `info@peekaboo.co.rw` | Optional | Support email surfaced in the dashboard/system-status panel. **Not in `.env.example`.** | `dashboard.service.ts:1053` |
| `PEEKABOO_SUPPORT_PHONE` | `+250 788 000 000` | Optional | Support phone surfaced in the dashboard/system-status panel. **Not in `.env.example`.** | `dashboard.service.ts:1054` |

---

## Client (`client/.env`)

Vite only exposes variables prefixed with `VITE_` to the browser; they are read at **build time** through `import.meta.env`. Copy `client/.env.example` to `client/.env` for local development. Preview and production hosts must set these variables before the client build starts; runtime-only changes do not affect an already-built bundle.

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Yes (outside local dev) | Base URL of the backend API. Every axios request targets this. | `constants/environments.constants.ts:5` |
| `VITE_GOOGLE_MAPS_API_KEY` | — | Only for map and place-search features | Browser key for Maps JavaScript, Places, and Geocoding. Before launch, restrict it by HTTP referrer and to exactly those APIs, and configure a Cloud billing budget alert. | `constants/environments.constants.ts` |
| `VITE_GOOGLE_MAPS_MAP_ID` | `DEMO_MAP_ID` | Required for production map markers | JavaScript vector Map ID used by `AdvancedMarker`, including the public home hero. Create it without an attached style to retain Google’s full-colour default basemap; disable tilt and rotation. | `constants/environments.constants.ts` |
| `VITE_INACTIVITY_TIMEOUT` | `5` | Optional | Session inactivity timeout in **minutes** before the session-expired modal fires. | `constants/environments.constants.ts:7` |
| `VITE_NODE_ENVIRONMENT` | falls back to Vite `MODE` | Optional | Overrides the client's detected `NODE_ENVIRONMENT` label. | `constants/environments.constants.ts` |
| `VITE_PAYMENT_MODE` | `simulate` (non-production Vite MODE) / `live` (production) | Optional | UI payment mode aligned with server: `simulate`, `dev_price`, or `live`. Drives checkout disclaimers (`isPaymentSimulation` / `isDevPrice`). | `constants/environments.constants.ts` |

---

## Mobile (`mobile/.env` or `eas.json`)

Expo inlines variables prefixed with `EXPO_PUBLIC_` into the bundle at build time. For **EAS cloud builds**, values must come from the profile `env` in `eas.json` or EAS secrets — a local `.env` is **not** used. For local `expo start`, `mobile/.env` is used.

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | localhost fallback in dev | Yes (non-dev) | Backend base URL. **Gotcha:** on physical devices use your computer's LAN IP (e.g. `http://192.168.1.20:8080/api/v1`), never `localhost` (it points at the phone itself). The app logs warnings for missing/localhost values. | `utils/constants.ts:2-18` |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID` | — | Yes (for push) | OneSignal app ID. **Must match the server's `ONESIGNAL_APP_ID`.** Logs a warning when missing. | `services/notifications/pushNotifications.ts:63` |
| `EXPO_PUBLIC_PROJECT_ID` | — | Yes (for EAS) | Expo project ID (also in `app.config.ts` → `extra.eas.projectId`). Baked into `eas.json` profiles. | `eas.json`, `app.config.ts` |
| `EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL_MINUTES` | `5` | Optional | How often rider location is sent to the backend. Set to `1` for faster testing; values ≤ 0 or non-numeric fall back to 1. | `utils/constants.ts:21-31` |

---

## Deploy script (`scripts/deploy.sh`)

Passed as shell environment variables when running the script, e.g.:

```bash
GIT_PULL=true SEQUENTIAL=true PORT=8081 CLIENT_PORT=4174 ./scripts/deploy.sh
```

| Variable | Default | Purpose & behavior |
| --- | --- | --- |
| `NODE_MAJOR` | `20` | Node.js major version installed from NodeSource (Linux) or Homebrew (macOS) when Node is missing. |
| `NODE_ENV` | `production` | Runtime environment passed to the PM2 processes. |
| `PORT` | `8080` | Backend server port. |
| `CLIENT_PORT` | `4173` | Vite preview port for the web client. |
| `SERVER_PM2_NAME` | `peekaboo-server` | PM2 process name for the backend. |
| `CLIENT_PM2_NAME` | `peekaboo-client` | PM2 process name for the web client. |
| `GIT_PULL` | `false` | Run `git pull --ff-only` before installing/building. |
| `SEQUENTIAL` | `false` | Build the server and client one at a time (for low-resource servers) instead of in parallel. |

---

## Cross-app consistency requirements

- **OneSignal:** `mobile` `EXPO_PUBLIC_ONESIGNAL_APP_ID` must equal `server` `ONESIGNAL_APP_ID` (same OneSignal app). Android channel UUIDs should match the channels configured in the OneSignal dashboard.
- **Payment dev pricing:** `server` `NODE_ENV=development` (server source of truth) and `client` `VITE_NODE_ENVIRONMENT=development` (UI disclaimer) should agree during local testing.
- **API base:** `client` `VITE_API_BASE_URL`, `mobile` `EXPO_PUBLIC_API_BASE_URL`, and `server` `PUBLIC_API_BASE_URL` must all point at the same backend origin (`http://<host>:8080/api/v1`).
- **UrubutoPay card redirects:** `URUBUTO_CARD_REDIRECT_BASE_URL` must be the exact public HTTPS domain approved by UrubutoPay; the server normalizes it (trims whitespace/trailing slash).
