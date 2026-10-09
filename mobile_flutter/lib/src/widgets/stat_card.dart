import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'pk_card.dart';

/// Metric tile: a 36px surface icon chip beside the value. The title is
/// not printed; it lives in the tooltip and the semantics label, so long
/// Kinyarwanda titles never truncate on a phone-width grid.
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
    return Semantics(
      label: '$title: $value',
      button: onPress != null,
      onTap: onPress,
      excludeSemantics: true,
      child: Tooltip(
        message: title,
        excludeFromSemantics: true,
        child: PkCard(
          onPress: onPress,
          padding: PkCardPadding.sm,
          child: Row(
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
              const SizedBox(width: PkSpace.s12),
              Expanded(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(value, style: type.metric, maxLines: 1),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
