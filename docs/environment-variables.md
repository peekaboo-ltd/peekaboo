# Environment Variables — Complete Reference

This document is the exhaustive reference for every environment variable used across the repository. Each app loads its own `.env` file:

| App | Env file | Loaded by | What it holds |
| --- | --- | --- | --- |
| `server/` | `server/.env` | `dotenv/config` in `app.ts` + `whatsapp.helper.ts` | Secrets + service config |
| `client/` | `client/.env` | Vite (at build time) | Public/browser-safe config |
| `mobile/` | `--dart-define` (and CI secrets) | Flutter, at build time | Public config baked into the binary |
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

### MVend (payment gateway)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `MVEND_APP_ID` | — | Yes | MPS application ID (`appid`). | `mvend.config.ts` |
| `MVEND_APP_KEY` | — | Yes | MPS service key (`appkey`). | `mvend.config.ts` |
| `MVEND_SALT` | — | Yes | App salt. HMAC-SHA256 key for each request's `integrity_hash` (fields: timestamp, txref, amount, currency, payment_account, creditaccount, rollback_txref). | `mvend.hash.ts` |
| `MVEND_CALLBACK_TOKEN` | — | Yes | Random secret (24+ chars) in the callback URL path. MVend does not sign callbacks, so the token authenticates them, and every callback is re-confirmed with `gettransactionstatus`. | `mvend.config.ts` |
| `MVEND_BASE_URL` | `https://qa.mvendpay.com` | Optional | Use `https://live.mvendpay.com` in production. | `mvend.config.ts` |
| `MVEND_PAYMENTS_PATH` | `/mpay/requestpayment` | Optional | Payments endpoint path. | `mvend.config.ts` |
| `MVEND_CURRENCY` | `RWF` | Optional | Currency sent on debits and credits. | `mvend.config.ts` |
| `MVEND_USE_TOKEN_AUTH` | `false` | Optional | Sends `Authorization: Token {token}` obtained from `/auth/user/token`. | `mvend.service.ts` |
| `MVEND_AUTH_STRING` | — | If token auth | `auth_string` for `/auth/user/token`. | `mvend.service.ts` |

`PAYMENT_PROVIDER_DEFAULT` selects the gateway for new payments: `MVEND` (default) or `PAYPACK` (rollback switch). Only the active gateway's config is validated at startup.

**MVend callback URL** to configure on the MPS platform:

```
${PUBLIC_API_BASE_URL}/api/v1/webhooks/mvend/${MVEND_CALLBACK_TOKEN}
```

The callback body is undocumented, so it is only used to read the `txref`. The final status always comes from `gettransactionstatus`, and a cron on the primary process (every 2 minutes) re-checks PENDING MVend payments between 1 minute and 24 hours old, so a missed callback cannot strand an order.

Smoke test: `npm run mvend:smoke-test` (balance only) or `npm run mvend:smoke-test -- 0788123456 100` (QA debit + status polling).

### Paypack (payment gateway)

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `PAYPACK_CLIENT_ID` | — | Yes | Client ID of the Paypack dashboard application. | `paypack.config.ts` |
| `PAYPACK_CLIENT_SECRET` | — | Yes | Client secret of the Paypack dashboard application. | `paypack.config.ts` |
| `PAYPACK_WEBHOOK_SECRET` | — | Yes | Webhook secret from the Paypack dashboard. Verifies the `x-paypack-signature` header (base64 HMAC-SHA256 of the raw body) on `transaction:processed` events. | `paypack.service.ts` |
| `PAYPACK_ENV` | `production` when `NODE_ENV=production`, else `development` | Optional | Sent as the `X-Webhook-Mode` header on cashin. **Must match the mode registered on the Paypack dashboard webhook** or no webhook is delivered. | `paypack.config.ts` |
| `PAYPACK_BASE_URL` | `https://payments.paypack.rw/api` | Optional | Paypack API base URL override. | `paypack.config.ts` |

**Paypack webhook URL** registered on the Paypack dashboard (constructed from `PUBLIC_API_BASE_URL`):

```
${PUBLIC_API_BASE_URL}/api/v1/webhooks/paypack
```

Paypack HEAD-pings this URL before delivering payloads; the server answers HEAD with 200. Cashin requires a minimum of 100 RWF — smaller charges (e.g. `dev_price` mode) complete as simulated and are flagged `paypackMinimumNotMet` in the payment metadata.

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
| `ONESIGNAL_APP_ID` | — | Yes (for push) | OneSignal app ID. **Must match the rider app's `ONESIGNAL_APP_ID` dart-define.** Values are trimmed. | `oneSignalClient.ts:62` |
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
| `VITE_MAP_STYLE_URL` | `https://tiles.openfreemap.org/styles/positron` | Optional | MapLibre style URL for every map. The default (OpenFreeMap) needs no key. | `constants/environments.constants.ts` |
| `VITE_MAPBOX_ACCESS_TOKEN` | — | Yes, for place search | Public Mapbox token (`pk.…`). Used for place search and reverse lookups (Search Box API) and road routing (Directions API). Without it, search shows "Maps failed to load" and distance/ETA fall back to straight-line estimates. Restrict it by URL in the Mapbox account. | `constants/environments.constants.ts`, `utils/mapboxSearch.util.ts`, `utils/routing.util.ts` |
| `VITE_INACTIVITY_TIMEOUT` | `5` | Optional | Session inactivity timeout in **minutes** before the session-expired modal fires. | `constants/environments.constants.ts:7` |
| `VITE_NODE_ENVIRONMENT` | falls back to Vite `MODE` | Optional | Overrides the client's detected `NODE_ENVIRONMENT` label. | `constants/environments.constants.ts` |
| `VITE_PAYMENT_MODE` | `simulate` (non-production Vite MODE) / `live` (production) | Optional | UI payment mode aligned with server: `simulate`, `dev_price`, or `live`. Drives checkout disclaimers (`isPaymentSimulation` / `isDevPrice`). | `constants/environments.constants.ts` |

---

## Mobile (`mobile/` `--dart-define`)

The rider app has no `.env` file. Pass values with `--dart-define` to `flutter run` / `flutter build`. CI supplies the same names as environment variables (see `mobile/README.md`).

| Variable | Default | Required | Purpose & behavior | Read at |
| --- | --- | --- | --- | --- |
| `API_BASE_URL` | `https://server.peekaboo.co.rw/api/v1` | No | Backend base URL. An empty override falls back to the hosted API. **Gotcha:** on a physical device, `localhost` points at the phone; use your computer's LAN IP (e.g. `http://192.168.1.20:8080/api/v1`). The Android emulator reaches the host at `10.0.2.2`. Debug builds log a warning when the URL contains `localhost`. | `lib/src/config/app_config.dart` |
| `ONESIGNAL_APP_ID` | empty (push disabled) | Yes (for push) | OneSignal app ID. **Must match the server's `ONESIGNAL_APP_ID`.** | `lib/src/config/app_config.dart` |
| `LOCATION_UPDATE_INTERVAL_MINUTES` | `5` | Optional | How often rider location is sent to the backend. Values ≤ 0 fall back to 1 minute. | `lib/src/config/app_config.dart` |

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

- **OneSignal:** the rider app's `ONESIGNAL_APP_ID` dart-define must equal `server` `ONESIGNAL_APP_ID` (same OneSignal app). Android channel UUIDs should match the channels configured in the OneSignal dashboard.
- **Payment dev pricing:** `server` `NODE_ENV=development` (server source of truth) and `client` `VITE_NODE_ENVIRONMENT=development` (UI disclaimer) should agree during local testing.
- **API base:** `client` `VITE_API_BASE_URL`, the rider app's `API_BASE_URL` dart-define (when overriding the hosted default), and `server` `PUBLIC_API_BASE_URL` must all point at the same backend origin (`http://<host>:8080/api/v1` locally, or the hosted API in production).
- **UrubutoPay card redirects:** `URUBUTO_CARD_REDIRECT_BASE_URL` must be the exact public HTTPS domain approved by UrubutoPay; the server normalizes it (trims whitespace/trailing slash).
