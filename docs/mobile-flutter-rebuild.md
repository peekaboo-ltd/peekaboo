# Mobile Flutter Rebuild — Decision Record

**Status:** Final (scope contract explicitly accepted by the user;
interview closed 2026-10-06).

**Goal:** Rebuild `mobile/` (Expo React Native rider app) in Flutter and
redesign it to match the updated `client/` UI (monochrome DM Sans system in
`DESIGN.md`).

## Settled constraints (from the request itself)

- Target framework is Flutter (replaces Expo React Native).
- Visual target is the updated client UI: `DESIGN.md` is the source of truth
  (monochrome structure, inversion highlight, DM Sans only, light weights, no
  gradients, Uber interaction physics, borders over shadows).
- Current mobile scope (from `docs/mobile-layout.md`, `mobile/README.md`):
  auth (login/support), tabs (dashboard, assignments, profile), assignment
  detail with accept/reject/directions, periodic location reporting, OneSignal
  push, i18n, secure token storage; backend is `server/` at `/api/v1`
  (prod `https://server.peekaboo.co.rw/api/v1`).

## Settled decisions

1. **Scope: full feature parity.** The Flutter app ships everything the Expo
   rider app has today (auth incl. support screen, dashboard, assignments +
   detail/actions, profile, location reporting, push, i18n), restyled to the
   `DESIGN.md` system. No rider-MVP cut, no new customer/business features.
   (Accepted: user chose option (a), 2026-10-06.)
2. **Location: new sibling directory; Expo deleted at cutover.** The Flutter
   app is built in a new sibling directory (proposed `mobile_flutter/`);
   `mobile/` stays untouched and runnable during the rebuild, then is deleted
   in one cutover commit with docs updated. No separate repo.
   (Accepted: user chose option (a), 2026-10-06.)

3. **Backend contract: reuse `/api/v1` unchanged.** `server/` is out of scope
   for this rebuild. Any genuine API gap found mid-rebuild becomes a separate,
   explicitly approved server change, not part of this scope.
   (Accepted: user chose option (a), 2026-10-06.)

4. **Push: keep OneSignal.** Flutter app uses the OneSignal Flutter SDK
   against the existing OneSignal app (External ID = API user UUID), so
   audience/subscriptions carry over with no server change.
   (Accepted: user chose option (a), 2026-10-06.)

5. **Maps/location: keep the current approach.** Directions stay a
   webview/deep-link to Google Maps (no native map SDK, no API keys);
   location stays foreground-only periodic GPS posted to the backend. No
   background tracking. A native SDK is an explicit future upgrade, not
   rewrite work.
   (Accepted: user chose option (a), 2026-10-06.)

6. **Build/distribution: CI-built internal + store releases.** Every merge
   produces installable internal test builds for the team (Android APK + iOS
   internal/TestFlight); store releases are cut from tags. Local dev moves to
   `flutter run` on emulator/physical device. EAS retires with the Expo app.
   (Accepted: user chose option (a), 2026-10-06.)

## Open questions

7. **i18n: English + Kinyarwanda at parity.** Default Kinyarwanda, same as
   today. French is explicitly out (client-only; adding it would be new
   translation work, a deliberate follow-up if riders need it).
   (Accepted: user chose option (a), 2026-10-06.)

8. **Rollout: flag-day cutover for all riders.** No pilot phases; every
   rider moves at once, then `mobile/` is deleted. Accepted against the
   recommendation (higher release-day risk, simpler operation).
   (Accepted: user chose option (b), 2026-10-06.)

## Open questions

_None — decision tree exhausted. Awaiting explicit acceptance of the scope
contract below._

## Scope contract (ACCEPTED — user replied "accept", chat, 2026-10-06;
no owning issue exists in this repo, so this record is the acceptance evidence)

- **Artifact boundary.** In scope: (a) new `mobile_flutter/` Flutter rider
  app at full parity (auth incl. support screen, dashboard, assignments +
  detail/actions, profile, foreground location reporting, OneSignal push,
  en/rw i18n defaulting to rw, secure token storage), styled to the `DESIGN.md`
  system; (b) CI pipeline producing internal test builds per merge and store
  releases per tag; (c) flag-day cutover incl. deletion of `mobile/` and
  EAS retirement; (d) docs updates (`mobile-flutter-rebuild.md` to Final,
  `mobile-layout.md` rewritten for Flutter, `docs/README.md` index, and the
  `DESIGN.md` "mobile out of scope" note revisited). Out of scope:
  `server/` and `client/` code changes, new rider features (French locale,
  native map SDK, background location), Expo app feature work, a separate
  repo, and any staged later phases (each returns for its own interview).
- **Done means.** (1) CI internal build installs on Android + iOS; a rider
  can log in, view dashboard/assignments, accept/reject, see location post,
  receive a push, and switch en/rw. (2) Store artifacts (AAB + IPA) build
  from a tag via CI. (3) Flag-day cutover executed; `mobile/` deleted;
  record marked Final. Nothing outside this checklist is a completion
  dependency.
