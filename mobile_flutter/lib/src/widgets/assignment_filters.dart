import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../state/assignments_state.dart';
import '../theme/tokens.dart';

/// Filter chips ported from AssignmentFilters.tsx. Active chip follows the
/// inversion rule (DESIGN.md §2.1).
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
        child: Row(
          children: [
            for (var i = 0; i < options.length; i++) ...[
              if (i > 0) const SizedBox(width: PkSpace.s8),
              _Chip(
                label: options[i].$2,
                selected: activeFilter == options[i].$1,
                onTap: () => onFilterChange(options[i].$1),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: PkMotion.durState,
        curve: PkMotion.easeFlat,
        height: PkSpace.controlSm,
        padding: const EdgeInsets.symmetric(horizontal: PkSpace.s16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? t.ink : t.paper,
          borderRadius: BorderRadius.circular(PkSpace.radiusPill),
          border: Border.all(color: selected ? t.ink : t.line),
        ),
        child: Text(
          label,
          style: type.label.copyWith(color: selected ? t.paper : t.muted),
        ),
      ),
    );
  }
}
