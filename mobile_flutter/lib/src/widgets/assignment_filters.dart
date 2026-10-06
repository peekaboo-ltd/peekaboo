import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../state/assignments_state.dart';
import '../theme/tokens.dart';

/// Filter tabs matching the client's tabs style: a 40px surface pill track
/// holding 32px trigger pills; the active trigger is inverted.
class AssignmentFilters extends ConsumerWidget {
  final AssignmentFilter activeFilter;
  final ValueChanged<AssignmentFilter> onFilterChange;

  const AssignmentFilters({
    super.key,
    required this.activeFilter,
    required this.onFilterChange,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);

    final options = [
      (AssignmentFilter.all, tr('assignments.filterAll')),
      (AssignmentFilter.pending, tr('assignments.pending')),
      (AssignmentFilter.active, tr('assignments.active')),
      (AssignmentFilter.completed, tr('assignments.completed')),
    ];

    return Container(
      decoration: BoxDecoration(
        color: t.paper,
        border: Border(bottom: BorderSide(color: t.line)),
      ),
      padding: const EdgeInsets.symmetric(vertical: PkSpace.s8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: PkSpace.s16),
        child: Container(
          height: PkSpace.controlMd,
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: t.surface,
            borderRadius: BorderRadius.circular(PkSpace.radiusPill),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final option in options)
                GestureDetector(
                  onTap: () => onFilterChange(option.$1),
                  child: AnimatedContainer(
                    duration: PkMotion.durState,
                    curve: PkMotion.easeFlat,
                    height: 32,
                    padding: const EdgeInsets.symmetric(horizontal: PkSpace.s16),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: activeFilter == option.$1
                          ? t.ink
                          : Colors.transparent,
                      borderRadius:
                          BorderRadius.circular(PkSpace.radiusPill),
                    ),
                    child: Text(
                      option.$2,
                      style: type.label.copyWith(
                        color: activeFilter == option.$1
                            ? t.paper
                            : t.muted,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
