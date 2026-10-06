import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'pk_pressable.dart';

/// Card ported from mobile/components/ui/Card.tsx onto DESIGN.md §6.4.
/// A card is separated by a surface step OR a hairline — never both.
/// Treatments: framed (default) / quiet / inverted. Interactive cards darken
/// the edge (framed) or step the fill (quiet); no lift, no shadow, no scale.
enum PkCardVariant { framed, quiet, inverted }

enum PkCardPadding { none, sm, md, lg }

class PkCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onPress;
  final PkCardVariant variant;
  final PkCardPadding padding;

  const PkCard({
    super.key,
    required this.child,
    this.onPress,
    this.variant = PkCardVariant.framed,
    this.padding = PkCardPadding.md,
  });

  EdgeInsetsGeometry get _padding {
    switch (padding) {
      case PkCardPadding.none:
        return EdgeInsets.zero;
      case PkCardPadding.sm:
        return const EdgeInsets.all(PkSpace.s8);
      case PkCardPadding.md:
        return const EdgeInsets.all(PkSpace.s16);
      case PkCardPadding.lg:
        return const EdgeInsets.all(PkSpace.s20);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final radius = BorderRadius.circular(PkSpace.radiusCard);

    BoxDecoration decoration;
    switch (variant) {
      case PkCardVariant.framed:
        decoration = BoxDecoration(
          color: t.paper,
          borderRadius: radius,
          border: Border.all(color: t.line),
        );
      case PkCardVariant.quiet:
        decoration = BoxDecoration(
          color: t.surface,
          borderRadius: radius,
        );
      case PkCardVariant.inverted:
        decoration = BoxDecoration(
          color: t.ink,
          borderRadius: radius,
        );
    }

    Widget content = Container(
      padding: _padding,
      decoration: decoration,
      child: variant == PkCardVariant.inverted
          ? IconTheme(
              data: IconThemeData(color: t.paper),
              child: DefaultTextStyle.merge(
                style: TextStyle(color: t.paper),
                child: child,
              ),
            )
          : child,
    );

    if (onPress != null) {
      content = PkPressable(
        onPress: onPress,
        borderRadius: radius,
        overlay: variant == PkCardVariant.inverted
            ? t.pressOnInk
            : t.pressOnPaper,
        child: content,
      );
    }
    return content;
  }
}
