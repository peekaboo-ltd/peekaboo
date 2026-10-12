import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../state/assignments_state.dart';
import '../theme/tokens.dart';

/// Filter bar: a full-width surface track of four equal segments, each an
/// icon plus its count. The active segment is inverted. Filter names live
/// in tooltips and semantics, so the bar fits a phone in either language.
class AssignmentFilters extends ConsumerWidget {
  final AssignmentFilter activeFilter;
  final ValueChanged<AssignmentFilter> onFilterChange;
  final Map<AssignmentFilter, int> counts;

  const AssignmentFilters({
    super.key,
    required this.activeFilter,
    required this.onFilterChange,
    this.counts = const {},
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);

    final options = [
      (AssignmentFilter.all, Icons.inbox_outlined, tr('assignments.filterAll')),
      (
        AssignmentFilter.pending,
        Icons.schedule,
        tr('assignments.pending'),
      ),
      (AssignmentFilter.active, Icons.autorenew, tr('assignments.active')),
      (
        AssignmentFilter.completed,
        Icons.check_circle_outline,
        tr('assignments.completed'),
      ),
    ];

    return Container(
      decoration: BoxDecoration(
        color: t.paper,
        border: Border(bottom: BorderSide(color: t.line)),
      ),
      padding: const EdgeInsets.fromLTRB(
        PkSpace.s16,
        0,
        PkSpace.s16,
        PkSpace.s12,
      ),
      child: Container(
        height: PkSpace.controlLg,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: t.surface,
          borderRadius: BorderRadius.circular(PkSpace.radiusPill),
        ),
        child: Row(
          children: [
            for (final option in options)
              Expanded(
                child: Semantics(
                  button: true,
                  selected: activeFilter == option.$1,
                  label: counts[option.$1] == null
                      ? option.$3
                      : '${option.$3}: ${counts[option.$1]}',
                  onTap: () => onFilterChange(option.$1),
                  excludeSemantics: true,
                  child: Tooltip(
                    message: option.$3,
                    excludeFromSemantics: true,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => onFilterChange(option.$1),
                      child: AnimatedContainer(
                        duration: PkMotion.durState,
                        curve: PkMotion.easeFlat,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: activeFilter == option.$1
                              ? t.ink
                              : Colors.transparent,
                          borderRadius:
                              BorderRadius.circular(PkSpace.radiusPill),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              option.$2,
                              size: 18,
                              color: activeFilter == option.$1
                                  ? t.paper
                                  : t.muted,
                            ),
                            if (counts[option.$1] != null) ...[
                              const SizedBox(width: 6),
                              Text(
                                '${counts[option.$1]}',
                                style: type.tabular(type.label).copyWith(
                                      color: activeFilter == option.$1
                                          ? t.paper
                                          : t.muted,
                                    ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
