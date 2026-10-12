// Domain models ported from mobile/types/dashboard.ts.

enum ActivityType {
  assignmentAccepted,
  assignmentCompleted,
  assignmentRejected,
  orderDelivered,
}

class DashboardStats {
  final double todayDeliveries;
  final double pendingAssignments;
  final double completedToday;
  final double totalEarnings;
  final double completionRate;
  final double totalAssignments;
  final bool bonusActive;

  const DashboardStats({
    required this.todayDeliveries,
    required this.pendingAssignments,
    required this.completedToday,
    required this.totalEarnings,
    required this.completionRate,
    required this.totalAssignments,
    this.bonusActive = false,
  });

  factory DashboardStats.empty() => const DashboardStats(
        todayDeliveries: 0,
        pendingAssignments: 0,
        completedToday: 0,
        totalEarnings: 0,
        completionRate: 0,
        totalAssignments: 0,
      );
}

class RecentActivity {
  final String id;
  final ActivityType type;
  final String description;
  final String timestamp;
  final String? orderId;
  final String? assignmentId;

  const RecentActivity({
    required this.id,
    required this.type,
    required this.description,
    required this.timestamp,
    this.orderId,
    this.assignmentId,
  });
}

class DashboardData {
  final DashboardStats stats;
  final List<RecentActivity> recentActivity;

  const DashboardData({required this.stats, required this.recentActivity});
}
