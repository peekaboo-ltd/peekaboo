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
  /// Tap that arrived before auth restore finished (cold start). Drained
  /// once bootstrap completes so the deep link is not lost.
  PushData? _pendingTap;

  void _handleOpened(PushData data) {
    if (!ref.read(authProvider).isBootstrapped) {
      _pendingTap = data;
      return;
    }
    if (!ref.read(authProvider).isAuthenticated) return;
    if (data.assignmentId != null && data.assignmentId!.isNotEmpty) {
      ref.read(routerProvider).push('/assignment/${data.assignmentId}');
    } else if (data.type == 'assignment') {
      ref.read(routerProvider).go('/assignments');
    }
    if (data.type == 'assignment') {
      ref.read(assignmentsProvider.notifier).refresh().ignore();
    }
  }

  @override
  void initState() {
    super.initState();
    final push = ref.read(pushServiceProvider);
    push.initialize();
    push.onNotificationOpened = _handleOpened;
    push.onNotificationForeground = (data) {
      if (data.type == 'assignment' && ref.read(authProvider).isAuthenticated) {
        ref.read(assignmentsProvider.notifier).refresh().ignore();
      }
    };
    // Location tracking self-manages against the auth session.
    ref.read(locationTrackingProvider);
    Future.microtask(() async {
      await ref.read(authProvider.notifier).bootstrap();
      if (!mounted) return;
      final pending = _pendingTap;
      _pendingTap = null;
      if (pending != null) _handleOpened(pending);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final bootstrapped = ref.watch(authProvider).isBootstrapped;

    if (!bootstrapped) {
      final platform =
          WidgetsBinding.instance.platformDispatcher.platformBrightness;
      final t = platform == Brightness.dark
          ? PkTokens.dark()
          : PkTokens.light();
      return MaterialApp(
        home: Scaffold(
          backgroundColor: t.paper,
          body: Center(child: CircularProgressIndicator(color: t.ink)),
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
