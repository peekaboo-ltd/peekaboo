import 'order.dart';
import 'user.dart';

/// Domain models ported from mobile/types/assignment.ts.

enum AssignmentStatus { active, completed, cancelled, pending, rejected }

AssignmentStatus assignmentStatusFromJson(String? value) {
  switch (value) {
    case 'ACTIVE':
      return AssignmentStatus.active;
    case 'COMPLETED':
      return AssignmentStatus.completed;
    case 'CANCELLED':
      return AssignmentStatus.cancelled;
    case 'REJECTED':
      return AssignmentStatus.rejected;
    case 'PENDING':
    default:
      return AssignmentStatus.pending;
  }
}

String assignmentStatusToJson(AssignmentStatus status) {
  switch (status) {
    case AssignmentStatus.active:
      return 'ACTIVE';
    case AssignmentStatus.completed:
      return 'COMPLETED';
    case AssignmentStatus.cancelled:
      return 'CANCELLED';
    case AssignmentStatus.rejected:
      return 'REJECTED';
    case AssignmentStatus.pending:
      return 'PENDING';
  }
}

class Assignment {
  final String id;
  final String orderId;
  final String? assignedToId;
  final String? createdById;
  final AssignmentStatus status;
  final String? description;
  final Order? order;
  final User? assignedTo;
  final User? createdBy;
  final String createdAt;
  final String updatedAt;

  const Assignment({
    required this.id,
    required this.orderId,
    this.assignedToId,
    this.createdById,
    required this.status,
    this.description,
    this.order,
    this.assignedTo,
    this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
    User? userFromKey(String key) {
      final v = json[key];
      return v is Map<String, dynamic> ? User.fromJson(v) : null;
    }

    return Assignment(
      id: json['id'] as String? ?? '',
      orderId: json['orderId'] as String? ?? '',
      assignedToId: json['assignedToId'] as String?,
      createdById: json['createdById'] as String?,
      status: assignmentStatusFromJson(json['status'] as String?),
      description: json['description'] as String?,
      order: json['order'] is Map<String, dynamic>
          ? Order.fromJson(json['order'] as Map<String, dynamic>)
          : null,
      assignedTo: userFromKey('assignedTo'),
      createdBy: userFromKey('createdBy'),
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  Assignment copyWith({AssignmentStatus? status, Order? order}) => Assignment(
        id: id,
        orderId: orderId,
        assignedToId: assignedToId,
        createdById: createdById,
        status: status ?? this.status,
        description: description,
        order: order ?? this.order,
        assignedTo: assignedTo,
        createdBy: createdBy,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

  /// Merge a server-returned update over this assignment (the store spreads
  /// the response over the cached row, so empty fields never clobber).
  Assignment merge(Assignment update) => Assignment(
        id: update.id.isEmpty ? id : update.id,
        orderId: update.orderId.isEmpty ? orderId : update.orderId,
        assignedToId: update.assignedToId ?? assignedToId,
        createdById: update.createdById ?? createdById,
        status: update.status,
        description: update.description ?? description,
        order: update.order ?? order,
        assignedTo: update.assignedTo ?? assignedTo,
        createdBy: update.createdBy ?? createdBy,
        createdAt: update.createdAt.isEmpty ? createdAt : update.createdAt,
        updatedAt: update.updatedAt.isEmpty ? updatedAt : update.updatedAt,
      );
}

class Paginated<T> {
  final List<T> data;
  final int total;
  final int page;
  final int size;
  final int totalPages;

  const Paginated({
    required this.data,
    required this.total,
    required this.page,
    required this.size,
    required this.totalPages,
  });
}
