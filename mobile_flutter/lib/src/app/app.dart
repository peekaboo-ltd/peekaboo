import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/location_tracking.dart';
import '../services/push_notifications.dart';
import '../state/assignments_state.dart';
import '../state/auth_state.dart';
import '../theme/peekaboo_theme.dart';
import '../theme/tokens.dart';
import 'router.dart';

/// App bootstrap ported from mobile/app/_layout.tsx: OneSignal init, auth
/// bootstrap, location tracking, and notification listeners that refresh
/// assignments and deep-link into assignment details.
class PeekabooApp extends ConsumerStatefulWidget {
  const PeekabooApp({super.key});

  @override
  ConsumerState<PeekabooApp> createState() => _PeekabooAppState();
}

class _PeekabooAppState extends ConsumerState<PeekabooApp> {
  @override
  void initState() {
    super.initState();
    final push = ref.read(pushServiceProvider);
    push.initialize();
    push.onNotificationOpened = (data) {
      if (!ref.read(authProvider).isAuthenticated) return;
      if (data.assignmentId != null && data.assignmentId!.isNotEmpty) {
        ref.read(routerProvider).push('/assignment/${data.assignmentId}');
      } else if (data.type == 'assignment') {
        ref.read(routerProvider).go('/assignments');
      }
      if (data.type == 'assignment') {
        ref.read(assignmentsProvider.notifier).refresh().ignore();
      }
    };
    push.onNotificationForeground = (data) {
      if (data.type == 'assignment' &&
          ref.read(authProvider).isAuthenticated) {
        ref.read(assignmentsProvider.notifier).refresh().ignore();
      }
    };
    // Location tracking self-manages against the auth session.
    ref.read(locationTrackingProvider);
    Future.microtask(() => ref.read(authProvider.notifier).bootstrap());
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final bootstrapped = ref.watch(authProvider).isBootstrapped;

    if (!bootstrapped) {
      final t = PkTokens.light();
      return MaterialApp(
        home: Scaffold(
          backgroundColor: t.paper,
          body: Center(
            child: CircularProgressIndicator(color: t.ink),
          ),
        ),
      );
    }

    return MaterialApp.router(
      title: 'Peekaboo Rider',
      theme: buildPeekabooTheme(Brightness.light),
      darkTheme: buildPeekabooTheme(Brightness.dark),
      routerConfig: router,
    );
  }
}
