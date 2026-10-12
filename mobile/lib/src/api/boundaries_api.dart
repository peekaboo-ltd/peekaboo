import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Rwanda administrative-boundary reverse lookup used by the assignment
/// detail screen (mobile/components/assignments/AssignmentDetails.tsx).
/// A bare HTTP client: this host is outside the Peekaboo API and must not
/// receive the auth interceptor.
class BoundariesApi {
  final Dio _dio;

  BoundariesApi([Dio? dio]) : _dio = dio ?? Dio();

  /// Returns "village, cell, sector, district" or null when unavailable.
  Future<String?> administrativeLabel({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final response = await _dio.post(
        'https://menya.fly.dev/api/boundaries',
        data: {'lat': latitude, 'lng': longitude},
        options: Options(
          headers: const {'Content-Type': 'application/json'},
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ),
      );
      if (response.statusCode != 200 || response.data is! Map) return null;
      final data = response.data as Map;
      final parts = [
        data['village'],
        data['cell'],
        data['sector'],
        data['district'],
      ]
          .whereType<String>()
          .map((p) => p.trim())
          .where((p) => p.isNotEmpty)
          .toList();
      if (parts.isEmpty) return null;
      return parts.join(', ');
    } catch (_) {
      return null; // Callers fall back to coordinates.
    }
  }
}

final boundariesApiProvider =
    Provider<BoundariesApi>((_) => BoundariesApi());
