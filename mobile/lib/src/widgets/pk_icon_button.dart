import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Icon-only control. The icon carries the meaning; [tooltip] is required
/// and doubles as the screen-reader label, so the action is never unnamed.
/// Consequence variants color the icon (red-700 destroy, green-700
/// confirm) and flood to a solid fill on press, like [PkButton].
enum PkIconButtonVariant {
  ghost,
  outline,
  primary,
  destructive,
  approve,
  warning,
}

enum PkIconButtonSize { sm, md, lg }

class PkIconButton extends StatefulWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback? onPress;
  final PkIconButtonVariant variant;
  final PkIconButtonSize size;
  final bool loading;
  final bool circle;

  /// Ground for [PkIconButtonVariant.ghost]/[outline] when the button sits
  /// on an inverted surface; defaults to the page tokens.
  final PkTokens? tokens;

  const PkIconButton({
    super.key,
    required this.icon,
    required this.tooltip,
    required this.onPress,
    this.variant = PkIconButtonVariant.ghost,
    this.size = PkIconButtonSize.md,
    this.loading = false,
    this.circle = false,
    this.tokens,
  });

  @override
  State<PkIconButton> createState() => _PkIconButtonState();
}

class _PkIconButtonState extends State<PkIconButton> {
  bool _pressed = false;

  double get _extent {
    switch (widget.size) {
      case PkIconButtonSize.sm:
        return PkSpace.controlSm;
      case PkIconButtonSize.md:
        return PkSpace.controlMd;
      case PkIconButtonSize.lg:
        return PkSpace.controlLg;
    }
  }

  double get _iconSize => widget.size == PkIconButtonSize.sm ? 18 : 20;

  void _setPressed(bool value) {
    if (_pressed != value) setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.tokens ?? context.tokens;
    final enabled = widget.onPress != null && !widget.loading;

    PkConsequence? consequence;
    switch (widget.variant) {
      case PkIconButtonVariant.destructive:
        consequence = t.danger;
      case PkIconButtonVariant.approve:
        consequence = t.approve;
      case PkIconButtonVariant.warning:
        consequence = t.warning;
      case PkIconButtonVariant.ghost:
      case PkIconButtonVariant.outline:
      case PkIconButtonVariant.primary:
        consequence = null;
    }

    final Color ground;
    final Color edge;
    final Color fg;
    if (consequence != null) {
      ground = _pressed ? consequence.main : consequence.surface;
      edge = consequence.line;
      fg = _pressed ? t.onConsequence : consequence.main;
    } else if (widget.variant == PkIconButtonVariant.primary) {
      ground = t.ink;
      edge = t.ink;
      fg = t.paper;
    } else {
      ground = _pressed ? t.surface : Colors.transparent;
      edge = widget.variant == PkIconButtonVariant.outline
          ? t.line
          : Colors.transparent;
      fg = t.ink;
    }

    final radius = widget.circle
        ? BorderRadius.circular(PkSpace.radiusPill)
        : BorderRadius.circular(PkSpace.radiusControl);

    final face = AnimatedContainer(
      duration: PkMotion.durState,
      curve: PkMotion.easeFlat,
      width: _extent,
      height: _extent,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: ground,
        borderRadius: radius,
        border: Border.all(color: edge),
      ),
      child: widget.loading
          ? SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: fg),
            )
          : Icon(widget.icon, size: _iconSize, color: fg),
    );

    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.tooltip,
      onTap: enabled ? widget.onPress : null,
      excludeSemantics: true,
      child: Tooltip(
        message: widget.tooltip,
        excludeFromSemantics: true,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: enabled ? (_) => _setPressed(true) : null,
          onTapCancel: () => _setPressed(false),
          onTapUp: enabled
              ? (_) {
                  _setPressed(false);
                  widget.onPress!.call();
                }
              : null,
          // Pad small faces out to a 44px hit target.
          child: Padding(
            padding: EdgeInsets.all(
              (PkSpace.controlLg - _extent).clamp(0, 8) / 2,
            ),
            child: Opacity(opacity: enabled ? 1 : 0.4, child: face),
          ),
        ),
      ),
    );
  }
}
