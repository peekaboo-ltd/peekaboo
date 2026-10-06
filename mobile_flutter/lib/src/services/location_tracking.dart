import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../api/users_api.dart';
import '../config/app_config.dart';
import '../state/auth_state.dart';

/// Periodic foreground location reporting ported from
/// mobile/hooks/useLocationTracking.ts. Runs while the rider is signed in;
/// failures are silent by design (location must never interrupt app usage).
class LocationTracking {
  final Ref _ref;
  Timer? _timer;
  bool _updating = false;
  bool _started = false;

  LocationTracking(this._ref);

  void start() {
    if (_started) return;
    _started = true;
    unawaited(_collectAndSend());
    _timer = Timer.periodic(
      AppConfig.locationUpdateInterval,
      (_) => unawaited(_collectAndSend()),
    );
  }

  void stop() {
    _started = false;
    _timer?.cancel();
    _timer = null;
  }

  Future<void> _collectAndSend() async {
    if (_updating) return;
    final auth = _ref.read(authProvider);
    if (!auth.isAuthenticated || auth.user == null) return;
    _updating = true;
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return;
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      );
      final currentLocation = await _ref
          .read(usersApiProvider)
          .updateCurrentLocation(
            latitude: position.latitude,
            longitude: position.longitude,
          );
      final user = _ref.read(authProvider).user;
      if (user != null) {
        _ref.read(authProvider.notifier).setUser(
              user.copyWith(currentLocation: currentLocation),
            );
      }
    } catch (_) {
      // No-op: location updates should never interrupt app usage.
    } finally {
      _updating = false;
    }
  }

  void dispose() => stop();
}

final locationTrackingProvider = Provider<LocationTracking>((ref) {
  final tracking = LocationTracking(ref);
  ref.onDispose(tracking.dispose);
  // Start/stop with the session.
  ref.listen(authProvider.select((s) => s.isAuthenticated), (_, authed) {
    if (authed) {
      tracking.start();
    } else {
      tracking.stop();
    }
  });
  if (ref.read(authProvider).isAuthenticated) tracking.start();
  return tracking;
});
