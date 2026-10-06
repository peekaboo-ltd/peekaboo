import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/dashboard_api.dart';
import '../models/dashboard.dart';
import '../utils/app_error.dart';

class DashboardState {
  final DashboardStats? stats;
  final List<RecentActivity> recentActivity;
  final double pendingCount;
  final bool isLoading;
  final bool isRefreshing;
  final String? error;

  const DashboardState({
    this.stats,
    this.recentActivity = const [],
    this.pendingCount = 0,
    this.isLoading = false,
    this.isRefreshing = false,
    this.error,
  });

  DashboardState copyWith({
    DashboardStats? Function()? stats,
    List<RecentActivity>? recentActivity,
    double? pendingCount,
    bool? isLoading,
    bool? isRefreshing,
    String? error,
  }) {
    return DashboardState(
      stats: stats != null ? stats() : this.stats,
      recentActivity: recentActivity ?? this.recentActivity,
      pendingCount: pendingCount ?? this.pendingCount,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      error: error,
    );
  }
}

/// Dashboard state machine ported from mobile/store/dashboardStore.ts.
class DashboardNotifier extends Notifier<DashboardState> {
  @override
  DashboardState build() => const DashboardState();

  Future<void> fetchData() async {
    state = state.copyWith(isLoading: true);
    try {
      final data = await ref.read(dashboardApiProvider).getDashboardData();
      state = state.copyWith(
        stats: () => data.stats,
        recentActivity: data.recentActivity,
        pendingCount: data.stats.pendingAssignments,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
    }
  }

  Future<void> refresh() async {
    state = state.copyWith(isRefreshing: true);
    try {
      final data = await ref.read(dashboardApiProvider).getDashboardData();
      state = state.copyWith(
        stats: () => data.stats,
        recentActivity: data.recentActivity,
        pendingCount: data.stats.pendingAssignments,
        isRefreshing: false,
      );
    } catch (e) {
      state = state.copyWith(
        isRefreshing: false,
        error: getErrorMessage(handleApiError(e)),
      );
    }
  }

  void clearError() => state = state.copyWith();
}

final dashboardProvider =
    NotifierProvider<DashboardNotifier, DashboardState>(
  DashboardNotifier.new,
);
