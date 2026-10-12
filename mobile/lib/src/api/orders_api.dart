import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/order.dart';
import 'api_client.dart';

/// Order endpoints ported from mobile/services/api/orders.ts.
class OrdersApi {
  final ApiClient _client;

  OrdersApi(this._client);

  Future<Order> getById(String id) async {
    final response = await _client.dio.get('/orders/$id');
    // Note: unlike most endpoints, this one is NOT envelope-wrapped.
    return Order.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Order> updateStatus(String id, OrderStatus? status) async {
    final response = await _client.dio.patch(
      '/orders/$id',
      data: {if (status != null) 'status': orderStatusToJson(status)},
    );
    return Order.fromJson(response.data as Map<String, dynamic>);
  }
}

final ordersApiProvider = Provider<OrdersApi>(
  (ref) => OrdersApi(ref.watch(apiClientProvider)),
);
