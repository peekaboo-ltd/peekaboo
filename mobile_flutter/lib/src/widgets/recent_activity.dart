import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../models/dashboard.dart';
import '../theme/tokens.dart';
import '../utils/formatters.dart';
import 'pk_card.dart';

IconData activityIcon(ActivityType type) {
  return switch (type) {
    ActivityType.assignmentAccepted => Icons.check_circle_outline,
    ActivityType.assignmentCompleted => Icons.emoji_events_outlined,
    ActivityType.assignmentRejected => Icons.cancel_outlined,
    ActivityType.orderDelivered => Icons.pedal_bike_outlined,
  };
}

/// Recent-activity list ported from RecentActivity.tsx.
class RecentActivityList extends ConsumerWidget {
  final List<RecentActivity> activities;
  final ValueChanged<RecentActivity>? onActivityPress;

  const RecentActivityList({
    super.key,
    required this.activities,
    this.onActivityPress,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);

    if (activities.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: PkSpace.s32),
        child: Column(
          children: [
            Icon(Icons.schedule_outlined, size: 48, color: t.muted),
            const SizedBox(height: PkSpace.s8),
            Text(tr('activity.empty'), style: type.meta),
          ],
        ),
      );
    }

    return Column(
      children: [
        for (var i = 0; i < activities.length; i++) ...[
          if (i > 0) const SizedBox(height: PkSpace.s8),
          PkCard(
            padding: PkCardPadding.sm,
            onPress: onActivityPress == null
                ? null
                : () => onActivityPress!(activities[i]),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: t.surface,
                  ),
                  child: Icon(
                    activityIcon(activities[i].type),
                    size: 18,
                    color: t.ink,
                  ),
                ),
                const SizedBox(width: PkSpace.s8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activities[i].description,
                        style: type.bodySm,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        formatRelativeTime(activities[i].timestamp),
                        style: type.meta,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
