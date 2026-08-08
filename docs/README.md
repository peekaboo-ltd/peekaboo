# Peekaboo — Developer Documentation

This folder is the onboarding reference for developers joining the Peekaboo project. It documents the layout and responsibilities of every part of the repository so new contributors can find their way around quickly.

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

## Documentation index

| Document | Covers |
| --- | --- |
| [project-layout.md](project-layout.md) | Top-level architecture, tech stack, how the apps talk to each other, and shared conventions. |
| [server-layout.md](server-layout.md) | Backend folder-by-folder guide: entry points, routing, services, entities, integrations, and scripts. |
| [client-layout.md](client-layout.md) | Web client folder-by-folder guide: pages, containers, hooks, API layer, state, and routing. |
| [mobile-layout.md](mobile-layout.md) | Rider mobile app folder-by-folder guide: screens, components, services, stores, and config. |

## Quick start (all three apps)

1. **Backend** — `server/`
   - Copy `server/.env.example` to `server/.env` and fill in values (database, WhatsApp, payment providers).
   - `npm install`
   - Run migrations / seeds as documented in [server-layout.md](server-layout.md).
   - `npm run dev` → http://localhost:8080

2. **Web client** — `client/`
   - Set `VITE_API_BASE_URL` (and `VITE_GOOGLE_MAPS_API_KEY` if using maps) in `client/.env`. There is no committed `.env.example` for the client; see the `client/README.md` for the variables.
   - `npm install`
   - `npm run dev` → Vite dev server (default http://localhost:5173)

3. **Mobile app** — `mobile/`
   - Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_BASE_URL`.
   - `npm install`
   - `npx expo start` then open in the iOS Simulator, Android Emulator, or Expo Go.

> The backend must be running (and reachable) before the web client and mobile app can serve data.

## Where to go next

Read [project-layout.md](project-layout.md) first for the big picture, then jump into the doc for whichever app you are working on.
