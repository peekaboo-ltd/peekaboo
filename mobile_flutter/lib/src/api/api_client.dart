import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../storage/secure_storage.dart';

/// dio client mirroring mobile/services/api/client.ts: Bearer token
/// injection, multipart content-type handling, and 401 delegation to the
/// registered [UnauthorizedHandler] (wired by the auth state).
class ApiClient {
  final Dio dio;

  ApiClient({
    required SecureStorage storage,
    UnauthorizedHandler? unauthorizedHandler,
    Dio? dio,
  }) : dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: AppConfig.effectiveApiBaseUrl,
                connectTimeout: ApiConstants.timeout,
                receiveTimeout: ApiConstants.timeout,
                sendTimeout: ApiConstants.timeout,
                headers: const {'Content-Type': 'application/json'},
              ),
            ) {
    this.dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) async {
              final token = await storage.getToken();
              if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
              }
              // Let dio set multipart boundaries automatically.
              if (options.data is FormData) {
                options.headers.remove('Content-Type');
              }
              handler.next(options);
            },
            onError: (error, handler) async {
              if (error.response?.statusCode == 401) {
                await unauthorizedHandler?.handler?.call();
              }
              handler.next(error);
            },
          ),
        );
  }
}

/// Reads a `{message, data}` envelope the way the Expo services do.
T envelopeData<T>(Response response) {
  final body = response.data;
  if (body is Map<String, dynamic> && body['data'] != null) {
    return body['data'] as T;
  }
  return body as T;
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    storage: ref.watch(secureStorageProvider),
    unauthorizedHandler: ref.watch(apiUnauthorizedHandlerProvider),
  );
});

/// Mutable holder so auth state can register the 401 callback without a
/// provider dependency cycle.
class UnauthorizedHandler {
  Future<void> Function()? handler;
}

final apiUnauthorizedHandlerProvider =
    Provider<UnauthorizedHandler>((_) => UnauthorizedHandler());
