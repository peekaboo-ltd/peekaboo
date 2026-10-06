import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Button ported from mobile/components/ui/Button.tsx onto the DESIGN.md §6.1
/// system. Variants: primary / secondary / outline / ghost (+ link text).
/// The Expo `danger` variant maps to [PkButtonVariant.outline]: destructive
/// is communicated by copy + icon, not hue (§2 shadcn mapping).
enum PkButtonVariant { primary, secondary, outline, ghost }

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

    final label = loading
        ? SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: variant == PkButtonVariant.primary ? t.paper : t.ink,
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[icon!, const SizedBox(width: 8)],
              Flexible(
                child: Text(
                  title,
                  style: type.label.copyWith(
                    color: variant == PkButtonVariant.primary
                        ? t.paper
                        : null,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          );

    final style = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(Size(fullWidth ? double.infinity : 0, _height)),
      padding: WidgetStatePropertyAll(_padding),
      // Disabled: 40% opacity wash, no pointer (theme handles the rest).
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return t.disabledFg;
        }
        return variant == PkButtonVariant.primary ? t.paper : t.ink;
      }),
    );

    final child = switch (variant) {
      PkButtonVariant.primary => ElevatedButton(
          onPressed: effectiveOnPress,
          style: style,
          child: label,
        ),
      PkButtonVariant.secondary => FilledButton(
          onPressed: effectiveOnPress,
          style: style,
          child: label,
        ),
      PkButtonVariant.outline => OutlinedButton(
          onPressed: effectiveOnPress,
          style: style,
          child: label,
        ),
      PkButtonVariant.ghost => TextButton(
          onPressed: effectiveOnPress,
          style: style,
          child: label,
        ),
    };

    final button = Opacity(
      opacity: (disabled || loading) && variant != PkButtonVariant.primary
          ? 0.4
          : 1,
      child: child,
    );
    if (fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
