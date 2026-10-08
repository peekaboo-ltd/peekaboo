import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Press = full-surface inset overlay, never a transform (DESIGN.md §7.1).
/// Used by cards, chips, and rows; Material buttons get the same treatment
/// via `overlayColor` in the theme.
class PkPressable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPress;
  final BorderRadius borderRadius;
  final Color? overlay;

  const PkPressable({
    super.key,
    required this.child,
    this.onPress,
    this.borderRadius = const BorderRadius.all(
      Radius.circular(PkSpace.radiusCard),
    ),
    this.overlay,
  });

  @override
  State<PkPressable> createState() => _PkPressableState();
}

class _PkPressableState extends State<PkPressable> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return GestureDetector(
      onTapDown: widget.onPress == null ? null : (_) {
        setState(() => _pressed = true);
      },
      onTapUp: widget.onPress == null
          ? null
          : (_) {
              setState(() => _pressed = false);
              widget.onPress!.call();
            },
      onTapCancel: () => setState(() => _pressed = false),
      child: Stack(
        children: [
          widget.child,
          Positioned.fill(
            child: IgnorePointer(
              child: AnimatedContainer(
                duration: PkMotion.durState,
                curve: PkMotion.easeFlat,
                decoration: BoxDecoration(
                  borderRadius: widget.borderRadius,
                  color: _pressed
                      ? (widget.overlay ?? t.pressOnPaper)
                      : Colors.transparent,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
