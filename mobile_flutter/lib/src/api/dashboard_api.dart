import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/dashboard.dart';
import 'api_client.dart';

/// Dashboard endpoints ported from mobile/services/api/dashboard.ts.

class ProblemReportPayload {
  final String description;
  final String? submissionType; // 'PROBLEM' | 'RECEIPT'
  final String capturedAt;
  final String mediaType; // 'image' | 'video'
  final String evidencePath;
  final String? locationLabel;
  final String? overlayTimestamp;
  final String? overlayLocationLabel;
  final bool? overlayAppliedOnClient;

  const ProblemReportPayload({
    required this.description,
    this.submissionType,
    required this.capturedAt,
    required this.mediaType,
    required this.evidencePath,
    this.locationLabel,
    this.overlayTimestamp,
    this.overlayLocationLabel,
    this.overlayAppliedOnClient,
  });
}

ActivityType _activityTypeFrom(String kind, String status) {
  final s = status.toUpperCase();
  if (kind == 'assignment') {
    if (s.contains('REJECT')) return ActivityType.assignmentRejected;
    if (s.contains('COMPLETE')) return ActivityType.assignmentCompleted;
    if (s.contains('ACTIVE') || s.contains('ACCEPT')) {
      return ActivityType.assignmentAccepted;
    }
    return ActivityType.assignmentAccepted;
  }
  return ActivityType.orderDelivered;
}

List<RecentActivity> mapRecentActivity(List<dynamic>? items) {
  if (items == null || items.isEmpty) return [];
  return items.whereType<Map<String, dynamic>>().map((a) {
    final rawTimestamp = a['timestamp']?.toString() ?? '';
    final parsed = DateTime.tryParse(rawTimestamp);
    final kind = a['type']?.toString() ?? '';
    final id = a['id']?.toString() ?? '';
    // Rider rows carry the assignment id as `id` with no separate
    // assignmentId/orderId fields (dashboard.service.ts), so the row id
    // doubles as the deep-link target by row kind.
    return RecentActivity(
      id: id,
      type: _activityTypeFrom(kind, a['status']?.toString() ?? ''),
      description: (a['description'] ?? a['title'] ?? 'Activity').toString(),
      timestamp: parsed?.toIso8601String() ?? DateTime.now().toIso8601String(),
      assignmentId:
          a['assignmentId']?.toString() ??
          (kind == 'assignment' && id.isNotEmpty ? id : null),
      orderId:
          a['orderId']?.toString() ??
          (kind == 'order' && id.isNotEmpty ? id : null),
    );
  }).toList();
}

DashboardData buildRiderDashboardData(Map<String, dynamic> rider) {
  double numOf(String key) => (rider[key] as num?)?.toDouble() ?? 0;
  final pending = numOf('pendingAssignments');
  final active = numOf('activeAssignments');
  final completedTotal = numOf('completedDeliveries');
  final completedToday = (rider['completedToday'] as num?)?.toDouble() ?? 0;
  final totalAssignments = rider['totalAssignments'] != null
      ? numOf('totalAssignments')
      : pending + active + completedTotal;
  final todayDeliveries = rider['todayDeliveries'] != null
      ? numOf('todayDeliveries')
      : completedToday;

  return DashboardData(
    stats: DashboardStats(
      todayDeliveries: todayDeliveries,
      pendingAssignments: pending,
      completedToday: completedToday,
      totalEarnings: numOf('totalEarnings'),
      completionRate: numOf('completionRate'),
      totalAssignments: totalAssignments,
      bonusActive: rider['bonusActive'] == true,
    ),
    recentActivity: mapRecentActivity(
      rider['recentActivity'] as List<dynamic>?,
    ),
  );
}

class DashboardApi {
  final ApiClient _client;

  DashboardApi(this._client);

  Future<DashboardData> getDashboardData({DateTime? date}) async {
    final day = date ?? DateTime.now();
    final start = DateTime(day.year, day.month, day.day);
    final end = DateTime(day.year, day.month, day.day, 23, 59, 59, 999);
    final dayStr =
        '${start.year.toString().padLeft(4, '0')}-'
        '${start.month.toString().padLeft(2, '0')}-'
        '${start.day.toString().padLeft(2, '0')}';
    final response = await _client.dio.get(
      '/dashboard',
      queryParameters: {
        'day': dayStr,
        'startDate': start.toIso8601String(),
        'endDate': end.toIso8601String(),
        'period': 'today',
      },
    );
    final payload = envelopeData<Map<String, dynamic>>(response);
    if (payload['role'] == 'RIDER' && payload['metrics'] is Map) {
      return buildRiderDashboardData(
        Map<String, dynamic>.from(payload['metrics'] as Map),
      );
    }
    // Fallback for other roles: keep the UI working with safe defaults.
    return DashboardData(stats: DashboardStats.empty(), recentActivity: []);
  }

  Future<void> submitProblemReport(ProblemReportPayload payload) async {
    final isVideo = payload.mediaType == 'video';
    final formData = FormData.fromMap({
      'description': payload.description,
      if (payload.submissionType != null)
        'submissionType': payload.submissionType!,
      'capturedAt': payload.capturedAt,
      'mediaType': payload.mediaType,
      if (payload.locationLabel != null)
        'locationLabel': payload.locationLabel!,
      if (payload.overlayTimestamp != null)
        'overlayTimestamp': payload.overlayTimestamp!,
      if (payload.overlayLocationLabel != null)
        'overlayLocationLabel': payload.overlayLocationLabel!,
      if (payload.overlayAppliedOnClient != null)
        'overlayAppliedOnClient': payload.overlayAppliedOnClient.toString(),
      'evidence': await MultipartFile.fromFile(
        payload.evidencePath,
        filename:
            'problem-report-${DateTime.now().millisecondsSinceEpoch}${isVideo ? '.mp4' : '.jpg'}',
      ),
    });
    await _client.dio.post('/dashboard/report-problem', data: formData);
  }
}

final dashboardApiProvider = Provider<DashboardApi>(
  (ref) => DashboardApi(ref.watch(apiClientProvider)),
);
