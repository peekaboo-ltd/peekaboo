import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Page header matching the client's InternalPageHeader: eyebrow, title,
/// and muted description over a line border.
class PkPageHeader extends StatelessWidget {
  final String title;
  final String? eyebrow;
  final String? description;
  final Widget? actions;

  const PkPageHeader({
    super.key,
    required this.title,
    this.eyebrow,
    this.description,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return Container(
      padding: const EdgeInsets.only(bottom: PkSpace.s24),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: t.line)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (eyebrow != null) Text(eyebrow!, style: type.eyebrow),
          const SizedBox(height: PkSpace.s8),
          Text(title, style: type.h2),
          if (description != null) ...[
            const SizedBox(height: PkSpace.s12),
            Text(
              description!,
              style: type.bodySm.copyWith(color: t.muted),
            ),
          ],
          if (actions != null) ...[
            const SizedBox(height: PkSpace.s16),
            actions!,
          ],
        ],
      ),
    );
  }
}
