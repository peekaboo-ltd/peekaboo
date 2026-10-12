import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Section card matching the client's InternalSectionCard: framed card with
/// an optional titled header block over a line border, then padded content.
class PkSectionCard extends StatelessWidget {
  final Widget child;
  final String? title;
  final String? description;
  final String? eyebrow;
  final Widget? actions;

  /// Icon controls placed on the title line (edit, save, cancel).
  final Widget? trailing;

  const PkSectionCard({
    super.key,
    required this.child,
    this.title,
    this.description,
    this.eyebrow,
    this.actions,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final hasHeader = title != null ||
        description != null ||
        eyebrow != null ||
        actions != null ||
        trailing != null;

    return Container(
      decoration: BoxDecoration(
        color: t.paper,
        borderRadius: BorderRadius.circular(PkSpace.radiusCard),
        border: Border.all(color: t.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (hasHeader)
            Container(
              padding: trailing == null
                  ? const EdgeInsets.all(PkSpace.s24)
                  : const EdgeInsets.fromLTRB(
                      PkSpace.s24,
                      PkSpace.s12,
                      PkSpace.s12,
                      PkSpace.s12,
                    ),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: t.line)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (eyebrow != null) Text(eyebrow!, style: type.eyebrow),
                  if (title != null || trailing != null) ...[
                    if (eyebrow != null) const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(title ?? '', style: type.cardTitle),
                        ),
                        ?trailing,
                      ],
                    ),
                  ],
                  if (description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      description!,
                      style: type.bodySm.copyWith(color: t.muted),
                    ),
                  ],
                  if (actions != null) ...[
                    const SizedBox(height: PkSpace.s12),
                    actions!,
                  ],
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(PkSpace.s24),
            child: child,
          ),
        ],
      ),
    );
  }
}
