import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'pk_card.dart';

/// Metric tile matching the client's MetricCard header: a 36px surface icon
/// chip beside a muted label, with the metric value below. No sparkline or
/// trend — the rider API provides neither.
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
      onPress: onPress,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: t.surface,
                  borderRadius:
                      BorderRadius.circular(PkSpace.radiusControl),
                ),
                child: Icon(icon, size: 18, color: t.ink),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: type.bodySm.copyWith(color: t.muted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: PkSpace.s12),
          Text(
            value,
            style: type.metric,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
