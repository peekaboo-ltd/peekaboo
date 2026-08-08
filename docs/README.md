# Peekaboo — Developer Documentation

Welcome! This folder is the onboarding reference for developers joining the Peekaboo project. It documents the layout, configuration, and conventions of every part of the repository.

## What is Peekaboo?

Peekaboo is a delivery & fleet management platform. Customers order via **WhatsApp** (server-driven conversation flows), **businesses and admins** manage orders, riders, payments, and fleets through the **web dashboard**, and **riders** accept and complete deliveries using the **mobile app**. Payments are processed through **UrubutoPay** (primary) and **Kpay** (secondary).

## Repository layout

The repository is a monorepo with three applications and a shared deployment script:

```
peekaboo/
├── client/    # Web dashboard & public site (React + Vite + TypeScript)
├── mobile/    # Rider mobile app (React Native + Expo Router)
├── server/    # Backend API (Node.js + Express + TypeORM + PostgreSQL)
├── scripts/   # Shared deployment automation (deploy.sh)
└── docs/      # This documentation
```

Each app is an independent npm project (own `package.json`, lockfile, README). There is no workspace/turbo setup — install dependencies per app.

## Documentation index

| Document | Covers |
| --- | --- |
| [project-layout.md](project-layout.md) | Top-level architecture, tech stack, how the apps talk to each other, shared conventions, and common workflows. |
| [environment-variables.md](environment-variables.md) | **Complete reference for every environment variable** across server, client, mobile, and the deploy script — including defaults, required flags, and where each is read. |
| [server-layout.md](server-layout.md) | Backend folder-by-folder guide: entry points, routing, services, entities, integrations, webhooks, cron jobs, and scripts. |
| [client-layout.md](client-layout.md) | Web client folder-by-folder guide: pages, containers, hooks, API layer, state, and routing. |
| [mobile-layout.md](mobile-layout.md) | Rider mobile app folder-by-folder guide: screens, components, services, stores, and config. |

**Recommended reading order:** `project-layout.md` → `server-layout.md` → `client-layout.md` → `mobile-layout.md`. Read `environment-variables.md` whenever you need to configure or debug an integration.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20+ (18+ for client, 18+ for mobile) | The deploy script installs Node 20 by default. |
| npm | bundled with Node | |
| PostgreSQL | any recent version | Used by the server. |
| Git | any | |
| Expo CLI (optional) | latest | Only needed for the mobile app; `npx expo` works too. |

You will also need accounts/credentials for the integrations you plan to use (see [environment-variables.md](environment-variables.md)): WhatsApp Business API, UrubutoPay/Kpay, Google OAuth + Maps, Resend, Pindo, OneSignal, Cloudinary.

## Quick start (all three apps)

### 1. Backend — `server/`

```bash
cd server
npm install
cp .env.example .env        # then edit .env with your values
npm run seed:roles          # seed role records
npm run dev                 # http://localhost:8080 (TypeORM syncs the schema on boot)
```

- Every server env variable is documented in [environment-variables.md](environment-variables.md).
- Seed scripts: `npm run seed:admin`, `npm run seed:roles`, `npm run seed:business-plans`, `npm run seed:rider-attendance`, `npm run seed:rider-problem-reports`.
- Local admin defaults: email `info@peekaboo.co.rw`, phone `0780000000`, password `Admin123!` (override via `SEED_ADMIN_*`).

### 2. Web client — `client/`

```bash
cd client
npm install
# create client/.env (no committed .env.example):
#   VITE_API_BASE_URL=http://localhost:8080/api/v1
npm run dev                 # Vite dev server (default http://localhost:5173)
```

Client env vars: `VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_INACTIVITY_TIMEOUT`, `VITE_NODE_ENVIRONMENT`. See [environment-variables.md](environment-variables.md).

### 3. Mobile app — `mobile/`

```bash
cd mobile
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_BASE_URL
npx expo start              # press i / a for simulators, or scan QR in Expo Go
```

For teammates on physical devices, use your **LAN IP** (e.g. `http://192.168.1.20:8080/api/v1`), not `localhost`. For EAS cloud builds, values go in `eas.json` profile env or EAS secrets. See [mobile-layout.md](mobile-layout.md) and [environment-variables.md](environment-variables.md).

> The backend must be running (and reachable) before the web client and mobile app can serve data.

## Ports & services quick reference

| Service | Port | URL | Started by |
| --- | --- | --- | --- |
| Backend API | 8080 | http://localhost:8080/api/v1 | `server`: `npm run dev` |
| Vite dev server | 5173 | http://localhost:5173 | `client`: `npm run dev` |
| Vite preview (prod) | 4173 | http://localhost:4173 | deploy script / `client`: `npm run preview` |
| PostgreSQL | 5433 (dev example) | localhost:5433 | your local Postgres |

## Troubleshooting quick reference

| Symptom | Likely cause / fix |
| --- | --- |
| Server logs "database connection failed" | `DB_*` vars wrong, or Postgres not running on `DB_HOST:DB_PORT`. |
| Mobile app can't reach API on a phone | `EXPO_PUBLIC_API_BASE_URL` uses `localhost`; use your LAN IP and ensure the backend binds to `0.0.0.0`. |
| Payments fail on a new machine | UrubutoPay vars missing or invalid — check startup warnings; see [environment-variables.md](environment-variables.md). |
| WhatsApp messages/orders not working | `WHATSAPP_BUSINESS_*` or `WHATSAPP_FLOW_*` vars incomplete; verify the webhook is registered with the verify token. |
| Emails/SMS/push not sent | Respective API keys unset (`RESEND_API_KEY`, `PINDO_TOKEN`, `ONESIGNAL_*`). Emails degrade gracefully. |
| 10 RWF charges locally | Expected: `NODE_ENV=development` forces dev pricing. Use `NODE_ENV=production` for full fees. |
| Push subscriptions don't appear in OneSignal | Must use a dev client on a physical device; `EXPO_PUBLIC_ONESIGNAL_APP_ID` must match server `ONESIGNAL_APP_ID`. |
| Client can't load maps | `VITE_GOOGLE_MAPS_API_KEY` unset/invalid. |

See each app README for deeper troubleshooting (`server/README.md`, `client/README.md`, `mobile/README.md`).

## Glossary

| Term | Meaning |
| --- | --- |
| **Order** | A delivery request (SEND/RECEIVE) with sender, recipient, locations, fee, and status. |
| **Assignment** | Linking a rider to an order (PENDING/ACCEPTED/REJECTED/etc.). |
| **WhatsApp Flow** | Meta's interactive form flow used to collect order details from customers inside WhatsApp. |
| **RBAC** | Role-based access control. Roles: `ADMIN`, `STAFF`, `BUSINESS`, `RIDER`, `CUSTOMER`. |
| **Audit log** | Immutable record of CREATE/UPDATE/DELETE actions on tracked entities. |
| **Business plan / Organization** | B2B tiering: organizations subscribe to business plans, get members, batches, and billing. |
| **Batch** | A bulk import of orders (e.g. spreadsheet) for B2B clients. |
| **UrubutoPay / Kpay** | Rwandan payment gateways used for order checkout. |
| **EAS** | Expo Application Services — cloud builds for the mobile app. |
| **LAN mode** | Expo dev server reachable over the local network for physical devices. |

## Where to go next

Start with [project-layout.md](project-layout.md) for the big picture. When you need to configure anything, open [environment-variables.md](environment-variables.md). Then dive into the layout doc for whichever app you are working on.
