# Project Layout — High-Level Architecture

This document describes the overall layout of the Peekaboo repository: what each top-level directory is for, the tech stack, and how the pieces communicate.

## Monorepo overview

```
peekaboo/
├── client/          # Web frontend (React + TypeScript + Vite + Tailwind)
├── mobile/          # Rider mobile app (Flutter)
├── server/          # Backend API (Node.js + Express + TypeORM)
├── scripts/         # Shared deployment script (PM2)
├── docs/            # Developer documentation (this folder)
├── README.md        # Top-level overview, including deployment guide
└── .gitignore
```

`server/` and `client/` are self-contained npm projects. `mobile/` is a Flutter project. There is no workspace/turbo setup — dependencies are installed per app.

## Ports & services

| Service | Port | Default URL | Source |
| --- | --- | --- | --- |
| Backend API | 8080 | http://localhost:8080/api/v1 | `server/` |
| Web client (dev) | 5173 | http://localhost:5173 | `client/` Vite |
| Web client (prod preview) | 4173 | http://localhost:4173 | `client/` `vite preview` under PM2 |
| PostgreSQL (local example) | 5433 | localhost:5433 | `server/.env` → `DB_PORT` |

Ports for the deployed server/client can be overridden via `PORT` / `CLIENT_PORT` in [scripts/deploy.sh](project-layout.md) (see [environment-variables.md](environment-variables.md)).

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express 5, TypeScript, TypeORM, PostgreSQL |
| Payments | Kpay, UrubutoPay |
| Messaging | WhatsApp Business API (Cloud API + Flows), Resend (email), Pindo (SMS) |
| Push notifications | OneSignal |
| Media | Cloudinary |
| Maps | Google Maps, Mapbox (configurable provider) |
| Web client | React 19, Vite, Redux Toolkit, TanStack Table, Tailwind CSS, shadcn/ui |
| Mobile | Flutter, go_router, Riverpod, dio, OneSignal |
| Deployment | PM2, `scripts/deploy.sh` |

## How the apps communicate

```
┌──────────────┐     HTTPS      ┌──────────────────┐      PostgreSQL
│  client/     │ ─────────────► │                  │ ──────► (persistence)
│  (web, 5173) │                │  server/         │
└──────────────┘                │  (API, 8080)     │
                                │  /api/v1/...     │
┌──────────────┐     HTTPS      │                  │
│  mobile/     │ ─────────────► │                  │
│  (rider app) │                └──────┬───────────┘
└──────────────┘                       │
                                       ├──► WhatsApp Business API  (customer messaging)
                                       ├──► Kpay / UrubutoPay      (payments + webhooks)
                                       ├──► Resend / Pindo         (email / SMS)
                                       └──► OneSignal / Cloudinary / Maps providers
```

- The **server** exposes a REST API under `/api/v1` and handles all business logic, persistence, and third-party integrations.
- The **client** is the admin/dashboard and public marketing site. It calls the server directly via axios.
- The **mobile** app is used by delivery riders to accept/track assignments. It calls the same API.
- **Customers** interact primarily through WhatsApp (server-driven conversations), with public order-tracking pages on the web client.

### Request flow (web/mobile → server)

```
Client request (axios)
  → server/app.ts middleware chain
      express.json / urlencoded → cors → passport → auditContext (AsyncLocalStorage)
  → routes/index.ts (mounted at /api/v1)
  → <feature>.routes.ts  (route + auth/authorize middlewares)
  → <feature>.controller.ts   (validate input via joi, map to HTTP)
  → <feature>.service.ts      (business logic, integrations)
  → TypeORM entities/subscribers → PostgreSQL
  → error handler middleware → JSON response
```

## Domain model (core entities)

```
User ─┬─ Role / UserRole        (ADMIN, STAFF, BUSINESS, RIDER, CUSTOMER)
      ├─ Order ─┬─ OrderAssignment ── User (rider)
      │         ├─ OrderActivity
      │         └─ Payment
      ├─ Organization ─┬─ OrganizationMembership ── User
      │                ├─ BusinessPlan
      │                └─ OrganizationBilling
      ├─ Conversation ── Message           (WhatsApp threads)
      ├─ Batch (bulk order imports)
      └─ AuditLog                          (change tracking)
```

Also: `PendingOrderSession`, `LocationSearchSession`, `PushSubscription`, `UserProblemReport`, `UserStatusProof`, `Log`.

## Backend at a glance

Entry points in `server/src/`:

- `server.ts` — process bootstrap (listens on `PORT`, uses Node cluster).
- `app.ts` — Express app: middleware, `/api/v1` mount, static uploads, error handler, DB connection.
- `data-source.ts` — TypeORM `DataSource` (entities, migrations, subscribers).
- `routes/index.ts` — aggregator that mounts every feature router under `/api/v1`.

Feature structure follows a consistent layering: `routes → controllers → services → entities`. See [server-layout.md](server-layout.md).

## Web client at a glance

Entry points in `client/src/`:

- `main.tsx` — React bootstrap.
- `App.tsx` — providers + `Router`.
- `routes/Router.tsx` — all routes; public pages use `PublicLayout`, authenticated pages use `AuthenticatedLayout` behind `ProtectedRoute`.
- `api/` — TanStack Query hooks (`queries`, `mutations`) wrapping axios.

Pages are organized by feature under `pages/`, with shared logic in `hooks/` and UI in `components/`. See [client-layout.md](client-layout.md).

## Mobile app at a glance

- `lib/main.dart` — Flutter entry (`ProviderScope` + `PeekabooApp`).
- `lib/src/app/` — bootstrap and go_router routes.
- `lib/src/state/` — Riverpod notifiers; `lib/src/api/` wraps dio. See [mobile-layout.md](mobile-layout.md).

## Deployment

`scripts/deploy.sh` builds and starts the server and web client under PM2. The rider app is built and released from CI (see `mobile/README.md`). Details are in the top-level [README.md](../README.md#-deployment).

Environment for the deploy script (all optional): `NODE_MAJOR`, `NODE_ENV`, `PORT`, `CLIENT_PORT`, `SERVER_PM2_NAME`, `CLIENT_PM2_NAME`, `GIT_PULL`, `SEQUENTIAL` — documented in [environment-variables.md](environment-variables.md).

## Common developer workflows

### Add a new backend feature
1. Create `entities/<feature>.entity.ts` (register in `entities/index.ts` and `data-source.ts`).
2. Add `<feature>.service.ts` (business logic), `<feature>.controller.ts` (HTTP), `<feature>.routes.ts` (endpoints).
3. Mount the router in `routes/index.ts`; add any constants/types/validations.
4. Add an audit-log decorator if the entity must be tracked (`@AuditUpdate` / `@AuditDelete`).

### Add a new client page
1. Create the page under `client/src/pages/<feature>/`.
2. Add a data hook in `client/src/hooks/<feature>/` using the `api/` layer (query + mutations).
3. Register the route in `client/src/routes/Router.tsx` (public → `PublicLayout`; authenticated → `AuthenticatedLayout` + `ProtectedRoute`).
4. Wire column definitions (`columns.*.tsx`) and UI primitives from `components/ui`.

### Wire a new integration (e.g. a third-party provider)
1. Add an adapter under `server/src/integrations/<provider>/`.
2. Add the env vars to `server/.env.example` **and** document them in [environment-variables.md](environment-variables.md).
3. Reference them through a config module and degrade gracefully when unset.

## Conventions shared across the repo

- **TypeScript** in `server/` and `client/`; Dart in `mobile/`.
- **Per-app configuration.** `server/` and `client/` use `.env` (see committed `.env.example` files). The rider app uses `--dart-define` instead of a `.env` file. Client variables are also documented in `client/README.md` and [environment-variables.md](environment-variables.md).
- **Feature folders** rather than flat file lists; shared code is colocated near the feature that owns it.
- **Config over hardcoding:** env vars and per-feature constants live in `constants/` and are never duplicated across apps.
- Each app has its own README that is kept up to date — start there when working inside an app.
