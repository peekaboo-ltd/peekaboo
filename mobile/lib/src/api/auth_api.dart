import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import 'api_client.dart';

/// Auth endpoints ported from mobile/services/api/auth.ts.
class AuthApi {
  final ApiClient _client;

  AuthApi(this._client);

  Future<AuthResponse> login(LoginCredentials credentials) async {
    final response = await _client.dio.post(
      '/auth/login',
      data: credentials.toJson(),
    );
    final data = envelopeData<Map<String, dynamic>>(response);
    return AuthResponse(
      user: User.fromJson(data['user'] as Map<String, dynamic>),
      token: data['token'] as String? ?? '',
    );
  }

  Future<void> logout() => _client.dio.post('/auth/logout');

  Future<User> getProfile() async {
    final response = await _client.dio.get('/auth/me');
    return User.fromJson(envelopeData<Map<String, dynamic>>(response));
  }
}

final authApiProvider = Provider<AuthApi>(
  (ref) => AuthApi(ref.watch(apiClientProvider)),
);
