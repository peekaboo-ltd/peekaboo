import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/api/dashboard_api.dart';
import 'package:mobile_flutter/src/models/assignment.dart';
import 'package:mobile_flutter/src/models/dashboard.dart';
import 'package:mobile_flutter/src/state/assignments_state.dart';

Assignment _assignment({
  required String id,
  required String orderId,
  required String updatedAt,
}) {
  return Assignment(
    id: id,
    orderId: orderId,
    status: AssignmentStatus.pending,
    createdAt: updatedAt,
    updatedAt: updatedAt,
  );
}

void main() {
  test('normalizeLatestAssignments keeps the newest row per order', () {
    final rows = [
      _assignment(id: 'old', orderId: 'o1', updatedAt: '2026-10-01T00:00:00Z'),
      _assignment(id: 'new', orderId: 'o1', updatedAt: '2026-10-06T00:00:00Z'),
      _assignment(id: 'solo', orderId: 'o2', updatedAt: '2026-10-02T00:00:00Z'),
    ];
    final result = normalizeLatestAssignments(rows);
    expect(result.map((a) => a.id), containsAll(['new', 'solo']));
    expect(result.map((a) => a.id), isNot(contains('old')));
  });

  test('buildRiderDashboardData derives totals with safe defaults', () {
    final data = buildRiderDashboardData({
      'pendingAssignments': 2,
      'activeAssignments': 1,
      'completedDeliveries': 5,
      'completedToday': 3,
      'totalEarnings': 15000,
      'completionRate': 90,
      'bonusActive': true,
      'recentActivity': [
        {
          'id': 'a1',
          'type': 'assignment',
          'title': 'Accepted',
          'description': 'Accepted order',
          'status': 'ACCEPTED',
          'timestamp': '2026-10-06T10:00:00Z',
        },
      ],
    });
    expect(data.stats.pendingAssignments, 2);
    expect(data.stats.todayDeliveries, 3);
    expect(data.stats.totalAssignments, 8);
    expect(data.stats.totalEarnings, 15000);
    expect(data.stats.bonusActive, isTrue);
    expect(data.recentActivity, hasLength(1));
    expect(
      data.recentActivity.first.type,
      ActivityType.assignmentAccepted,
    );
  });

  test('mapRecentActivity classifies rejected and delivered items', () {
    final items = mapRecentActivity([
      {
        'id': 'r1',
        'type': 'assignment',
        'description': 'Rejected',
        'status': 'REJECTED',
        'timestamp': 'not-a-date',
      },
      {
        'id': 'o1',
        'type': 'order',
        'description': 'Delivered',
        'status': 'DELIVERED',
        'timestamp': '2026-10-06T10:00:00Z',
      },
    ]);
    expect(items[0].type, ActivityType.assignmentRejected);
    expect(items[0].timestamp, isNotEmpty); // invalid date falls back to now
    expect(items[0].assignmentId, 'r1'); // row id is the deep-link target
    expect(items[1].type, ActivityType.orderDelivered);
    expect(items[1].orderId, 'o1');
    expect(items[1].assignmentId, isNull);
    expect(mapRecentActivity(null), isEmpty);
  });
}
