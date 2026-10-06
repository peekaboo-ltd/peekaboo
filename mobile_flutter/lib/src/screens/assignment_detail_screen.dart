import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../models/assignment.dart';
import '../models/order.dart';
import '../state/assignments_state.dart';
import '../theme/tokens.dart';
import '../widgets/assignment_actions.dart';
import '../widgets/assignment_details.dart';
import '../widgets/dialogs.dart';
import '../widgets/error_view.dart';
import '../widgets/pk_card.dart';
import '../widgets/pk_text_field.dart';

/// Assignment detail screen ported from mobile/app/assignment/[id].tsx.
class AssignmentDetailScreen extends ConsumerStatefulWidget {
  final String id;

  const AssignmentDetailScreen({super.key, required this.id});

  @override
  ConsumerState<AssignmentDetailScreen> createState() =>
      _AssignmentDetailScreenState();
}

class _AssignmentDetailScreenState
    extends ConsumerState<AssignmentDetailScreen> {
  bool _actionLoading = false;
  final _tracking = TextEditingController();
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(assignmentsProvider.notifier).fetchById(widget.id);
    });
  }

  @override
  void dispose() {
    _tracking.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _refresh() {
    ref.read(assignmentsProvider.notifier).fetchById(widget.id);
  }

  Future<void> _accept(Translate tr) async {
    setState(() => _actionLoading = true);
    final ok =
        await ref.read(assignmentsProvider.notifier).accept(widget.id);
    if (!mounted) return;
    setState(() => _actionLoading = false);
    if (ok) {
      _refresh();
      await showPkAlert(
        context,
        title: tr('assignmentDetail.acceptedTitle'),
        message: tr('assignmentDetail.acceptedMessage'),
      );
    } else {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignments.acceptFailed');
      await showPkAlert(
        context,
        title: tr('common.error'),
        message: message,
      );
    }
  }

  Future<void> _reject(Translate tr) async {
    setState(() => _actionLoading = true);
    final ok =
        await ref.read(assignmentsProvider.notifier).reject(widget.id);
    if (!mounted) return;
    setState(() => _actionLoading = false);
    if (ok) {
      await showPkAlert(
        context,
        title: tr('assignmentDetail.rejectedTitle'),
        message: tr('assignmentDetail.rejectedMessage'),
        onOk: () => context.pop(),
      );
    } else {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignments.rejectFailed');
      await showPkAlert(
        context,
        title: tr('common.error'),
        message: message,
      );
    }
  }

  Future<void> _confirmDispatch(String orderId, Translate tr) async {
    setState(() => _actionLoading = true);
    final ok = await ref
        .read(assignmentsProvider.notifier)
        .confirmDispatch(orderId);
    if (!mounted) return;
    setState(() => _actionLoading = false);
    if (ok) {
      _refresh();
      await showPkAlert(
        context,
        title: tr('assignmentDetail.transitTitle'),
        message: tr('assignmentDetail.transitMessage'),
      );
    } else {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignmentDetail.confirmDispatchFailed');
      await showPkAlert(
        context,
        title: tr('common.error'),
        message: message,
      );
    }
  }

  Future<void> _recover(Translate tr) async {
    setState(() => _actionLoading = true);
    final ok =
        await ref.read(assignmentsProvider.notifier).recover(widget.id);
    if (!mounted) return;
    setState(() => _actionLoading = false);
    if (ok) {
      _refresh();
      await showPkAlert(
        context,
        title: tr('assignmentDetail.recoveredTitle'),
        message: tr('assignmentDetail.recoveredMessage'),
      );
    } else {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignmentDetail.recoverFailed');
      await showPkAlert(
        context,
        title: tr('assignmentDetail.unableRecover'),
        message: message,
      );
      _refresh();
    }
  }

  Future<void> _complete(String orderId, Translate tr) async {
    final entered = _tracking.text.trim();
    if (entered.isEmpty) {
      await showPkAlert(
        context,
        title: tr('assignmentDetail.otpRequiredTitle'),
        message: tr('assignmentDetail.otpRequiredMessage'),
      );
      return;
    }
    setState(() => _actionLoading = true);
    final ok = await ref
        .read(assignmentsProvider.notifier)
        .completeOrder(orderId, entered);
    if (!mounted) return;
    setState(() => _actionLoading = false);
    if (ok) {
      _refresh();
      await showPkAlert(
        context,
        title: tr('assignmentDetail.completedTitle'),
        message: tr('assignmentDetail.completedMessage'),
      );
    } else {
      final message = ref.read(assignmentsProvider).error ??
          tr('assignmentDetail.completeFailed');
      await showPkAlert(
        context,
        title: tr('common.error'),
        message: message,
      );
      _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final type = context.type;
    final tr = ref.watch(tProvider);
    final state = ref.watch(assignmentsProvider);
    final selected = state.selected;

    if (state.isLoading && selected == null) {
      return Scaffold(
        appBar: AppBar(title: Text(tr('assignmentDetail.loadingTitle'))),
        body: const AssignmentDetailsSkeleton(),
      );
    }

    if (selected == null) {
      return Scaffold(
        appBar: AppBar(title: Text(tr('assignmentDetail.notFound'))),
        body: Center(
          child: Text(tr('assignmentDetail.notFound'), style: type.body),
        ),
      );
    }

    final latest = selected.order?.latestStatus;
    final isActive = selected.status == AssignmentStatus.active;
    final canConfirm = isActive && latest == OrderStatus.accepted;
    final canComplete = isActive &&
        (latest == OrderStatus.inTransit || latest == OrderStatus.delivered);
    final title = selected.order != null &&
            selected.order!.referenceId.isNotEmpty
        ? 'Order #${selected.order!.referenceId}'
        : tr('assignmentDetail.title');

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scroll,
              padding: const EdgeInsets.all(PkSpace.s16),
              child: Column(
                children: [
                  AssignmentDetails(assignment: selected),
                  if (canComplete) ...[
                    const SizedBox(height: PkSpace.s16),
                    PkCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tr('assignmentDetail.completeVerification'),
                            style: type.label,
                          ),
                          const SizedBox(height: PkSpace.s8),
                          PkTextField(
                            controller: _tracking,
                            placeholder: tr('assignmentDetail.enterOtp'),
                            keyboardType: TextInputType.number,
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          AssignmentActions(
            status: selected.status,
            showConfirmDispatch: canConfirm,
            onAccept: () => _accept(tr),
            onReject: () => _reject(tr),
            onRecover: selected.status == AssignmentStatus.rejected
                ? () => _recover(tr)
                : null,
            onConfirmDispatch: canConfirm
                ? () => _confirmDispatch(selected.orderId, tr)
                : null,
            onComplete:
                canComplete ? () => _complete(selected.orderId, tr) : null,
            isLoading: _actionLoading,
          ),
        ],
      ),
    );
  }
}
