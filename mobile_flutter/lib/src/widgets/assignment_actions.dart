import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../models/assignment.dart';
import '../theme/tokens.dart';
import 'dialogs.dart';
import 'pk_button.dart';

/// Detail-screen action footer ported from AssignmentActions.tsx.
/// Reject is outline (destructive by copy, not hue); everything else primary.
class AssignmentActions extends ConsumerWidget {
  final AssignmentStatus status;
  final bool showConfirmDispatch;
  final VoidCallback onAccept;
  final VoidCallback onReject;
  final VoidCallback? onRecover;
  final VoidCallback? onConfirmDispatch;
  final VoidCallback? onComplete;
  final bool isLoading;

  const AssignmentActions({
    super.key,
    required this.status,
    this.showConfirmDispatch = false,
    required this.onAccept,
    required this.onReject,
    this.onRecover,
    this.onConfirmDispatch,
    this.onComplete,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final tr = ref.watch(tProvider);

    Widget footer(List<Widget> children, {bool row = false}) {
      return Container(
        padding: const EdgeInsets.fromLTRB(
          PkSpace.s16,
          PkSpace.s16,
          PkSpace.s16,
          PkSpace.s24,
        ),
        decoration: BoxDecoration(
          color: t.paper,
          border: Border(top: BorderSide(color: t.line)),
        ),
        child: row
            ? Row(
                children: [
                  for (var i = 0; i < children.length; i++) ...[
                    if (i > 0) const SizedBox(width: PkSpace.s16),
                    Expanded(
                      flex: i == children.length - 1 &&
                              children.length == 2
                          ? 3
                          : 2,
                      child: children[i],
                    ),
                  ],
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (var i = 0; i < children.length; i++) ...[
                    if (i > 0) const SizedBox(height: PkSpace.s16),
                    children[i],
                  ],
                ],
              ),
      );
    }

    if (status == AssignmentStatus.pending) {
      return footer(
        [
          PkButton(
            title: tr('assignment.reject'),
            onPress: () => showPkConfirm(
              context,
              title: tr('assignmentActions.rejectTitle'),
              message: tr('assignmentActions.rejectMessage'),
              confirmLabel: tr('assignment.reject'),
              onConfirm: onReject,
            ),
            variant: PkButtonVariant.outline,
            disabled: isLoading,
          ),
          PkButton(
            title: tr('assignment.acceptAssignment'),
            onPress: onAccept,
            loading: isLoading,
          ),
        ],
        row: true,
      );
    }

    if (status == AssignmentStatus.active &&
        (showConfirmDispatch || onComplete != null)) {
      return footer([
        if (showConfirmDispatch && onConfirmDispatch != null)
          PkButton(
            title: tr('assignments.confirmTransit'),
            onPress: () => showPkConfirm(
              context,
              title: tr('assignments.confirmTransit'),
              message: tr('assignments.confirmTransitMessage'),
              confirmLabel: tr('assignments.confirmTransit'),
              onConfirm: onConfirmDispatch!,
            ),
            loading: isLoading,
            fullWidth: true,
          ),
        if (onComplete != null)
          PkButton(
            title: tr('assignmentActions.markCompleted'),
            onPress: () => showPkConfirm(
              context,
              title: tr('assignmentActions.completeTitle'),
              message: tr('assignmentActions.completeMessage'),
              confirmLabel: tr('assignments.completed'),
              onConfirm: onComplete!,
            ),
            loading: isLoading,
            fullWidth: true,
          ),
      ]);
    }

    if (status == AssignmentStatus.rejected && onRecover != null) {
      return footer([
        PkButton(
          title: tr('assignmentActions.recoverAssignment'),
          onPress: () => showPkConfirm(
            context,
            title: tr('assignmentActions.recoverTitle'),
            message: tr('assignmentActions.recoverMessage'),
            confirmLabel: tr('assignmentActions.recover'),
            onConfirm: onRecover!,
          ),
          loading: isLoading,
          fullWidth: true,
        ),
      ]);
    }

    return const SizedBox.shrink();
  }
}
