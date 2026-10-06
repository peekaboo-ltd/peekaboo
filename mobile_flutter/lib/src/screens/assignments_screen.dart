import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../models/assignment.dart';
import '../models/order.dart';
import '../state/assignments_state.dart';
import '../theme/tokens.dart';
import '../widgets/assignment_card.dart';
import '../widgets/assignment_filters.dart';
import '../widgets/dialogs.dart';
import '../widgets/error_view.dart' show AssignmentSkeletonCard;
import '../widgets/pk_button.dart';
import '../widgets/pk_page_header.dart';
import '../widgets/stat_card.dart';

/// Assignments queue ported from mobile/app/(tabs)/assignments.tsx.
class AssignmentsScreen extends ConsumerStatefulWidget {
  final String? initialFilterParam;

  const AssignmentsScreen({super.key, this.initialFilterParam});

  @override
  ConsumerState<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends ConsumerState<AssignmentsScreen> {
  final _scroll = ScrollController();
  String? _confirmingOrderId;

  @override
  void initState() {
    super.initState();
    if (widget.initialFilterParam != null) {
      Future.microtask(() {
        ref.read(assignmentsProvider.notifier).setFilter(
              filterFromParam(widget.initialFilterParam),
            );
      });
    }
    Future.microtask(() {
      if (ref.read(assignmentsProvider).assignments.isEmpty) {
        ref.read(assignmentsProvider.notifier).fetchAssignments();
      }
    });
    _scroll.addListener(() {
      final position = _scroll.position;
      if (position.pixels >= position.maxScrollExtent * 0.7) {
        ref.read(assignmentsProvider.notifier).fetchMore();
      }
    });
  }

  @override
  void didUpdateWidget(covariant AssignmentsScreen old) {
    super.didUpdateWidget(old);
    if (widget.initialFilterParam != null &&
        widget.initialFilterParam != old.initialFilterParam) {
      ref.read(assignmentsProvider.notifier).setFilter(
            filterFromParam(widget.initialFilterParam),
          );
    }
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _accept(String id, Translate tr) async {
    final ok =
        await ref.read(assignmentsProvider.notifier).accept(id);
    if (!ok && mounted) {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignments.acceptFailed');
      await showPkAlert(
        context,
        title: tr('common.error'),
        message: message,
      );
    }
  }

  Future<void> _reject(String id, Translate tr) async {
    final ok =
        await ref.read(assignmentsProvider.notifier).reject(id);
    if (!ok && mounted) {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignments.rejectFailed');
      await showPkAlert(
        context,
        title: tr('common.error'),
        message: message,
      );
    }
  }

  Future<void> _confirmTransit(Assignment a, Translate tr) async {
    if (a.orderId.isEmpty) return;
    await showPkConfirm(
      context,
      title: tr('assignments.confirmTransit'),
      message: tr('assignments.confirmTransitMessage'),
      confirmLabel: tr('assignments.confirmTransit'),
      onConfirm: () async {
        setState(() => _confirmingOrderId = a.orderId);
        try {
          final ok = await ref
              .read(assignmentsProvider.notifier)
              .confirmDispatch(a.orderId);
          if (!mounted) return;
          if (ok) {
            await ref.read(assignmentsProvider.notifier).refresh();
            if (!mounted) return;
            await showPkAlert(
              context,
              title: tr('common.success'),
              message: tr('assignments.transitSuccess'),
            );
          } else {
            final message =
                ref.read(assignmentsProvider).error ??
                    tr('assignments.transitFailed');
            await showPkAlert(
              context,
              title: tr('common.error'),
              message: message,
            );
          }
        } finally {
          if (mounted) setState(() => _confirmingOrderId = null);
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final full = ref.watch(assignmentsProvider);
    final state = full.visible;

    final summary = (
      pending: full.assignments
          .where((a) => a.status == AssignmentStatus.pending)
          .length,
      active: full.assignments
          .where((a) => a.status == AssignmentStatus.active)
          .length,
      completed: full.assignments
          .where((a) => a.status == AssignmentStatus.completed)
          .length,
    );

    final isInitialLoading =
        full.isLoading && full.assignments.isEmpty && !full.isRefreshing;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(PkSpace.s16),
              child: Column(
                children: [
                  PkPageHeader(
                    eyebrow: tr('assignments.title'),
                    title: tr('assignments.queueTitle'),
                    description: tr(
                      'assignments.totalAssignments',
                      {'count': full.assignments.length},
                    ),
                    actions: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: PkSpace.s12,
                        vertical: PkSpace.s4,
                      ),
                      decoration: BoxDecoration(
                        color: t.ink,
                        borderRadius: BorderRadius.circular(
                          PkSpace.radiusPill,
                        ),
                      ),
                      child: Text(
                        '${summary.active} ${tr('assignments.active')}',
                        style: type.meta.copyWith(
                          color: t.paper,
                          fontWeight: PkType.medium,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: PkSpace.s16),
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: tr('assignments.pending'),
                          value: '${summary.pending}',
                          icon: Icons.schedule_outlined,
                        ),
                      ),
                      const SizedBox(width: PkSpace.s16),
                      Expanded(
                        child: StatCard(
                          title: tr('assignments.completed'),
                          value: '${summary.completed}',
                          icon: Icons.check_circle_outline,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            AssignmentFilters(
              activeFilter: full.filter,
              onFilterChange: (f) => ref
                  .read(assignmentsProvider.notifier)
                  .setFilter(f),
            ),
            if (full.error != null && full.error!.isNotEmpty)
              Container(
                margin: const EdgeInsets.fromLTRB(
                  PkSpace.s16,
                  PkSpace.s8,
                  PkSpace.s16,
                  0,
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: PkSpace.s16,
                  vertical: PkSpace.s8,
                ),
                decoration: BoxDecoration(
                  borderRadius:
                      BorderRadius.circular(PkSpace.radiusCard),
                  border: Border.all(color: t.line),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_outlined, size: 18, color: t.ink),
                    const SizedBox(width: PkSpace.s8),
                    Expanded(
                      child: Text(full.error!, style: type.bodySm),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: isInitialLoading
                  ? ListView.separated(
                      padding: const EdgeInsets.all(PkSpace.s16),
                      itemCount: 4,
                      separatorBuilder: (_, _) => const SizedBox(
                        height: PkSpace.s16,
                      ),
                      itemBuilder: (_, _) =>
                          const AssignmentSkeletonCard(),
                    )
                  : RefreshIndicator(
                      color: t.ink,
                      onRefresh: () => ref
                          .read(assignmentsProvider.notifier)
                          .refresh(),
                      child: state.isEmpty
                          ? ListView(
                              children: [
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: PkSpace.s48,
                                  ),
                                  child: Column(
                                    children: [
                                      Icon(
                                        Icons.description_outlined,
                                        size: 64,
                                        color: t.muted,
                                      ),
                                      const SizedBox(height: PkSpace.s16),
                                      Text(
                                        tr('assignments.emptyTitle'),
                                        style: type.h3,
                                      ),
                                      const SizedBox(height: PkSpace.s4),
                                      Text(
                                        full.filter == AssignmentFilter.all
                                            ? tr('assignments.emptyAll')
                                            : tr(
                                                'assignments.emptyFiltered',
                                                {
                                                  'filter': full.filter.name
                                                      .toLowerCase(),
                                                },
                                              ),
                                        style: type.body.copyWith(
                                          color: t.muted,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          : ListView.separated(
                              controller: _scroll,
                              padding: const EdgeInsets.all(PkSpace.s16),
                              itemCount: state.length + 1,
                              separatorBuilder: (_, _) =>
                                  const SizedBox(height: PkSpace.s16),
                              itemBuilder: (context, index) {
                                if (index == state.length) {
                                  if (full.isLoading &&
                                      !full.isRefreshing) {
                                    return const AssignmentSkeletonCard(
                                      compact: true,
                                    );
                                  }
                                  return const SizedBox(
                                    height: PkSpace.s32,
                                  );
                                }
                                final a = state[index];
                                final latest =
                                    a.order?.latestStatus;
                                final canTransit = a.orderId.isNotEmpty &&
                                    a.status == AssignmentStatus.active &&
                                    latest == OrderStatus.accepted;
                                return Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    AssignmentCard(
                                      assignment: a,
                                      onPress: () => context.push(
                                        '/assignment/${a.id}',
                                      ),
                                      onAccept: a.status ==
                                              AssignmentStatus.pending
                                          ? () => _accept(a.id, tr)
                                          : null,
                                      onReject: a.status ==
                                              AssignmentStatus.pending
                                          ? () => _reject(a.id, tr)
                                          : null,
                                      isLoading: full.isLoading,
                                    ),
                                    if (canTransit) ...[
                                      const SizedBox(height: PkSpace.s8),
                                      PkButton(
                                        title: tr(
                                          'assignments.confirmTransit',
                                        ),
                                        onPress: () =>
                                            _confirmTransit(a, tr),
                                        fullWidth: true,
                                        loading: _confirmingOrderId ==
                                            a.orderId,
                                        disabled:
                                            _confirmingOrderId != null,
                                      ),
                                    ],
                                  ],
                                );
                              },
                            ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

