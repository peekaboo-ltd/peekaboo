import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

import '../config/app_config.dart';

/// Push-notification data carried in OneSignal `additionalData`.
class PushData {
  final String? type;
  final String? assignmentId;
  final String? orderId;

  const PushData({this.type, this.assignmentId, this.orderId});

  factory PushData.fromAdditionalData(Map<String, dynamic>? data) {
    if (data == null) return const PushData();
    return PushData(
      type: data['type']?.toString(),
      assignmentId: data['assignmentId']?.toString(),
      orderId: data['orderId']?.toString(),
    );
  }
}

/// OneSignal wrapper ported from mobile/services/notifications/pushNotifications.ts.
class PushService {
  bool _initialized = false;
  void Function(PushData data)? onNotificationOpened;
  void Function(PushData data)? onNotificationForeground;

  bool get isInitialized => _initialized;

  void initialize() {
    if (_initialized) return;
    final appId = AppConfig.oneSignalAppId;
    if (appId.isEmpty) {
      debugPrint(
        '[peekaboo/push] OneSignal App ID missing: set ONESIGNAL_APP_ID via --dart-define',
      );
      return;
    }
    OneSignal.initialize(appId);
    _initialized = true;

    OneSignal.Notifications.addClickListener((event) {
      onNotificationOpened?.call(
        PushData.fromAdditionalData(event.notification.additionalData),
      );
    });
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      event.notification.display();
      onNotificationForeground?.call(
        PushData.fromAdditionalData(event.notification.additionalData),
      );
    });

    if (kDebugMode) {
      debugPrint('[peekaboo/push] OneSignal initialized with app ID: $appId');
    }
  }

  Future<bool> requestPermission() async {
    if (!_initialized) initialize();
    if (!_initialized) return false;
    try {
      final granted =
          await OneSignal.Notifications.requestPermission(true);
      if (!granted) {
        debugPrint('[peekaboo/push] Notification permission not granted');
      }
      return granted;
    } catch (e) {
      debugPrint('[peekaboo/push] Error requesting permission: $e');
      return false;
    }
  }

  Future<void> login(String userId) async {
    if (!_initialized) initialize();
    if (!_initialized) return;
    await OneSignal.login(userId);
    if (kDebugMode) {
      debugPrint('[peekaboo/push] OneSignal login called for user: $userId');
    }
  }

  Future<void> logout() async {
    if (!_initialized) return;
    await OneSignal.logout();
    if (kDebugMode) {
      debugPrint('[peekaboo/push] OneSignal logout called');
    }
  }
}

final pushServiceProvider = Provider<PushService>((_) => PushService());
