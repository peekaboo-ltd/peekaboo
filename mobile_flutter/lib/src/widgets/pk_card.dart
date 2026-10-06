import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Card matching the client's `ui/card.tsx`: framed (default), quiet, and
/// inverted variants with 16/20/24 padding. An interactive framed card inks
/// its edge on press; quiet steps its fill. No lift, no shadow, no scale.
enum PkCardVariant { framed, quiet, inverted }

enum PkCardPadding { none, sm, md, lg }

class PkCard extends StatefulWidget {
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

  @override
  State<PkCard> createState() => _PkCardState();
}

class _PkCardState extends State<PkCard> {
  bool _pressed = false;

  EdgeInsetsGeometry get _padding {
    switch (widget.padding) {
      case PkCardPadding.none:
        return EdgeInsets.zero;
      case PkCardPadding.sm:
        return const EdgeInsets.all(PkSpace.s16);
      case PkCardPadding.md:
        return const EdgeInsets.all(PkSpace.s20);
      case PkCardPadding.lg:
        return const EdgeInsets.all(PkSpace.s24);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final radius = BorderRadius.circular(PkSpace.radiusCard);
    final interactive = widget.onPress != null;

    Color fill;
    Border? border;
    switch (widget.variant) {
      case PkCardVariant.framed:
        fill = t.paper;
        border = Border.all(
          color: interactive && _pressed ? t.ink : t.line,
        );
      case PkCardVariant.quiet:
        fill = interactive && _pressed ? t.surfaceHover : t.surface;
        border = null;
      case PkCardVariant.inverted:
        final ground = PkTokens.inverted(Theme.of(context).brightness);
        fill = ground.paper;
        border = null;
    }

    Widget content = AnimatedContainer(
      duration: PkMotion.durState,
      curve: PkMotion.easeFlat,
      padding: _padding,
      decoration: BoxDecoration(
        color: fill,
        borderRadius: radius,
        border: border,
      ),
      child: widget.variant == PkCardVariant.inverted
          ? IconTheme(
              data: IconThemeData(color: t.paper),
              child: DefaultTextStyle.merge(
                style: TextStyle(color: t.paper),
                child: widget.child,
              ),
            )
          : widget.child,
    );

    if (interactive) {
      content = GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) {
          setState(() => _pressed = false);
          widget.onPress!.call();
        },
        onTapCancel: () => setState(() => _pressed = false),
        child: Stack(
          children: [
            content,
            Positioned.fill(
              child: IgnorePointer(
                child: AnimatedContainer(
                  duration: PkMotion.durState,
                  curve: PkMotion.easeFlat,
                  decoration: BoxDecoration(
                    borderRadius: radius,
                    color: _pressed
                        ? (widget.variant == PkCardVariant.inverted
                            ? t.pressOnInk
                            : t.pressOnPaper)
                        : Colors.transparent,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }
    return content;
  }
}
