# Mobile Layout — Rider App (Flutter)

Rider app for delivery riders, built with Flutter (go_router navigation,
Riverpod state, OneSignal push). Full run/release docs live in
[mobile_flutter/README.md](../mobile_flutter/README.md); this file maps the
directory layout.

> **Configuration:** all rider config is `--dart-define`
> (`API_BASE_URL`, `ONESIGNAL_APP_ID`,
> `LOCATION_UPDATE_INTERVAL_MINUTES`), documented in
> [environment-variables.md](environment-variables.md).
>
> **Legacy Expo app:** `mobile/` (React Native) stays runnable until the
> flag-day cutover, then is deleted (see
> [mobile-flutter-rebuild.md](mobile-flutter-rebuild.md)). Its layout is
> described in [mobile/README.md](../mobile/README.md).

## Entry points

| File | Responsibility |
| --- | --- |
| `lib/main.dart` | Entry: `ProviderScope` + `PeekabooApp`. |
| `lib/src/app/app.dart` | Bootstrap: OneSignal init, auth restore, location tracking, notification deep links; cold-start tap queue. |
| `lib/src/app/router.dart` | go_router routes + auth redirects (`redirectFor`). |
| `pubspec.yaml` | Deps, fonts/assets, launcher-icon and splash generator config. |
| `android/fastlane/`, `ios/fastlane/` | Store-upload lanes (Play internal, TestFlight). |
| `.github/workflows/mobile-flutter.yaml` | CI: checks, main-branch internal builds, tag releases. |

## Routes (`lib/src/app/router.dart`)

| Path | Screen | Notes |
| --- | --- | --- |
| `/login` | `screens/login_screen.dart` | Rider sign-in (auth shell). |
| `/support` | `screens/support_screen.dart` | Support, reachable logged out. |
| `/dashboard` | `screens/dashboard_screen.dart` | Tab 1: metrics, shift toggle, activity. |
| `/assignments` | `screens/assignments_screen.dart` | Tab 2: filterable assignment queue (`?filter=`). |
| `/profile` | `screens/profile_screen.dart` | Tab 3: rider profile, language. |
| `/assignment/:id` | `screens/assignment_detail_screen.dart` | Detail + accept/reject/dispatch/complete. |
| `/gallery` | `screens/gallery_screen.dart` | Debug-only theme gallery (404 in release). |

Tabs share the `TabsShell` (black top bar + account menu, bottom nav).
Unauthenticated users redirect to `/login`; authenticated users leaving
`/login` land on `/dashboard`.

## Directory reference (`lib/src/`)

### `theme/`
Single source of truth for the look: `tokens.dart` (paper/ink/surface/line,
outcome colours, type, spacing) and `peekaboo_theme.dart` (`ThemeData`).
Follows the implemented client UI, not the `DESIGN.md` prose.

### `widgets/`
- Design-system primitives: `pk_button.dart`, `pk_card.dart`,
  `pk_text_field.dart`, `pk_badge.dart`, `pk_page_header.dart`,
  `pk_section_card.dart`, `dialogs.dart` (alert/confirm/snackbar),
  `step_trail.dart` (order progress), `reject_sheet.dart`.
- Feature widgets: `assignment_card.dart`, `assignment_actions.dart`,
  `assignment_details.dart`, `assignment_filters.dart`, `stat_card.dart`,
  `directions_map.dart`, `language_switcher.dart`, `error_view.dart`.

### `screens/`
Login, support, tabs shell, dashboard, assignments, assignment detail,
profile, not-found, gallery (debug only).

### `state/` (Riverpod notifiers)
- `auth_state.dart` — session, login/logout/checkAuth, 401 clearing.
  Offline restores keep the cached user; only a 401 logs out.
- `assignments_state.dart` — queue (newest row per order, sorted by order
  status), paging, accept/reject/recover/dispatch/complete.
- `dashboard_state.dart` — dashboard metrics + recent activity.

### `api/`
dio client (`api_client.dart`: Bearer [REDACTED] 401 delegation) + typed modules:
`auth_api.dart`, `assignments_api.dart`, `dashboard_api.dart`,
`boundaries_api.dart`, `users_api.dart`, `location_api.dart`.

### `models/`
`user.dart`, `order.dart`, `assignment.dart`, `dashboard.dart`.

### `services/`
`push_notifications.dart` (OneSignal wrapper), `location_tracking.dart`
(foreground periodic GPS), `media_service.dart` (proof photos).

### `storage/`
`secure_storage.dart` — keychain/keystore token + user + language
persistence (same keys as the Expo app).

### `i18n/`
`localizations.dart` (`localeProvider`, `tProvider`, `{{value}}`
interpolation) + `strings_en.dart` / `strings_rw.dart` (default rw).
Key parity is enforced by `test/i18n_test.dart`.

### `utils/`
`formatters.dart`, `validators.dart`, `app_error.dart` (Dio → translated
`AppError`), `order_helpers.dart`.

### `config/`
`app_config.dart` — `--dart-define` values. Release builds throw without
`API_BASE_URL`; debug falls back to localhost.

### `assets/`
- `assets/images/` — bundled images (app logo, fonts' companions).
- `assets/branding/` — generator sources (not bundled): iOS icon,
  adaptive foreground, light/dark splash art. Regenerate with
  `dart run flutter_launcher_icons` and
  `dart run flutter_native_splash:create`.

## Data flow

```
Screen (screens/*) ──► state/* (Riverpod) ──► api/* (dio) ──► server /api/v1
                            └── storage (token/user)
```

Push taps deep-link to `/assignment/:id` (queued across cold start);
assignment pushes refresh the queue. Rejects carry an optional reason to
`PATCH /order-assignments/:id/reject`.

## Environment

```bash
# Simulator/emulator (localhost API works here)
flutter run

# Physical device: LAN IP, never localhost
flutter run --dart-define API_BASE_URL=http://<LAN_IP>:8080/api/v1
```

> Release builds require an explicit `API_BASE_URL` and HTTPS (cleartext is
> debug-only on both platforms).

### CI builds (`.github/workflows/mobile-flutter.yaml`)

| Trigger | Android | iOS |
| --- | --- | --- |
| `main` push | Signed release APK artifact | TestFlight upload |
| `rider-v*` tag | Play internal AAB | TestFlight IPA |

Build numbers come from `github.run_number`; build names from the tag
(`1.0.0` on main). Secrets are listed in
[mobile_flutter/README.md](../mobile_flutter/README.md#store-releases).

### Push notifications (OneSignal)

- `ONESIGNAL_APP_ID` must match the server's value.
- External ID = API user UUID, so the Expo audience carries over.
- After login, verify the subscription under OneSignal Audience →
  Subscriptions. iOS ships without a Notification Service Extension
  (follow-up, not a cutover blocker).

## Key commands (from `mobile_flutter/`)

```bash
flutter pub get
flutter analyze && flutter test
flutter run --dart-define API_BASE_URL=... --dart-define ONESIGNAL_APP_ID=...
```

## Conventions

- No hard-coded `Color(0x…)` outside `theme/tokens.dart` (CI-enforced), no
  `FontWeight` above 500, no gradients, no `letterSpacing`.
- User-facing strings go through `tr('key')` with en/rw tables kept at
  key parity; errors and dates take `Translate` explicitly.
- Directions always open Google Maps — never Apple Maps.
