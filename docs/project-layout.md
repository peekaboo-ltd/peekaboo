# Project Layout — High-Level Architecture

This document describes the overall layout of the Peekaboo repository: what each top-level directory is for, the tech stack, and how the pieces communicate.

## Monorepo overview

```
peekaboo/
├── client/          # Web frontend (React + TypeScript + Vite + Tailwind)
├── mobile/          # Rider mobile app (React Native + Expo)
├── server/          # Backend API (Node.js + Express + TypeORM)
├── scripts/         # Shared deployment script (PM2)
├── docs/            # Developer documentation (this folder)
├── README.md        # Top-level overview, including deployment guide
└── .gitignore
```

Each app is a self-contained npm project with its own `package.json`, lockfile, and README. There is no workspace/turbo setup — dependencies are installed per app.

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
| Mobile | React Native (Expo 54), Expo Router, Zustand, Axios, OneSignal |
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

- `app/` — Expo Router file-based routing: `(auth)`, `(tabs)`, `assignment/[id]`.
- `components/`, `hooks/`, `services/`, `store/`, `types/`, `utils/` — feature folders.
- Zustand stores persist auth/assignment state; `services/api` wraps axios. See [mobile-layout.md](mobile-layout.md).

## Deployment

`scripts/deploy.sh` builds and starts the server and web client under PM2. The mobile app is distributed via EAS Build (see `mobile/` README). Details are in the top-level [README.md](../README.md#-deployment).

## Conventions shared across the repo

- **TypeScript everywhere**; no plain JS in app code.
- **Per-app environment files** (`.env`), each with an `.env.example` documenting variables.
- **Feature folders** rather than flat file lists; shared code is colocated near the feature that owns it.
- Each app has its own README that is kept up to date — start there when working inside an app.
