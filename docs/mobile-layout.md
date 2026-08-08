# Mobile Layout — Rider App

React Native app for delivery riders (Expo SDK 54, Expo Router file-based routing, Zustand state, OneSignal push). Full feature/setup docs live in [mobile/README.md](../mobile/README.md); this file maps the directory layout.

## Entry points

| File | Responsibility |
| --- | --- |
| `app/_layout.tsx` | Root layout: `I18nProvider` wrapper, auth bootstrap, OneSignal init, location tracking hook, root `Stack`. |
| `app.json` / `app.config.ts` | Expo app config; `app.config.ts` computes OneSignal APNs mode from the EAS build profile. |
| `eas.json` | EAS build profiles (development, preview, production). |
| `package.json` | Scripts (Expo/EAS builds); `postinstall` runs `patch-package` (see `patches/`). |

## File-based routing (`app/`)

Expo Router derives navigation from the folder structure:

```
app/
├── _layout.tsx            # Root Stack
├── (auth)/
│   ├── _layout.tsx        # Auth stack
│   ├── login.tsx          # Login screen
│   └── support.tsx        # Support screen
├── (tabs)/
│   ├── _layout.tsx        # Bottom tab bar (redirects to login if unauthenticated)
│   ├── dashboard.tsx      # Rider dashboard
│   ├── assignments.tsx    # Assignment list
│   ├── profile.tsx        # Rider profile
│   ├── index.tsx / two.tsx# Template leftovers, hidden via href: null
├── assignment/
│   └── [id].tsx           # Assignment detail screen (dynamic route)
└── +not-found.tsx
```

`(auth)` and `(tabs)` are route groups: they organize screens without adding a path segment.

## Directory reference

### `components/`
- `ui/` — reusable primitives: `Button`, `Input`, `Card`, `Badge`, `LanguageSwitcher` (re-exported from `index.ts`).
- `assignments/` — `AssignmentCard`, `AssignmentDetails`, `AssignmentActions`, `AssignmentFilters`, `AssignmentDirectionsMap`, skeletons; `index.ts` barrel.
- `dashboard/` — `StatCard`, `RecentActivity`; `index.ts` barrel.

### `hooks/`
- `useAuth.ts`, `useAssignments.ts`, `useDashboard.ts` — screen-facing data hooks over the stores/services.
- `useLocationTracking.ts` — periodic rider-location reporting (interval from `EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL_MINUTES`).
- `index.ts` — barrel.

### `services/`
- `api/` — axios client + typed endpoints: `client.ts`, `auth.ts`, `assignments.ts`, `orders.ts`, `dashboard.ts`, `users.ts`; `index.ts` barrel.
- `storage/` — `secureStorage.ts` (expo-secure-store token persistence).
- `notifications/` — `pushNotifications.ts` (OneSignal init/listeners), `index.ts`.

### `store/`
Zustand stores (state + async actions):
- `authStore.ts` — token/user session, login/logout/checkAuth.
- `assignmentStore.ts` — assignment list, refresh, accept/reject actions.
- `dashboardStore.ts` — dashboard data.
- `index.ts` — barrel.

### `types/`
TypeScript domain types: `auth.ts`, `assignment.ts`, `order.ts`, `dashboard.ts` (plus `index.ts`).

### `utils/`
- `constants.ts` — design tokens (`colors`, spacing).
- `formatters.ts`, `validators.ts`, `errorHandler.ts` — helpers.

### `constants/`
- `Colors.ts` — color palette.
- `order.constants.ts` — order/assignment status constants.

### `i18n/`
`index.tsx` — `I18nProvider` + `useI18n` hook + translation strings.

### `assets/`
Icons, splash, and adaptive icons referenced by `app.config.ts`.

### `patches/`
`patch-package` patches applied automatically on `npm install`.

## Data flow

```
Screen (app/**) ──► hooks/* ──► store/* (Zustand) ──► services/api/* (axios)
                              └── services/storage (token)          └──► server /api/v1
```

Push notifications (OneSignal) arrive in `services/notifications`; assignment notifications trigger a store refresh so lists update without a manual pull.

## Environment

`mobile/.env` (see `mobile/.env.example`):
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_ONESIGNAL_APP_ID=...
EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL_MINUTES=5
```

> For physical devices, use a LAN IP (not `localhost`) in `EXPO_PUBLIC_API_BASE_URL`. EAS cloud builds need `EXPO_PUBLIC_*` values provided in `eas.json` env or EAS secrets — local `.env` files are not used.

## Key commands (from `mobile/`)

```bash
npx expo start                     # dev server (LAN; press i/a for simulators)
npx expo start --lan               # force LAN mode
npm run ios / npm run android      # native dev builds (expo run:*)
npm run build:android / build:ios  # EAS cloud builds (production profile)
npm run build:android:preview      # EAS preview build
```

## Conventions

- Use the shared UI primitives in `components/ui` instead of raw `react-native` components where possible.
- Feature components live in `components/<feature>/`; shared business logic lives in hooks + Zustand stores.
- OneSignal app IDs must match between `mobile/.env` (`EXPO_PUBLIC_ONESIGNAL_APP_ID`) and the server (`ONESIGNAL_APP_ID`).
