import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/auth_api.dart';
import '../i18n/localizations.dart';
import '../models/user.dart';
import '../services/push_notifications.dart';
import '../storage/secure_storage.dart';
import '../utils/app_error.dart';

/// Bumped whenever authentication transitions (login/logout/401/bootstrap)
/// so the router re-evaluates its redirect.
class RouterRefresh extends ChangeNotifier {
  void ping() => notifyListeners();
}

final routerRefreshProvider = Provider<RouterRefresh>((_) => RouterRefresh());

class AuthState {
  final User? user;
  final String? token;
  final bool isAuthenticated;
  final bool isLoading;
  final bool isBootstrapped;
  final String? error;

  const AuthState({
    this.user,
    this.token,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.isBootstrapped = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    String? token,
    bool? isAuthenticated,
    bool? isLoading,
    bool? isBootstrapped,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isBootstrapped: isBootstrapped ?? this.isBootstrapped,
      error: error,
    );
  }
}

/// Auth state machine ported from mobile/store/authStore.ts.
class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  SecureStorage get _storage => ref.read(secureStorageProvider);
  PushService get _push => ref.read(pushServiceProvider);

  void _pingRouter() => ref.read(routerRefreshProvider).ping();

  /// Called once at startup: registers the 401 handler, then verifies any
  /// stored session against the server.
  Future<bool> bootstrap() async {
    ref.read(apiUnauthorizedHandlerProvider).handler = handleUnauthorized;
    final ok = await checkAuth();
    state = state.copyWith(isBootstrapped: true);
    _pingRouter();
    return ok;
  }

  Future<bool> login(LoginCredentials credentials) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await ref.read(authApiProvider).login(credentials);
      await _storage.saveToken(response.token);
      await _storage.saveUserData(response.user);
      state = state.copyWith(
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      );
      _pingRouter();
      // Push registration must never fail the login.
      try {
        await _push.requestPermission();
      } catch (_) {}
      try {
        await _push.login(response.user.id);
      } catch (_) {}
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        error: getErrorMessage(handleApiError(e), ref.read(tProvider)),
      );
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      _push.logout();
    } catch (_) {}
    try {
      await ref.read(authApiProvider).logout();
    } catch (_) {
      // Server logout is best-effort (token may already be expired).
    }
    await _storage.clearAllData();
    state = const AuthState(isBootstrapped: true);
    _pingRouter();
  }

  Future<bool> checkAuth() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _storage.getToken();
      final cached = await _storage.getUserData();
      if (token == null || token.isEmpty) {
        state = const AuthState(isBootstrapped: true);
        return false;
      }
      if (cached != null) {
        state = state.copyWith(
          user: cached,
          token: token,
          isAuthenticated: true,
        );
      }
      try {
        final user = await ref.read(authApiProvider).getProfile();
        await _storage.saveUserData(user);
        state = state.copyWith(
          user: user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
        );
        try {
          await _push.requestPermission();
        } catch (_) {}
        try {
          await _push.login(user.id);
        } catch (_) {}
        return true;
      } catch (e) {
        // Only a 401 invalidates the session. On network/transient errors
        // (e.g. offline start) keep the cached user instead of logging out.
        if (handleApiError(e).code == 401) {
          await _storage.clearAllData();
          state = const AuthState(isBootstrapped: true);
          return false;
        }
        state = state.copyWith(isLoading: false);
        return state.isAuthenticated;
      }
    } catch (_) {
      state = const AuthState(isBootstrapped: true);
      return false;
    }
  }

  /// 401 from any API call: clear the session and send the rider to login
  /// (mirrors the axios response interceptor + router.replace in client.ts).
  Future<void> handleUnauthorized() async {
    if (!state.isAuthenticated && state.user == null) return;
    try {
      await _push.logout();
    } catch (_) {
      // Push logout must never block the session clear.
    }
    await _storage.clearAllData();
    state = const AuthState(isBootstrapped: true);
    _pingRouter();
  }

  void setUser(User user) {
    state = state.copyWith(user: user);
    _storage.saveUserData(user).catchError((_) => null);
  }

  void clearError() => state = state.copyWith();
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
