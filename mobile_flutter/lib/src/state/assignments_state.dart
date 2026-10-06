import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/assignments_api.dart';
import '../config/app_config.dart';
import '../models/assignment.dart';
import '../models/order.dart';
import '../utils/app_error.dart';

/// Assignment filter. Filtering is client-side (mobile/hooks/useAssignments.ts).
enum AssignmentFilter { all, pending, active, completed }

AssignmentStatus? filterToStatus(AssignmentFilter filter) {
  switch (filter) {
    case AssignmentFilter.pending:
      return AssignmentStatus.pending;
    case AssignmentFilter.active:
      return AssignmentStatus.active;
    case AssignmentFilter.completed:
      return AssignmentStatus.completed;
    case AssignmentFilter.all:
      return null;
  }
}

AssignmentFilter filterFromParam(String? param) {
  switch (param) {
    case 'PENDING':
      return AssignmentFilter.pending;
    case 'ACTIVE':
      return AssignmentFilter.active;
    case 'COMPLETED':
      return AssignmentFilter.completed;
    case 'ALL':
    default:
      return AssignmentFilter.all;
  }
}

class AssignmentsState {
  final List<Assignment> assignments;
  final Assignment? selected;
  final bool isLoading;
  final bool isRefreshing;
  final String? error;
  final AssignmentFilter filter;
  final int page;
  final int totalPages;
  final bool hasMore;

  const AssignmentsState({
    this.assignments = const [],
    this.selected,
    this.isLoading = false,
    this.isRefreshing = false,
    this.error,
    this.filter = AssignmentFilter.pending,
    this.page = 1,
    this.totalPages = 1,
    this.hasMore = false,
  });

  List<Assignment> get visible {
    final status = filterToStatus(filter);
    final list = status == null
        ? List<Assignment>.of(assignments)
        : assignments.where((a) => a.status == status).toList();
    list.sort((a, b) => orderStatusSortRank(a.order?.latestStatus)
        .compareTo(orderStatusSortRank(b.order?.latestStatus)));
    return list;
  }

  AssignmentsState copyWith({
    List<Assignment>? assignments,
    Assignment? Function()? selected,
    bool? isLoading,
    bool? isRefreshing,
    String? error,
    AssignmentFilter? filter,
    int? page,
    int? totalPages,
    bool? hasMore,
  }) {
    return AssignmentsState(
      assignments: assignments ?? this.assignments,
      selected: selected != null ? selected() : this.selected,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      error: error,
      filter: filter ?? this.filter,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

int _recency(Assignment a) {
  final updated = DateTime.tryParse(a.updatedAt)?.millisecondsSinceEpoch;
  if (updated != null) return updated;
  return DateTime.tryParse(a.createdAt)?.millisecondsSinceEpoch ?? 0;
}

/// Keep only the latest assignment per order (assignmentStore.ts).
List<Assignment> normalizeLatestAssignments(List<Assignment> input) {
  final latestByOrder = <String, Assignment>{};
  for (final assignment in input) {
    final key =
        assignment.orderId.isEmpty ? assignment.id : assignment.orderId;
    final existing = latestByOrder[key];
    if (existing == null || _recency(assignment) >= _recency(existing)) {
      latestByOrder[key] = assignment;
    }
  }
  return latestByOrder.values.toList();
}

/// Assignment state machine ported from mobile/store/assignmentStore.ts.
class AssignmentsNotifier extends Notifier<AssignmentsState> {
  @override
  AssignmentsState build() => const AssignmentsState();

  Future<void> fetchAssignments([AssignmentFilter? filter]) async {
    state = state.copyWith(
      isLoading: true,
      filter: filter ?? state.filter,
      page: 1,
    );
    try {
      final response = await ref.read(assignmentsApiProvider).getAll(
            page: 1,
            size: ApiConstants.assignmentsPageSize,
          );
      state = state.copyWith(
        assignments: normalizeLatestAssignments(response.data),
        page: response.page,
        totalPages: response.totalPages,
        hasMore: response.page < response.totalPages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
    }
  }

  Future<void> fetchMore() async {
    if (!state.hasMore || state.isLoading) return;
    state = state.copyWith(isLoading: true);
    try {
      final nextPage = state.page + 1;
      final response = await ref.read(assignmentsApiProvider).getAll(
            page: nextPage,
            size: ApiConstants.assignmentsPageSize,
          );
      state = state.copyWith(
        assignments: normalizeLatestAssignments(
          [...state.assignments, ...response.data],
        ),
        page: nextPage,
        hasMore: nextPage < response.totalPages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
    }
  }

  Future<Assignment?> fetchById(String id) async {
    state = state.copyWith(isLoading: true);
    try {
      final assignment =
          await ref.read(assignmentsApiProvider).getById(id);
      state = state.copyWith(selected: () => assignment, isLoading: false);
      return assignment;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
      return null;
    }
  }

  void _applyUpdate(Assignment update) {
    final merged = state.assignments
        .map((a) => a.id == update.id ? a.merge(update) : a)
        .toList();
    state = state.copyWith(
      assignments: normalizeLatestAssignments(merged),
      selected: () => state.selected?.id == update.id
          ? state.selected!.merge(update)
          : state.selected,
      isLoading: false,
    );
  }

  Future<bool> accept(String id) async {
    state = state.copyWith(isLoading: true);
    try {
      _applyUpdate(await ref.read(assignmentsApiProvider).accept(id));
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
      return false;
    }
  }

  Future<bool> reject(String id, {String? reason}) async {
    state = state.copyWith(isLoading: true);
    try {
      _applyUpdate(
        await ref.read(assignmentsApiProvider).reject(id, reason: reason),
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
      return false;
    }
  }

  Future<bool> recover(String id) async {
    state = state.copyWith(isLoading: true);
    try {
      _applyUpdate(await ref.read(assignmentsApiProvider).recover(id));
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
      return false;
    }
  }

  Future<bool> confirmDispatch(String orderId, {String? trackingId}) async {
    state = state.copyWith();
    try {
      await ref
          .read(assignmentsApiProvider)
          .confirmOrderDispatch(orderId, trackingId: trackingId);
      Order? toInTransit(Order? order) =>
          order?.copyWith(status: OrderStatus.inTransit);
      state = state.copyWith(
        assignments: state.assignments
            .map((a) => a.orderId == orderId
                ? a.copyWith(order: toInTransit(a.order))
                : a)
            .toList(),
        selected: () =>
            state.selected?.copyWith(order: toInTransit(state.selected?.order)),
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: getErrorMessage(handleApiError(e)));
      return false;
    }
  }

  Future<bool> completeOrder(String orderId, String trackingId) async {
    state = state.copyWith(isLoading: true);
    try {
      await ref
          .read(assignmentsApiProvider)
          .completeOrder(orderId, trackingId);
      final completedId = state.selected?.id;
      final updated = completedId == null
          ? state.assignments
          : normalizeLatestAssignments(
              state.assignments.map((a) {
                if (a.id != completedId) return a;
                return a.copyWith(
                  status: AssignmentStatus.completed,
                  order: a.order
                      ?.copyWith(status: OrderStatus.completed),
                );
              }).toList(),
            );
      final selected = state.selected;
      state = state.copyWith(
        assignments: updated,
        selected: () => selected?.copyWith(
              status: AssignmentStatus.completed,
              order:
                  selected.order?.copyWith(status: OrderStatus.completed),
            ),
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: getErrorMessage(handleApiError(e)),
      );
      return false;
    }
  }

  Future<void> refresh() async {
    state = state.copyWith(isRefreshing: true);
    try {
      final response = await ref.read(assignmentsApiProvider).getAll(
            page: 1,
            size: ApiConstants.assignmentsPageSize,
          );
      state = state.copyWith(
        assignments: normalizeLatestAssignments(response.data),
        page: response.page,
        totalPages: response.totalPages,
        hasMore: response.page < response.totalPages,
        isRefreshing: false,
      );
    } catch (e) {
      state = state.copyWith(
        isRefreshing: false,
        error: getErrorMessage(handleApiError(e)),
      );
    }
  }

  void setFilter(AssignmentFilter filter) =>
      state = state.copyWith(filter: filter);

  void setSelected(Assignment? assignment) =>
      state = state.copyWith(selected: () => assignment);

  void clearError() => state = state.copyWith();
}

final assignmentsProvider =
    NotifierProvider<AssignmentsNotifier, AssignmentsState>(
  AssignmentsNotifier.new,
);
