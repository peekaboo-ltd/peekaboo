import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Button matching the client's `ui/button.tsx`: primary, secondary, outline
/// (same quiet surface treatment as secondary), ghost, destructive, approve,
/// and field. Labels are 14/500; press is a full-surface flood; disabled is
/// a 40% wash with no pointer.
enum PkButtonVariant {
  primary,
  secondary,
  outline,
  ghost,
  destructive,
  approve,
  field,
}

enum PkButtonSize { sm, md, lg }

class PkButton extends StatelessWidget {
  final String title;
  final VoidCallback? onPress;
  final PkButtonVariant variant;
  final PkButtonSize size;
  final bool loading;
  final bool disabled;
  final Widget? icon;
  final bool fullWidth;

  const PkButton({
    super.key,
    required this.title,
    required this.onPress,
    this.variant = PkButtonVariant.primary,
    this.size = PkButtonSize.md,
    this.loading = false,
    this.disabled = false,
    this.icon,
    this.fullWidth = false,
  });

  double get _height {
    switch (size) {
      case PkButtonSize.sm:
        return PkSpace.controlSm;
      case PkButtonSize.md:
        return PkSpace.controlMd;
      case PkButtonSize.lg:
        return PkSpace.controlLg;
    }
  }

  EdgeInsetsGeometry get _padding {
    switch (size) {
      case PkButtonSize.sm:
        return const EdgeInsets.symmetric(horizontal: 14);
      case PkButtonSize.md:
        return const EdgeInsets.symmetric(horizontal: 16);
      case PkButtonSize.lg:
        return const EdgeInsets.symmetric(horizontal: 24);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final effectiveOnPress = (disabled || loading) ? null : onPress;

    // Per-variant ground, edge, and label. Destructive/approve flood to a
    // solid fill on press so the commit is unmistakable.
    Color ground(Set<WidgetState> states) {
      final pressed = states.contains(WidgetState.pressed);
      switch (variant) {
        case PkButtonVariant.primary:
          return t.ink;
        case PkButtonVariant.secondary:
        case PkButtonVariant.outline:
          return states.contains(WidgetState.hovered)
              ? t.surfaceHover
              : t.surface;
        case PkButtonVariant.ghost:
          return Colors.transparent;
        case PkButtonVariant.destructive:
          return pressed ? t.danger.main : Colors.transparent;
        case PkButtonVariant.approve:
          return pressed ? t.approve.main : Colors.transparent;
        case PkButtonVariant.field:
          return t.paper;
      }
    }

    Color edge(Set<WidgetState> states) {
      switch (variant) {
        case PkButtonVariant.primary:
          return t.ink;
        case PkButtonVariant.secondary:
        case PkButtonVariant.outline:
        case PkButtonVariant.ghost:
          return Colors.transparent;
        case PkButtonVariant.destructive:
          return t.danger.main;
        case PkButtonVariant.approve:
          return t.approve.main;
        case PkButtonVariant.field:
          return t.line;
      }
    }

    Color label(Set<WidgetState> states) {
      if (states.contains(WidgetState.disabled)) return t.disabledFg;
      final pressed = states.contains(WidgetState.pressed);
      switch (variant) {
        case PkButtonVariant.primary:
          return t.paper;
        case PkButtonVariant.destructive:
          return pressed ? t.onConsequence : t.danger.main;
        case PkButtonVariant.approve:
          return pressed ? t.onConsequence : t.approve.main;
        case PkButtonVariant.secondary:
        case PkButtonVariant.outline:
        case PkButtonVariant.ghost:
        case PkButtonVariant.field:
          return t.ink;
      }
    }

    Color? overlay(Set<WidgetState> states) {
      if (!states.contains(WidgetState.pressed)) {
        if (states.contains(WidgetState.hovered) &&
            (variant == PkButtonVariant.secondary ||
                variant == PkButtonVariant.outline ||
                variant == PkButtonVariant.ghost)) {
          return t.surface;
        }
        return Colors.transparent;
      }
      switch (variant) {
        case PkButtonVariant.primary:
        case PkButtonVariant.destructive:
        case PkButtonVariant.approve:
          return t.pressOnInk;
        case PkButtonVariant.secondary:
        case PkButtonVariant.outline:
        case PkButtonVariant.ghost:
        case PkButtonVariant.field:
          return t.pressOnPaper;
      }
    }

    final style = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(
        Size(fullWidth ? double.infinity : 0, _height),
      ),
      padding: WidgetStatePropertyAll(_padding),
      backgroundColor: WidgetStateProperty.resolveWith(ground),
      foregroundColor: WidgetStateProperty.resolveWith(label),
      overlayColor: WidgetStateProperty.resolveWith(overlay),
      side: WidgetStateProperty.resolveWith(
        (states) => BorderSide(color: edge(states)),
      ),
      textStyle: WidgetStatePropertyAll(type.label),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        ),
      ),
      elevation: const WidgetStatePropertyAll(0),
      shadowColor: const WidgetStatePropertyAll(Colors.transparent),
      animationDuration: PkMotion.durState,
    );

    final content = loading
        ? SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: variant == PkButtonVariant.primary
                  ? t.paper
                  : variant == PkButtonVariant.destructive
                      ? t.danger.main
                      : variant == PkButtonVariant.approve
                          ? t.approve.main
                          : t.ink,
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: variant == PkButtonVariant.field
                ? MainAxisAlignment.start
                : MainAxisAlignment.center,
            children: [
              if (icon != null) ...[icon!, const SizedBox(width: 8)],
              Flexible(
                child: Text(
                  title,
                  style: type.label.copyWith(
                    fontWeight: variant == PkButtonVariant.field
                        ? PkType.regular
                        : PkType.medium,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          );

    final button = Opacity(
      opacity: (disabled || loading) ? 0.4 : 1,
      child: variant == PkButtonVariant.field
          ? OutlinedButton(
              onPressed: effectiveOnPress,
              style: style,
              child: content,
            )
          : ElevatedButton(
              onPressed: effectiveOnPress,
              style: style,
              child: content,
            ),
    );
    if (fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
