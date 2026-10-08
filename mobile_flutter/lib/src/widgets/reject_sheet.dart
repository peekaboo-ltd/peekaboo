import 'package:flutter/material.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import 'pk_button.dart';
import 'pk_text_field.dart';

/// Reject bottom sheet with an optional reason field. Returns the typed
/// reason, or null when the rider cancels. Callers treat a blank reason
/// as "no reason" before sending it to the API.
Future<String?> showRejectSheet(BuildContext context, Translate tr) {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    builder: (_) => _RejectSheet(tr: tr),
  );
}

class _RejectSheet extends StatefulWidget {
  final Translate tr;

  const _RejectSheet({required this.tr});

  @override
  State<_RejectSheet> createState() => _RejectSheetState();
}

class _RejectSheetState extends State<_RejectSheet> {
  final _reason = TextEditingController();

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = widget.tr;
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: PkSpace.s16,
          right: PkSpace.s16,
          top: PkSpace.s12,
          bottom: MediaQuery.of(context).viewInsets.bottom + PkSpace.s24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: t.line,
                  borderRadius: BorderRadius.circular(PkSpace.radiusPill),
                ),
              ),
            ),
            const SizedBox(height: PkSpace.s16),
            Text(
              tr('assignmentActions.rejectTitle'),
              style: type.cardTitle,
            ),
            const SizedBox(height: PkSpace.s4),
            Text(
              tr('assignmentActions.rejectMessage'),
              style: type.bodySm.copyWith(color: t.muted),
            ),
            const SizedBox(height: PkSpace.s16),
            PkTextField(
              controller: _reason,
              label: tr('assignmentActions.rejectReasonLabel'),
              placeholder:
                  tr('assignmentActions.rejectReasonPlaceholder'),
              minLines: 3,
              maxLines: 5,
            ),
            const SizedBox(height: PkSpace.s16),
            Row(
              children: [
                Expanded(
                  child: PkButton(
                    title: tr('common.cancel'),
                    onPress: () => Navigator.of(context).pop(),
                    variant: PkButtonVariant.ghost,
                  ),
                ),
                const SizedBox(width: PkSpace.s12),
                Expanded(
                  child: PkButton(
                    title: tr('assignment.reject'),
                    onPress: () =>
                        Navigator.of(context).pop(_reason.text),
                    variant: PkButtonVariant.destructive,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
