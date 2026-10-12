# Peekaboo Rider (Flutter)

Flutter rebuild of the rider app at full parity with the Expo app, restyled
to match the implemented client UI (`client/src/index.css` + components).
Decision record:
[docs/mobile-flutter-rebuild.md](../docs/mobile-flutter-rebuild.md); layout
map: [docs/mobile-layout.md](../docs/mobile-layout.md).

## Prerequisites

- Flutter stable `3.47.6` (`flutter --version`)
- Nothing else for the API: builds talk to the hosted server
  (`https://server.peekaboo.co.rw/api/v1`) unless `API_BASE_URL` overrides it
- For device builds: Android SDK and/or Xcode with CocoaPods

## Run

```bash
cd mobile
flutter pub get

# Hosted API (default)
flutter run --dart-define ONESIGNAL_APP_ID=...

# Local server instead: Android emulator reaches your machine at 10.0.2.2;
# a physical device needs your machine's LAN IP, e.g.
flutter run --dart-define API_BASE_URL=http://192.168.1.20:8080/api/v1 \
  --dart-define ONESIGNAL_APP_ID=...
```

All configuration is `--dart-define` (no `.env` files):

| Define | Default | Notes |
| --- | --- | --- |
| `API_BASE_URL` | `https://server.peekaboo.co.rw/api/v1` | Override to use a local server (`http://10.0.2.2:8080/api/v1` on the Android emulator). |
| `ONESIGNAL_APP_ID` | empty (push disabled) | Must match server `ONESIGNAL_APP_ID` |
| `LOCATION_UPDATE_INTERVAL_MINUTES` | `5` | Foreground location reporting |

## Checks

```bash
flutter analyze
flutter test
```

Theme compliance (also enforced in CI — each must print nothing):

```bash
grep -rn "FontWeight\.w[6-9]" lib test
grep -rn "LinearGradient\|RadialGradient\|SweepGradient" lib test
grep -rn "letterSpacing" lib
grep -rn "Color(0x" lib --include="*.dart" | grep -v "theme/tokens.dart"
```

Debug-only theme gallery (visual review): run a debug build and open
`/gallery` (e.g. via deep link). It is not linked from any UI and 404s in
release builds.

## Internal builds

Every `main` merge ships installable builds from CI
(`.github/workflows/mobile-flutter.yaml`): a signed release APK (workflow
artifact) and a TestFlight upload. Local equivalents:

```bash
# Needs android/key.properties (see release-android job for the format)
flutter build apk --release --dart-define API_BASE_URL=...

# Needs Apple signing (see ios/fastlane/Fastfile)
flutter build ipa --release --dart-define API_BASE_URL=...
```

## Store releases

Push a `rider-v*` tag (e.g. `rider-v1.2.3`); CI uploads the AAB to the Play
internal track and the IPA to TestFlight. Build names come from the tag,
build numbers from `github.run_number`. Promote to production in the store
consoles. Required repository secrets:

| Secret | Purpose |
| --- | --- |
| `RIDER_API_BASE_URL` | Prod API URL (defaults to `https://server.peekaboo.co.rw/api/v1`) |
| `ONESIGNAL_APP_ID` | Push app ID (must match the server value) |
| `ANDROID_KEYSTORE_BASE64` | Release keystore (base64) |
| `ANDROID_STORE_PASSWORD` / `ANDROID_KEY_ALIAS` / `ANDROID_KEY_PASSWORD` | Keystore credentials |
| `PLAY_JSON_KEY` | Play service-account JSON (for `supply`) |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `ASC_KEY_ID` / `ASC_ISSUER_ID` / `ASC_KEY_P8_BASE64` | App Store Connect API key |
| `IOS_CERT_P12_BASE64` / `IOS_CERT_PASSWORD` | Distribution certificate |
| `IOS_PROFILE_BASE64` / `IOS_PROFILE_NAME` | App Store provisioning profile |

Optional variable: `LOCATION_UPDATE_INTERVAL_MINUTES` (default `5`).

## Branding

Launcher icons and the monochrome native splash (white in light mode,
black in dark) generate from art staged in `assets/branding/` (the dark
splash logo is an inverted copy for visibility on black). Regenerate after
changing the art:

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

## Project layout

```
lib/
  main.dart
  src/
    app/        # PeekabooApp bootstrap, go_router routes
    config/     # --dart-define config, storage keys
    theme/      # client-UI tokens + ThemeData (single source of truth)
    models/     # User, Order, Assignment, Dashboard
    api/        # dio client + typed endpoint modules
    storage/    # secure storage
    state/      # Riverpod notifiers (auth, assignments, dashboard)
    i18n/       # en/rw string tables (default rw, parity-tested)
    services/   # OneSignal push, location tracking, media
    utils/      # formatters, validators, error classification
    widgets/    # design-system primitives + feature widgets
    screens/    # login, support, tabs, dashboard, assignments, detail, profile
test/           # i18n parity, formatters, errors, mapping, state, widgets
assets/
  images/       # bundled images (app logo)
  branding/     # icon/splash generator sources (not bundled)
```

## Notes

- Bundle ID `com.peekaboo.rider` and secure-storage keys are preserved from
  the Expo app so reinstalls keep working.
- `/api/v1` is consumed unchanged; the server is out of scope for this app.
- Directions always open Google Maps — never Apple Maps.
- Known minor parity gaps vs the Expo app (documented, not silent): avatar
  images upload uncropped (no crop UI); no Notification Service Extension yet
  (push works; rich attachments/badges are a follow-up verified on a Mac with
  Xcode).
