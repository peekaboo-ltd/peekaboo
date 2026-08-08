# Client Layout — Web Frontend

React 19 + Vite + TypeScript + Tailwind CSS web application (admin dashboard, public marketing site, and public order-tracking pages). Full feature/setup docs live in [client/README.md](../client/README.md); this file maps the directory layout.

> **Configuration:** client env vars (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_INACTIVITY_TIMEOUT`, `VITE_NODE_ENVIRONMENT`) are documented in [environment-variables.md](environment-variables.md). Create `client/.env` manually — there is no committed `.env.example`.

## Data flow

```
Page (pages/*) ──► Hook (hooks/*) ──► api layer (api/queries + api/mutations, TanStack Query)
                                          └──► axios ──► server /api/v1
State (states/* Redux Toolkit slices)
UI (components/* — ui primitives + feature components, tables via TanStack Table)
```

- Pages are thin: they render components and use hooks; business data comes through TanStack Query hooks in `api/` + feature hooks in `hooks/`.
- Server state is cached/invalidated via `api/queries` and `api/mutations`; local UI state (sidebar, onboarding) lives in Redux slices.

## Entry points

| File | Responsibility |
| --- | --- |
| `index.html` | Vite HTML shell. |
| `src/main.tsx` | React bootstrap: mounts `<App />`. |
| `src/App.tsx` | Providers (Redux store, theme, i18n, query client) + `Router`. |
| `src/index.css` | Global styles / Tailwind entry. |
| `vite.config.ts` | Vite config (React SWC plugin, Tailwind, path alias `@/` → `src/`). |

## Directory reference (`src/`)

### `routes/`
- `Router.tsx` — the single source of truth for routing. Public pages render inside `PublicLayout`; authenticated pages render inside `AuthenticatedLayout`, wrapped by `ProtectedRoute` for role-based access. Roles: `ADMIN`, `STAFF`, `BUSINESS`, `RIDER`, `CUSTOMER`.
- `ProtectedRoute.tsx` — guards routes by authentication + allowed roles.
- `index.ts` — re-exports.

### `pages/`
Top-level screen components, grouped by area:

| Folder | Content |
| --- | --- |
| `home/` | Public marketing/landing page (hero, features, business solutions, testimonials, contact form) + `useHomeContent` data hook. |
| `auth/` | Login, Register, Forgot/Reset password, OAuth callback, account completion. |
| `dashboard/` | Authenticated dashboard (metric cards, charts, dispatch strip, activity panel) with `components/` subfolder. |
| `orders/` | Orders list, create, delete. |
| `order-assignments/` | Assignment list/details, accept/reject/reassign flows. |
| `users/` | Users list, profiles, rider management, tracking, location history, modals. |
| `organizations/` | Organization management, invites, settings. |
| `business-plans/` | Plans list/create/manage. |
| `payments/` | Payments list and details, update status modal. |
| `billing/` | Billing payments and report. |
| `batches/` | Batch import/list/details/preview. |
| `public/orders/` | Public (unauthenticated) order tracking, details, and payment success. |
| `onboarding/` | Admin/organization/user-management onboarding flows. |
| `services/`, `about/`, `contact/`, `legal/` | Public content pages. |
| `common/` | NotFound (404) and Unauthorized pages. |

### `containers/`
Composition components that wire data + pages together:
- `navigation/` — `PublicLayout`/`PublicNavbar`, `AuthenticatedLayout`/`AuthenticatedSidebar`/`AuthenticatedNavbar`.
- `orders/` — `OrderDetails` container.
- `locations/` — `RouteCalculator`, `LocationDisplay`, `AdministrativeLocation`.
- `organizations/` — `OrganizationMembers`.

### `components/`
Reusable presentational components:
- `ui/` — shadcn/ui primitives (button, input, dialog, table, select, badge, etc.).
- `inputs/` — form controls and shared inputs (Select, DatePicker, PlaceSearch, StatusBadge, Loader, LanguageSelector, CustomBreadcrumb, etc.).
- `table/` — generic `Table` + `TablePagination`.
- `layout/` — `InternalPage`, `PublicPage`, `Footer`.
- `modals/` — `OrderPayment`, `UpdateOrderLocationFrom/To`.
- `orders/` — `OrderMap`, `InlineRiderSelect`.
- `dashboard/` — metric cards, charts, status tabs.
- `auth/` — `SessionExpiredModal`.
- `users/`, `audit/`, `seo/`, `three/` — user forms, `AuditLogDetails`, `SEO` helper, three.js scenes (`HeroScene`, `BusinessScene`).

### `hooks/`
Custom hooks organized by feature (auth, users, orders, payments, batches, business-plan, organization, locations, common). Naming conventions:
- `*.hooks.ts` — data fetching via TanStack Query.
- `columns.*.tsx` — TanStack Table column definitions (orders, users, payments, batches, organization, business plans, rider management).

### `api/`
TanStack Query layer over axios:
- `queries/` — `*.queries.ts` (auth, orders, orderActivity, orderAssignment, payments, users, dashboard, landing, batch, businessPlan, organization, payments).
- `mutations/` — `*.mutations.ts` (same feature set).
- `index.ts` — axios client + query keys.

### `states/`
Redux Toolkit: `store.ts`, feature `slices/` (`auth`, `user`, `order`, `orderAssignment`, `orderActivity`, `payment`, `batch`, `businessPlan`, `organization`, `onboarding`, `sidebar`), and typed `hooks.ts`.

### `types/`
TypeScript types per domain: `auth.type.ts`, `user.type.ts`, `order.type.ts`, `orderAssignment.type.ts`, `orderActivity.type.ts`, `payment.types.ts`, `organization.type.ts`, `batch.type.ts`, `businessPlan.type.ts`, `dashboard.type.ts`, `landing.type.ts`, `table.types.ts`, `base.ts`, `index.ts`.

### `constants/`
`navigation.constants.ts` (sidebar nav), `order.constants.ts`, `user.constants.ts`, `countries.constants.ts`, `environments.constants.ts`, `inputs.constants.ts`.

### `utils/`
Pure helpers: `strings.util.ts`, `phone.util.ts`, `password.util.ts`, `location.util.ts`, `locations.util.ts`, `errorHandler.util.ts`, `localStorage.util.ts`, `dashboard.util.ts`, `billingGuard.util.ts`, `profilePhoto.util.ts`.

### `data/`
Mock/static data (e.g. `dashboard.mock.ts`).

### `i18n/`
i18n setup (translations provider/hooks).

### `lib/`
Small shared utilities (e.g. `utils.ts` — `cn()` class-merge helper).

## Routing model

- **Public** routes (`/`, `/auth/*`, `/track-order`, `/services`, `/about`, `/contact`, `/legal/*`, public order pages) use `PublicLayout`.
- **Authenticated** routes (`/admin/*`) use `AuthenticatedLayout` with sidebar + top nav. Feature routes live under `/admin/orders`, `/admin/users`, `/admin/payments`, `/admin/organizations`, etc.
- `ProtectedRoute` takes `allowedRoles` and redirects unauthenticated/forbidden users appropriately.

## Environment

`client/.env` (read at build time by Vite; only `VITE_`-prefixed vars are exposed to the browser):

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=...
VITE_INACTIVITY_TIMEOUT=5            # minutes before session-expired modal
VITE_NODE_ENVIRONMENT=development    # optional override; drives dev pricing UI disclaimer
```

Every variable is documented in [environment-variables.md](environment-variables.md).

**Development pricing:** when `VITE_NODE_ENVIRONMENT` (or Vite `MODE`) equals `development`, the UI shows catalog fees with a disclaimer that checkout charges 10 RWF (`isDevelopmentPricing`). The server is the source of truth via `NODE_ENV` — keep both in agreement locally.

## Key commands (from `client/`)

```bash
npm run dev        # Vite dev server
npm run build      # type-check + production build
npm run lint       # ESLint
npm run preview    # serve production build
```

## Build & deployment

- `npm run build` runs Vite and emits `dist/`; the dev server defaults to http://localhost:5173.
- The `build` script also runs `npm i` first — for CI, prefer `npm ci && npx vite build`.
- Deployed with the server under PM2 via `vite preview --host 0.0.0.0 --port $CLIENT_PORT` (see `scripts/deploy.sh`).
- `vercel.json` rewrites all routes to `index.html` for SPA fallback (used if the client is hosted on Vercel).

## Conventions

- Feature code is colocated: a page imports its data hook (from `hooks/`), which uses the `api/` layer; column definitions live next to their hooks as `columns.*.tsx`.
- All UI primitives come from `components/ui` (shadcn); do not hand-roll a new button/input when one exists.
- `@/` aliases `src/` in imports.
