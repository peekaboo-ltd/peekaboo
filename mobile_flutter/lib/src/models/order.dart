import 'user.dart';

/// Domain models ported from mobile/types/order.ts.

enum OrderType { send, receive }

OrderType orderTypeFromJson(String? value) =>
    value == 'RECEIVE' ? OrderType.receive : OrderType.send;

enum OrderStatus {
  draft,
  created,
  pending,
  paid,
  confirmed,
  accepted,
  active,
  inTransit,
  delivered,
  completed,
  cancelled,
}

OrderStatus? orderStatusFromJson(String? value) {
  switch (value) {
    case 'DRAFT':
      return OrderStatus.draft;
    case 'CREATED':
      return OrderStatus.created;
    case 'PENDING':
      return OrderStatus.pending;
    case 'PAID':
      return OrderStatus.paid;
    case 'CONFIRMED':
      return OrderStatus.confirmed;
    case 'ACCEPTED':
      return OrderStatus.accepted;
    case 'ACTIVE':
      return OrderStatus.active;
    case 'IN_TRANSIT':
      return OrderStatus.inTransit;
    case 'DELIVERED':
      return OrderStatus.delivered;
    case 'COMPLETED':
      return OrderStatus.completed;
    case 'CANCELLED':
      return OrderStatus.cancelled;
    default:
      return null;
  }
}

/// English labels ported from mobile/constants/order.constants.ts (not
/// translated in the Expo app either).
const orderStatusLabels = <OrderStatus, String>{
  OrderStatus.draft: 'Draft',
  OrderStatus.created: 'Created',
  OrderStatus.pending: 'Pending payment',
  OrderStatus.paid: 'Paid',
  OrderStatus.confirmed: 'Confirmed',
  OrderStatus.accepted: 'Accepted',
  OrderStatus.active: 'Active',
  OrderStatus.inTransit: 'In Transit',
  OrderStatus.delivered: 'Delivered',
  OrderStatus.completed: 'Completed',
  OrderStatus.cancelled: 'Cancelled',
};

String orderStatusToJson(OrderStatus status) {
  switch (status) {
    case OrderStatus.draft:
      return 'DRAFT';
    case OrderStatus.created:
      return 'CREATED';
    case OrderStatus.pending:
      return 'PENDING';
    case OrderStatus.paid:
      return 'PAID';
    case OrderStatus.confirmed:
      return 'CONFIRMED';
    case OrderStatus.accepted:
      return 'ACCEPTED';
    case OrderStatus.active:
      return 'ACTIVE';
    case OrderStatus.inTransit:
      return 'IN_TRANSIT';
    case OrderStatus.delivered:
      return 'DELIVERED';
    case OrderStatus.completed:
      return 'COMPLETED';
    case OrderStatus.cancelled:
      return 'CANCELLED';
  }
}

String orderStatusLabel(OrderStatus? status) {
  if (status == null) return '—';
  return orderStatusLabels[status] ?? status.name;
}

/// Sort rank for the assignments queue (mobile/app/(tabs)/assignments.tsx).
int orderStatusSortRank(OrderStatus? status) {
  switch (status) {
    case OrderStatus.inTransit:
    case OrderStatus.delivered:
      return 0;
    case OrderStatus.paid:
    case OrderStatus.confirmed:
    case OrderStatus.accepted:
    case OrderStatus.active:
      return 1;
    case OrderStatus.completed:
      return 2;
    default:
      return status == null ? 99 : 3;
  }
}

class OrderActivity {
  final String id;
  final OrderStatus? status;
  final String createdAt;
  final String updatedAt;

  const OrderActivity({
    required this.id,
    this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderActivity.fromJson(Map<String, dynamic> json) => OrderActivity(
        id: json['id'] as String? ?? '',
        status: orderStatusFromJson(json['status'] as String?),
        createdAt: json['createdAt'] as String? ?? '',
        updatedAt: json['updatedAt'] as String? ?? '',
      );
}

class OrderLocation {
  final double latitude;
  final double longitude;

  const OrderLocation({required this.latitude, required this.longitude});

  factory OrderLocation.fromJson(Map<String, dynamic> json) => OrderLocation(
        latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
        longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      );
}

class Order {
  final String id;
  final String referenceId;
  final String? trackingId;
  final String? recipientId;
  final String? senderId;
  final String createdById;
  final OrderStatus? status;
  final double? initialFee;
  final OrderType type;
  final double discount;
  final double? finalFee;
  final String? conversationId;
  final OrderLocation? locationFrom;
  final OrderLocation? locationTo;
  final String? senderName;
  final String? senderPhoneNumber;
  final String? recipientName;
  final String? recipientPhoneNumber;
  final User? recipient;
  final User? sender;
  final User? createdBy;
  final List<OrderActivity>? activities;
  final String createdAt;
  final String updatedAt;

  const Order({
    required this.id,
    required this.referenceId,
    this.trackingId,
    this.recipientId,
    this.senderId,
    required this.createdById,
    this.status,
    this.initialFee,
    required this.type,
    required this.discount,
    this.finalFee,
    this.conversationId,
    this.locationFrom,
    this.locationTo,
    this.senderName,
    this.senderPhoneNumber,
    this.recipientName,
    this.recipientPhoneNumber,
    this.recipient,
    this.sender,
    this.createdBy,
    this.activities,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    User? userFromKey(String key) {
      final v = json[key];
      return v is Map<String, dynamic> ? User.fromJson(v) : null;
    }

    return Order(
      id: json['id'] as String? ?? '',
      referenceId: json['referenceId'] as String? ?? '',
      trackingId: json['trackingId'] as String?,
      recipientId: json['recipientId'] as String?,
      senderId: json['senderId'] as String?,
      createdById: json['createdById'] as String? ?? '',
      status: orderStatusFromJson(json['status'] as String?),
      initialFee: (json['initialFee'] as num?)?.toDouble(),
      type: orderTypeFromJson(json['type'] as String?),
      discount: (json['discount'] as num?)?.toDouble() ?? 0,
      finalFee: (json['finalFee'] as num?)?.toDouble(),
      conversationId: json['conversationId'] as String?,
      locationFrom: json['locationFrom'] is Map<String, dynamic>
          ? OrderLocation.fromJson(
              json['locationFrom'] as Map<String, dynamic>)
          : null,
      locationTo: json['locationTo'] is Map<String, dynamic>
          ? OrderLocation.fromJson(json['locationTo'] as Map<String, dynamic>)
          : null,
      senderName: json['senderName'] as String?,
      senderPhoneNumber: json['senderPhoneNumber'] as String?,
      recipientName: json['recipientName'] as String?,
      recipientPhoneNumber: json['recipientPhoneNumber'] as String?,
      recipient: userFromKey('recipient'),
      sender: userFromKey('sender'),
      createdBy: userFromKey('createdBy'),
      activities: (json['activities'] as List?)
          ?.whereType<Map<String, dynamic>>()
          .map(OrderActivity.fromJson)
          .toList(),
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  Order copyWith({OrderStatus? status}) => Order(
        id: id,
        referenceId: referenceId,
        trackingId: trackingId,
        recipientId: recipientId,
        senderId: senderId,
        createdById: createdById,
        status: status ?? this.status,
        initialFee: initialFee,
        type: type,
        discount: discount,
        finalFee: finalFee,
        conversationId: conversationId,
        locationFrom: locationFrom,
        locationTo: locationTo,
        senderName: senderName,
        senderPhoneNumber: senderPhoneNumber,
        recipientName: recipientName,
        recipientPhoneNumber: recipientPhoneNumber,
        recipient: recipient,
        sender: sender,
        createdBy: createdBy,
        activities: activities,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

  /// Latest order status derived from activities (shared helper used by the
  /// assignments queue, cards, and detail screen alike).
  OrderStatus? get latestStatus {
    final list = activities;
    if (list == null || list.isEmpty) return status;
    final sorted = List<OrderActivity>.of(list)
      ..sort((a, b) => DateTime.tryParse(b.createdAt)
              ?.compareTo(DateTime.tryParse(a.createdAt) ??
                  DateTime.fromMillisecondsSinceEpoch(0)) ??
          0);
    return sorted.first.status ?? status;
  }
}
