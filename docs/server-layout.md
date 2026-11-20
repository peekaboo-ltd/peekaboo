# Server Layout — Backend API

Node.js + Express 5 + TypeScript + TypeORM backend. Full feature/setup docs live in [server/README.md](../server/README.md); this file maps the directory layout.

> **Configuration:** every server environment variable (database, WhatsApp, payments, email/SMS, maps, OneSignal, Cloudinary, seeds) is documented with defaults and code references in [environment-variables.md](environment-variables.md). Configure `server/.env` from `server/.env.example`.

## Entry points

| File | Responsibility |
| --- | --- |
| `src/server.ts` | Process entry. Reads `PORT`, boots the Node cluster, starts the HTTP server. |
| `src/app.ts` | Express app factory: JSON/urlencoded/cors middleware, Passport (Google OAuth), audit-context middleware, mounts routes at `/api/v1`, serves `/api/v1/uploads` statically, attaches the error handler, initializes the database. Also runs MVend startup config validation (warns in dev, throws in production on invalid config). |
| `src/data-source.ts` | TypeORM `DataSource`: database config, entity/subscriber registration. |

## Request lifecycle

```
HTTP request
  → app.ts middleware: express.json (50mb) → urlencoded → cors → passport → auditContext (AsyncLocalStorage)
  → routes/index.ts (mounted at /api/v1)
  → <feature>.routes.ts → route middlewares (auth.middleware JWT, authorize.middleware RBAC)
  → <feature>.controller.ts  (joi validation, req/res mapping)
  → <feature>.service.ts     (business logic + integrations)
  → entities / subscribers   → PostgreSQL
  → errors.middleware.ts     → JSON error response
```

- **Authentication:** `auth.middleware.ts` verifies the `Authorization: Bearer <JWT>` token using `JWT_SECRET`.
- **Authorization (RBAC):** `authorize.middleware.ts` restricts routes to specific roles.
- **Audit context:** `auditContext.middleware.ts` stores the acting user in AsyncLocalStorage so audit-log decorators can attribute changes without extra parameters.

## Layering (per feature)

Requests flow: **routes → controllers → services → entities (TypeORM)**.

```
routes/index.ts  ── mounts feature routers at /api/v1
   └── routes/<feature>.routes.ts        (defines endpoints, applies middlewares)
        └── controllers/<feature>.controller.ts   (HTTP concerns: req/res, status codes)
             └── services/<feature>.service.ts    (business logic)
                  └── entities/<feature>.entity.ts (TypeORM models, DB access)
```

Validations (`joi`) are applied in controllers or via a shared `validations/` folder; TypeORM class-validator decorators are used on entities.

## Directory reference

### `src/routes/`
One router per feature, all aggregated in `routes/index.ts`. Mounted prefixes:

| Prefix | Route file |
| --- | --- |
| `/auth` | auth.routes.ts |
| `/whatsapp` | whatsapp.routes.ts |
| `/orders` | order.routes.ts |
| `/users` | user.routes.ts |
| `/roles` | role.routes.ts |
| `/audit-logs` | auditLog.routes.ts |
| `/order-assignments` | orderAssignment.routes.ts |
| `/order-activities` | orderActivity.routes.ts |
| `/payments` | payment.routes.ts |
| `/webhooks` | webhook.routes.ts (mvend) and whatsapp routes |
| `/dashboard` | dashboard.routes.ts |
| `/landing` | landing.routes.ts (public) |
| `/business-plans` | businessPlan.routes.ts |
| `/organizations` | organization.routes.ts |
| `/batches` | batch.routes.ts |
| `/push` | push.routes.ts |

### `src/controllers/`
HTTP handlers for each feature. Thin layer: parse/validate input, call the service, map to HTTP responses. Webhook and WhatsApp controllers handle inbound third-party requests.

### `src/services/`
Business logic. Notable services:

- `whatsapp.service.ts` — WhatsApp message/flow processing, conversation orchestration, order creation via chat.
- `order.service.ts` — order lifecycle, public order creation, fees, status, cancellation.
- `orderAssignment.service.ts` — rider auto-assignment (fewest active assignments), reassignment, history.
- `user.service.ts` / `role.service.ts` / `userRole.service.ts` — accounts, roles, RBAC.
- `auth.service.ts` — login, JWT, Google OAuth.
- `conversation.service.ts` / `message.service.ts` — WhatsApp conversation state and message history.
- `payment.service.ts` — MVend payment orchestration (debit, timeout recovery, callback + cron reconciliation, refunds), payment status, payer selection.
- `mvendReconciliation.ts` / `mvendRefund.ts` — DB-free MVend reconciliation and refund-eligibility logic (unit tested).
- `auditLog.service.ts` — entity change tracking, history lookup.
- `dashboard.service.ts` / `organizationDashboard.service.ts` / `landing.service.ts` — analytics/aggregations.
- `organization*.service.ts`, `organizationBilling.service.ts`, `batch.service.ts`, `businessPlan.service.ts` — B2B features.
- `locationSearchSession.service.ts`, `pendingOrderSession.service.ts`, `push.service.ts`, `logs.service.ts`.

### `src/entities/`
TypeORM entities (PostgreSQL). One file per table, registered in `entities/index.ts` and `data-source.ts`. Includes `order`, `orderAssignment`, `orderActivity`, `payment`, `user`, `role`, `userRole`, `conversation`, `message`, `auditLog`, `organization`, `organizationMembership`, `organizationBilling`, `businessPlan`, `batch`, `pushSubscription`, `pendingOrderSession`, `locationSearchSession`, `userProblemReport`, `userStatusProof`, `log`.

### `src/integrations/`
Third-party provider adapters (one folder each):

- `mvend/` — MVend Payments API client, request signing, config and callback-token check (`mvend.service.ts`, `mvend.hash.ts`, `mvend.config.ts`, `mvend.callback.ts`).
- `whatsapp/` — not present here; WhatsApp calls are in `services/whatsapp.service.ts` + `helpers/whatsapp.*`.
- `emails/` — Resend-based email service and JSX templates (`email.service.ts`, `templates/<area>/*.tsx`).
- `sms/` — Pindo SMS (`sms.service.ts`, `sms.messages.ts`).
- `push/` — OneSignal (`oneSignalClient.ts`).
- `cloudinary/` — media uploads / watermarking (`cloudinary.service.ts`).

### `src/locations/`
Location search abstraction with pluggable providers: `googlePlaces.provider.ts`, `mapboxGeocode.provider.ts`, plus `locationSearch.facade.ts` and `parseCompositePlaceId.ts`. Provider is chosen by `MAPS_PROVIDER` (google | mapbox).

### `src/middlewares/`
Express middlewares: `auth.middleware.ts` (JWT), `authorize.middleware.ts` (roles), `auditContext.middleware.ts` (AsyncLocalStorage user context for audit logs), `errors.middleware.ts`, `upload.middleware.ts` (multer).

### `src/validations/`
Shared `joi` validation schemas (currently `conversation.validations.ts`; most schemas are inline in controllers).

### `src/constants/`
Enums/constants per feature: `order.constants.ts`, `payment.constants.ts`, `role.constants.ts`, `user.constants.ts`, `auditLog.constants.ts`, `conversation.constants.ts`, `organization.constants.ts`, `batch.constants.ts`, `businessPlan.constants.ts`, `push.constants.ts`, `countries.constants.ts`, `message.constants.ts`, `logs.constants.ts`, `pendingOrderSession.constants.ts`.

### `src/templates/`
`whatsapp/` — `whatsapp.template.ts` (message builders) and `whatsapp-flow.json` (Meta WhatsApp Flow definition, referenced by `WHATSAPP_FLOW_ID`).

### `src/types/`
Shared TypeScript types: `auth.types.ts`, `mvend.types.ts`, `payment-provider.types.ts`, `payment.types.ts`, `push.types.ts`, `dashboard.types.ts`, `b2b.types.ts`, `orderImport.types.ts`, `auditLog.types.ts`, `index.ts`.

### `src/helpers/`
Pure utilities: `auth.helper.ts`, `phone.helper.ts`, `pricing.helper.ts`, `paymentMode.helper.ts`, `distance.helper.ts`, `location.helper.ts`, `string.helper.ts`, `errors.helper.ts`, `logger.helper.ts`, `pagination.helper.ts`, `audit.helper.ts`, `whatsapp.helper.ts`, `whatsapp.flows.helper.ts`.

### `src/cron/`
Scheduled jobs via `node-cron`: `billingCron.ts`, `businessReportCron.ts`, `whatsappSessionCron.ts`.

### `src/decorators/`
`auditLog.decorator.ts` — `@AuditUpdate` / `@AuditDelete` decorators that auto-record before/after entity states.

### `src/subscribers/`
`audit.subscriber.ts` — TypeORM subscriber wiring audit-log capture to entity changes.

### `src/config/`
`passport.config.ts` — Google OAuth strategy setup.

### `src/scripts/`
Standalone seed/test scripts (run via `npm run seed:*` / `npm run mvend:smoke-test`):
`seed-admin.ts`, `seed-roles.ts`, `seed-business-plans.ts`, `seed-rider-attendance.ts`, `seed-rider-problem-reports.ts`, `mvend-smoke-test.ts`.

### `src/assets/`
Static assets, e.g. `watermarks/` used for problem-report video watermarking.

## Order status lifecycle

```
CREATED → PENDING → CONFIRMED → ACCEPTED → PAID → ACTIVE → IN_TRANSIT → DELIVERED → COMPLETED
   │         │          │         │
   └─────────┴──────────┴─────────┴──── CANCELLED   (refund on cancellation after payment)
```

- **CREATED** — order initiated via WhatsApp or the API; a unique reference ID (`P` + 6 chars) and initial fee are set.
- **PENDING** — initial review / awaiting confirmation.
- **CONFIRMED** — confirmed by admin/staff.
- **ACCEPTED** — rider accepts the assignment.
- **PAID** — payment verified by the gateway webhook (see payments below).
- **ACTIVE / IN_TRANSIT / DELIVERED** — rider progression.
- **COMPLETED** — customer confirms delivery.
- **CANCELLED** — cancellable from CREATED..PAID; post-payment cancellations trigger refunds.

Status transitions are managed in `order.service.ts` and `orderActivity.service.ts` (which also notifies via WhatsApp/email). The source of truth for constants is `constants/order.constants.ts`.

## Payments (provider selection)

- **MVend** is the only payment gateway (MTN MoMo / Airtel Money debits from the payer's MSISDN), configured via `MVEND_*` vars. Every request is signed with an HMAC-SHA256 `integrity_hash`.
- Callbacks are treated as triggers only; the outcome always comes from `gettransactionstatus`. `cron/paymentReconcileCron.ts` (cluster primary, every 2 minutes) re-checks PENDING MVend payments so a missed callback cannot strand an order.
- Admins can refund through `rollback` (full) or `makepayment` (full or partial). Paypack, UrubutoPay and Kpay are retired; their provider values remain for historical rows.
- Payment flows support payer selection (Sender / Recipient / custom phone) and Rwanda phone formatting (250XXXXXXXXX).
- Payment charges are controlled by `PAYMENT_MODE` (`simulate` | `dev_price` | `live`); see `helpers/paymentMode.helper.ts`.

## Webhook endpoints

Mounted under `/api/v1/webhooks` (`routes/webhook.routes.ts`):

| Endpoint | Provider | Purpose |
| --- | --- | --- |
| `/webhooks/whatsapp` | WhatsApp | Inbound customer messages + flow data-exchange events (verify via `WHATSAPP_BUSINESS_VERIFY_TOKEN`). |
| `/webhooks/mvend/:token` | MVend | Payment-completed notifications; authenticated by `MVEND_CALLBACK_TOKEN` in the path, confirmed with `gettransactionstatus`. |

## Cron jobs (`src/cron/`)

| Job | Responsibility |
| --- | --- |
| `billingCron.ts` | Organization billing — invoice/payment-overdue processing. |
| `businessReportCron.ts` | Scheduled business reports for B2B clients. |
| `whatsappSessionCron.ts` | Cleans up expired WhatsApp/pending-order/location-search sessions. |

## Environment & config

- Full, exhaustive reference for **every** server variable: [environment-variables.md](environment-variables.md).
- `server/.env.example` documents the variables; `server/.env` is gitignored — never commit it.
- Required groups: database (`DB_*`), JWT, WhatsApp (`WHATSAPP_BUSINESS_*` / `WHATSAPP_FLOW_*`), payment gateway, Google OAuth, Resend, Pindo, Maps, OneSignal, Cloudinary.
- `PAYMENT_MODE=dev_price` charges 100 RWF for local testing; `NODE_ENV=production` makes MVend config issues fatal at startup.

## Key commands (from `server/`)

```bash
npm run dev                        # nodemon + ts-node (TypeORM synchronize:true syncs schema)
npm run build                      # tsc → dist/
npm run seed:admin                 # create local admin account
npm run seed:roles                 # seed roles
npm run test                       # node --test over src/**/*.test.ts
```

> **Schema:** `data-source.ts` uses `synchronize: true`, so tables are created/updated automatically when the app boots. There is no migrations folder and no `typeorm:run-migrations` npm script (the command referenced in `server/README.md` is not defined in `package.json`).

## Tests

Unit tests are colocated with source as `*.test.ts` (e.g. `mvend.service.test.ts`, `mvend.hash.test.ts`, `mvendReconciliation.test.ts`, `paymentMode.helper.test.ts`). Run with `npm run test`.
