import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import 'pk_button.dart';

/// Alert.alert parity: monochrome dialog, icon + copy, paper panel with
/// hairline and menu shadow (§6.4).
Future<void> showPkAlert(
  BuildContext context, {
  required String title,
  required String message,
  String? okLabel,
  VoidCallback? onOk,
}) {
  return showDialog<void>(
    context: context,
    builder: (context) {
      final t = context.tokens;
      final type = context.type;
      return Consumer(
        builder: (context, ref, _) {
          final tr = ref.watch(tProvider);
          return AlertDialog(
            title: Text(title),
            content: Text(message, style: type.bodySm),
            actions: [
              PkButton(
                title: okLabel ?? tr('common.ok'),
                onPress: () {
                  Navigator.of(context).pop();
                  onOk?.call();
                },
                size: PkButtonSize.sm,
              ),
            ],
            backgroundColor: t.paper,
            shape: RoundedRectangleBorder(
              borderRadius:
                  BorderRadius.circular(PkSpace.radiusCard),
              side: BorderSide(color: t.line),
            ),
          );
        },
      );
    },
  );
}

/// Confirm dialog with cancel + confirm actions (Alert.alert parity).
Future<void> showPkConfirm(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  required VoidCallback onConfirm,
  String? cancelLabel,
  List<({String label, VoidCallback onTap})>? extraActions,
}) {
  return showDialog<void>(
    context: context,
    builder: (context) {
      final t = context.tokens;
      final type = context.type;
      return Consumer(
        builder: (context, ref, _) {
          final tr = ref.watch(tProvider);
          return AlertDialog(
            title: Text(title),
            content: Text(message, style: type.bodySm),
            actions: [
              PkButton(
                title: cancelLabel ?? tr('common.cancel'),
                onPress: () => Navigator.of(context).pop(),
                variant: PkButtonVariant.ghost,
                size: PkButtonSize.sm,
              ),
              if (extraActions != null)
                for (final action in extraActions)
                  PkButton(
                    title: action.label,
                    onPress: () {
                      Navigator.of(context).pop();
                      action.onTap();
                    },
                    variant: PkButtonVariant.outline,
                    size: PkButtonSize.sm,
                  ),
              PkButton(
                title: confirmLabel,
                onPress: () {
                  Navigator.of(context).pop();
                  onConfirm();
                },
                size: PkButtonSize.sm,
              ),
            ],
            backgroundColor: t.paper,
            shape: RoundedRectangleBorder(
              borderRadius:
                  BorderRadius.circular(PkSpace.radiusCard),
              side: BorderSide(color: t.line),
            ),
          );
        },
      );
    },
  );
}
