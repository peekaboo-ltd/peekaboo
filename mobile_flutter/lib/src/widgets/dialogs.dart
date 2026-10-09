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

/// Toast matching the client's sonner style: paper ground, line edge,
/// 8px radius. Success and error take the outcome colors on the edge and
/// the text; the ground stays paper so the toast reads as part of the app.
enum PkSnackKind { info, success, error }

void showPkSnackBar(
  BuildContext context, {
  required String message,
  PkSnackKind kind = PkSnackKind.info,
}) {
  final t = context.tokens;
  final type = context.type;
  Color ground = t.paper;
  Color edge = t.line;
  var fg = t.ink;
  switch (kind) {
    case PkSnackKind.success:
      ground = t.approve.surface;
      edge = t.approve.line;
      fg = t.approve.main;
    case PkSnackKind.error:
      ground = t.danger.surface;
      edge = t.danger.line;
      fg = t.danger.main;
    case PkSnackKind.info:
      break;
  }
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        backgroundColor: ground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(PkSpace.radiusControl),
          side: BorderSide(color: edge),
        ),
        behavior: SnackBarBehavior.floating,
        content: Text(message, style: type.bodySm.copyWith(color: fg)),
      ),
    );
}

/// Confirm dialog with cancel + confirm actions (Alert.alert parity).
/// [confirmVariant] colors the commit by consequence: destructive (red-700)
/// for removals, approve (green-700) for confirmations.
Future<void> showPkConfirm(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  required VoidCallback onConfirm,
  String? cancelLabel,
  PkButtonVariant confirmVariant = PkButtonVariant.primary,
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
                variant: confirmVariant,
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
