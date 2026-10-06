import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../screens/assignment_detail_screen.dart';
import '../screens/assignments_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/gallery_screen.dart';
import '../screens/login_screen.dart';
import '../screens/not_found_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/support_screen.dart';
import '../screens/tabs_shell.dart';
import '../state/auth_state.dart';

final _rootKey = GlobalKey<NavigatorState>();

/// Routes mirror the Expo Router structure: (auth)/login + support, tabs
/// dashboard/assignments/profile, assignment/:id, and a not-found page.
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/dashboard',
    refreshListenable: ref.watch(routerRefreshProvider),
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      if (!auth.isBootstrapped) return null;
      final location = state.matchedLocation;
      final onAuth = location == '/login' || location == '/support';
      if (!auth.isAuthenticated && !onAuth) return '/login';
      if (auth.isAuthenticated && location == '/login') return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/support',
        builder: (context, state) => const SupportScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => TabsShell(shell: shell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/assignments',
                builder: (context, state) => AssignmentsScreen(
                  initialFilterParam: state.uri.queryParameters['filter'],
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/assignment/:id',
        parentNavigatorKey: _rootKey,
        builder: (context, state) =>
            AssignmentDetailScreen(id: state.pathParameters['id'] ?? ''),
      ),
      // Dev-only theme gallery: registered in debug builds only, so
      // release builds 404 on /gallery. Not linked from any UI.
      if (kDebugMode)
        GoRoute(
          path: '/gallery',
          parentNavigatorKey: _rootKey,
          builder: (context, state) => const GalleryScreen(),
        ),
    ],
    errorBuilder: (context, state) => const NotFoundScreen(),
  );
});
