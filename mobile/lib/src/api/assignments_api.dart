import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../models/assignment.dart';
import 'api_client.dart';

/// Assignment endpoints ported from mobile/services/api/assignments.ts.
class AssignmentsApi {
  final ApiClient _client;

  AssignmentsApi(this._client);

  /// Server uses 0-based pages and `size`; the client stays 1-based.
  Future<Paginated<Assignment>> getAll({int page = 1, int? size}) async {
    final params = <String, dynamic>{'page': page - 1 < 0 ? 0 : page - 1};
    if (size != null) params['size'] = size;
    final response = await _client.dio.get(
      '/order-assignments',
      queryParameters: params,
    );
    final data = envelopeData<Map<String, dynamic>>(response);
    final rows = (data['rows'] as List?)
            ?.whereType<Map<String, dynamic>>()
            .map(Assignment.fromJson)
            .toList() ??
        [];
    return Paginated(
      data: rows,
      total: (data['totalCount'] as num?)?.toInt() ?? rows.length,
      page: (data['currentPage'] as num?)?.toInt() ?? page,
      size: size ?? ApiConstants.assignmentsPageSize,
      totalPages: (data['totalPages'] as num?)?.toInt() ?? 1,
    );
  }

  Future<Assignment> getById(String id) async {
    final response = await _client.dio.get('/order-assignments/$id');
    return Assignment.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<Assignment> accept(String id) async {
    final response = await _client.dio.patch('/order-assignments/$id/accept');
    return Assignment.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<Assignment> reject(String id, {String? reason}) async {
    final response = await _client.dio.patch(
      '/order-assignments/$id/reject',
      data: reason == null ? {} : {'reason': reason},
    );
    return Assignment.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<Assignment> recover(String id) async {
    final response = await _client.dio.patch('/order-assignments/$id/recover');
    return Assignment.fromJson(envelopeData<Map<String, dynamic>>(response));
  }

  Future<void> confirmOrderDispatch(String orderId, {String? trackingId}) {
    return _client.dio.post(
      '/order-activities/$orderId/confirm-dispatch',
      data: trackingId == null ? {} : {'trackingId': trackingId},
    );
  }

  Future<void> completeOrder(String orderId, String trackingId) {
    return _client.dio.post(
      '/order-activities/$orderId/complete',
      data: {'trackingId': trackingId.trim()},
    );
  }
}

final assignmentsApiProvider = Provider<AssignmentsApi>(
  (ref) => AssignmentsApi(ref.watch(apiClientProvider)),
);
