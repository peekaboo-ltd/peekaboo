# Server Layout — Backend API

Node.js + Express 5 + TypeScript + TypeORM backend. Full feature/setup docs live in [server/README.md](../server/README.md); this file maps the directory layout.

## Entry points

| File | Responsibility |
| --- | --- |
| `src/server.ts` | Process entry. Reads `PORT`, boots the Node cluster, starts the HTTP server. |
| `src/app.ts` | Express app factory: JSON/urlencoded/cors middleware, Passport (Google OAuth), audit-context middleware, mounts routes at `/api/v1`, serves `/api/v1/uploads` statically, attaches the error handler, initializes the database. |
| `src/data-source.ts` | TypeORM `DataSource`: database config, entity/subscriber registration. |

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
| `/webhooks` | webhook.routes.ts (kpay, urubuto, whatsapp) |
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
- `payment.service.ts` — Kpay + UrubutoPay orchestration, payment status, payer selection, phone formatting.
- `auditLog.service.ts` — entity change tracking, history lookup.
- `dashboard.service.ts` / `organizationDashboard.service.ts` / `landing.service.ts` — analytics/aggregations.
- `organization*.service.ts`, `organizationBilling.service.ts`, `batch.service.ts`, `businessPlan.service.ts` — B2B features.
- `locationSearchSession.service.ts`, `pendingOrderSession.service.ts`, `push.service.ts`, `logs.service.ts`.

### `src/entities/`
TypeORM entities (PostgreSQL). One file per table, registered in `entities/index.ts` and `data-source.ts`. Includes `order`, `orderAssignment`, `orderActivity`, `payment`, `user`, `role`, `userRole`, `conversation`, `message`, `auditLog`, `organization`, `organizationMembership`, `organizationBilling`, `businessPlan`, `batch`, `pushSubscription`, `pendingOrderSession`, `locationSearchSession`, `userProblemReport`, `userStatusProof`, `log`.

### `src/integrations/`
Third-party provider adapters (one folder each):

- `kpay/` — Kpay payment gateway (`kpay.service.ts`).
- `urubuto/` — UrubutoPay client + config + tests (`urubuto.config.ts`, `urubuto.service.ts`).
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
Shared TypeScript types: `auth.types.ts`, `kpay.types.ts`, `urubuto.types.ts`, `payment.types.ts`, `push.types.ts`, `dashboard.types.ts`, `b2b.types.ts`, `orderImport.types.ts`, `auditLog.types.ts`, `index.ts`.

### `src/helpers/`
Pure utilities: `auth.helper.ts`, `phone.helper.ts`, `pricing.helper.ts`, `developmentPricing.helper.ts`, `distance.helper.ts`, `location.helper.ts`, `string.helper.ts`, `errors.helper.ts`, `logger.helper.ts`, `pagination.helper.ts`, `audit.helper.ts`, `whatsapp.helper.ts`, `whatsapp.flows.helper.ts`.

### `src/cron/`
Scheduled jobs via `node-cron`: `billingCron.ts`, `businessReportCron.ts`, `whatsappSessionCron.ts`.

### `src/decorators/`
`auditLog.decorator.ts` — `@AuditUpdate` / `@AuditDelete` decorators that auto-record before/after entity states.

### `src/subscribers/`
`audit.subscriber.ts` — TypeORM subscriber wiring audit-log capture to entity changes.

### `src/config/`
`passport.config.ts` — Google OAuth strategy setup.

### `src/scripts/`
Standalone seed/test scripts (run via `npm run seed:*` / `npm run urubuto:smoke-test`):
`seed-admin.ts`, `seed-roles.ts`, `seed-business-plans.ts`, `seed-rider-attendance.ts`, `seed-rider-problem-reports.ts`, `urubuto-smoke-test.ts`.

### `src/assets/`
Static assets, e.g. `watermarks/` used for problem-report video watermarking.

## Environment & config

- `server/.env.example` documents every variable. Required groups: database, JWT, WhatsApp, Kpay, UrubutoPay, Google OAuth, Resend, Pindo, Google Maps/Mapbox, OneSignal, Cloudinary.
- `server/.env` is gitignored — never commit it.
- `NODE_ENV=development` enables reduced pricing (charges 10 RWF) for local testing.

## Key commands (from `server/`)

```bash
npm run dev                        # nodemon + ts-node
npm run build                      # tsc → dist/
npm run typeorm:run-migrations     # run DB migrations (see README)
npm run seed:admin                 # create local admin account
npm run seed:roles                 # seed roles
npm run test                       # node --test over src/**/*.test.ts
```

## Tests

Unit tests are colocated with source as `*.test.ts` (e.g. `payment.service.test.ts`, `urubuto.config.test.ts`, `urubuto.service.test.ts`, `developmentPricing.helper.test.ts`). Run with `npm run test`.
