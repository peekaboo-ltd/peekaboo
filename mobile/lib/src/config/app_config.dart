import 'package:flutter/foundation.dart';

/// Build-time configuration. Values come from `--dart-define`; the API
/// defaults to the hosted server so every build works out of the box.
/// Mirrors the semantics of the Expo app's `EXPO_PUBLIC_*` variables (see
/// mobile/utils/constants.ts).
class AppConfig {
  static const String hostedApiBaseUrl = 'https://server.peekaboo.co.rw/api/v1';

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: hostedApiBaseUrl,
  );

  static const String oneSignalAppId = String.fromEnvironment(
    'ONESIGNAL_APP_ID',
    defaultValue: '',
  );

  static const int locationUpdateIntervalMinutes = int.fromEnvironment(
    'LOCATION_UPDATE_INTERVAL_MINUTES',
    defaultValue: 5,
  );

  /// Effective API base URL: an explicit `API_BASE_URL` wins (for example a
  /// local server), otherwise the hosted API. An empty override also falls
  /// back to the hosted API rather than failing at runtime.
  static String get effectiveApiBaseUrl =>
      apiBaseUrl.isNotEmpty ? apiBaseUrl : hostedApiBaseUrl;

  /// Mirrors the Expo fallback: invalid/non-positive values become 1 minute.
  static Duration get locationUpdateInterval {
    final minutes = locationUpdateIntervalMinutes;
    if (minutes <= 0) return const Duration(minutes: 1);
    return Duration(minutes: minutes);
  }

  static void warnOnLocalhost() {
    if (kDebugMode && effectiveApiBaseUrl.contains('localhost')) {
      debugPrint(
        'API_BASE_URL uses localhost. On a physical device, use your computer '
        'LAN IP (for example http://192.168.x.x:8080/api/v1).',
      );
    }
  }
}

/// Secure-storage keys. Keep the exact key names so a reinstall over the Expo
/// app (same device, same keychain/keystore) can still read shared entries.
class StorageKeys {
  static const authToken = 'auth_token';
  static const refreshToken = 'refresh_token';
  static const userData = 'user_data';
  static const language = 'language';
}

class ApiConstants {
  static const timeout = Duration(seconds: 30);
  static const assignmentsPageSize = 20;
}
