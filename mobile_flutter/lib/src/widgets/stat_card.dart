import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'pk_card.dart';

/// Metric tile ported from StatCard.tsx (quiet treatment: stats use the
/// surface step, no border — §6.4).
class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final VoidCallback? onPress;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.onPress,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return PkCard(
      variant: PkCardVariant.quiet,
      onPress: onPress,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: t.ink,
              borderRadius: BorderRadius.circular(PkSpace.radiusControl),
            ),
            child: Icon(icon, size: 22, color: t.paper),
          ),
          const SizedBox(height: PkSpace.s16),
          Text(
            value,
            style: type.metric,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(title, style: type.meta),
        ],
      ),
    );
  }
}
