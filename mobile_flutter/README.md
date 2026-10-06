# Peekaboo Rider (Flutter)

Flutter rebuild of the rider app at full parity with the Expo app, restyled to
the `DESIGN.md` system. Decision record:
[docs/mobile-flutter-rebuild.md](../docs/mobile-flutter-rebuild.md).

## Prerequisites

- Flutter stable `3.47.6` (`flutter --version`)
- A running backend (`server/`, default `http://localhost:8080/api/v1`)
- For device builds: Android SDK and/or Xcode with CocoaPods

## Run

```bash
cd mobile_flutter
flutter pub get

# Simulator/emulator (localhost API works here)
flutter run

# Physical device: point at your machine's LAN IP, e.g.
flutter run --dart-define API_BASE_URL=http://192.168.1.20:8080/api/v1
```

All configuration is `--dart-define` (no `.env` files):

| Define | Default | Notes |
| --- | --- | --- |
| `API_BASE_URL` | `http://localhost:8080/api/v1` (debug) | Prod: `https://server.peekaboo.co.rw/api/v1` |
| `ONESIGNAL_APP_ID` | empty (push disabled) | Must match server `ONESIGNAL_APP_ID` |
| `LOCATION_UPDATE_INTERVAL_MINUTES` | `5` | Foreground location reporting |

## Checks

```bash
flutter analyze
flutter test
```

Theme compliance (also enforced in CI):

```bash
# Each must print nothing:
grep -rn "FontWeight\.w[6-9]" lib test
grep -rn "LinearGradient\|RadialGradient\|SweepGradient" lib test
grep -rn "letterSpacing" lib
```

Dev-only theme gallery (visual review): run the app and navigate to
`/gallery` (e.g. via deep link); it is not linked from production UI.

## Internal builds

CI builds a debug APK per `main` push and compile-checks iOS. Locally:

```bash
flutter build apk --debug --dart-define API_BASE_URL=...
flutter build ios --no-codesign
```

## Store releases

Push a `rider-v*` tag; CI uploads to the Play internal track and TestFlight.
Promote to production in the store consoles. Required repository secrets:

| Secret | Purpose |
| --- | --- |
| `RIDER_API_BASE_URL` | Prod API URL (defaults to `https://server.peekaboo.co.rw/api/v1`) |
| `ONESIGNAL_APP_ID` | Push app ID (defaults to the ID in `mobile/eas.json`) |
| `ANDROID_KEYSTORE_BASE64` | Release keystore (base64) |
| `ANDROID_STORE_PASSWORD` / `ANDROID_KEY_ALIAS` / `ANDROID_KEY_PASSWORD` | Keystore credentials |
| `PLAY_JSON_KEY` | Play service-account JSON (for `supply`) |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `ASC_KEY_ID` / `ASC_ISSUER_ID` / `ASC_KEY_P8_BASE64` | App Store Connect API key |
| `IOS_CERT_P12_BASE64` / `IOS_CERT_PASSWORD` | Distribution certificate |
| `IOS_PROFILE_BASE64` / `IOS_PROFILE_NAME` | App Store provisioning profile |

Optional variable: `LOCATION_UPDATE_INTERVAL_MINUTES` (default `5`).

## Project layout

```
lib/
  main.dart
  src/
    app/        # MaterialApp.router, go_router routes
    config/     # --dart-define config, storage keys
    theme/      # DESIGN.md tokens + ThemeData (single source of truth)
    models/     # User, Order, Assignment, Dashboard
    api/        # dio client + typed endpoint modules
    storage/    # secure storage
    state/      # Riverpod notifiers (auth, assignments, dashboard)
    i18n/       # en/rw string tables (1:1 port)
    services/   # OneSignal push, location tracking, media
    utils/      # formatters, validators, error classification
    widgets/    # design-system primitives + feature widgets
    screens/    # login, support, dashboard, assignments, detail, profile
test/           # i18n parity, formatters, error mapping, dashboard mapping
```

## Notes

- Bundle ID `com.peekaboo.rider` is preserved from the Expo app.
- `/api/v1` is consumed unchanged; the server is out of scope for this app.
- Known minor parity gaps vs the Expo app (documented, not silent): avatar
  images upload uncropped (no crop UI); no Notification Service Extension yet
  (push works; rich attachments/badges are a follow-up verified on a Mac with
  Xcode).
