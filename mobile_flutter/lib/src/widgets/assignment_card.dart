import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../models/assignment.dart';
import '../models/order.dart';
import '../theme/tokens.dart';
import '../utils/formatters.dart';
import 'pk_badge.dart';
import 'pk_button.dart';
import 'pk_card.dart';

String assignmentStatusLabel(AssignmentStatus status, Translate t) {
  return switch (status) {
    AssignmentStatus.pending => t('assignment.pending'),
    AssignmentStatus.active => t('assignment.active'),
    AssignmentStatus.completed => t('assignment.completed'),
    AssignmentStatus.rejected => t('assignment.rejected'),
    AssignmentStatus.cancelled => t('assignment.cancelled'),
  };
}

/// Assignment queue row ported from AssignmentCard.tsx.
class AssignmentCard extends ConsumerWidget {
  final Assignment assignment;
  final VoidCallback onPress;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;
  final bool isLoading;

  const AssignmentCard({
    super.key,
    required this.assignment,
    required this.onPress,
    this.onAccept,
    this.onReject,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final a = assignment;
    final order = a.order;
    final isPending = a.status == AssignmentStatus.pending;

    return PkCard(
      onPress: onPress,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tr('assignment.order'), style: type.meta),
                    Text(
                      order?.referenceId.isNotEmpty == true
                          ? formatOrderRef(order!.referenceId)
                          : '#${a.id.length > 8 ? a.id.substring(0, 8) : a.id}',
                      style: type.cardTitle,
                    ),
                    const SizedBox(height: PkSpace.s8),
                    Row(
                      children: [
                        PkBadge.assignment(
                          a.status,
                          assignmentStatusLabel(a.status, tr),
                        ),
                        if (order?.latestStatus != null) ...[
                          const SizedBox(width: PkSpace.s8),
                          Flexible(
                            child: Text(
                              orderStatusLabel(order!.latestStatus),
                              style: type.meta,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Text(formatSmartDate(a.createdAt), style: type.meta),
            ],
          ),
          if (order != null) ...[
            const SizedBox(height: PkSpace.s12),
            _LocationRow(label: tr('assignment.pickupLocation')),
            Container(
              width: 1,
              height: 12,
              margin: const EdgeInsets.only(left: 4),
              color: t.lineStrong,
            ),
            _LocationRow(label: tr('assignment.deliveryLocation')),
            if (order.finalFee != null) ...[
              const SizedBox(height: PkSpace.s8),
              Row(
                children: [
                  Icon(Icons.payments_outlined, size: 16, color: t.ink),
                  const SizedBox(width: PkSpace.s4),
                  Text(
                    formatCurrency(order.finalFee),
                    style: type.tabular(type.label),
                  ),
                ],
              ),
            ],
          ],
          if (a.description != null && a.description!.isNotEmpty) ...[
            const SizedBox(height: PkSpace.s8),
            Text(
              a.description!,
              style: type.bodySm.copyWith(color: t.muted),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (isPending && (onAccept != null || onReject != null)) ...[
            const SizedBox(height: PkSpace.s12),
            Row(
              children: [
                if (onReject != null)
                  Expanded(
                    child: PkButton(
                      title: tr('assignment.reject'),
                      onPress: onReject,
                      variant: PkButtonVariant.outline,
                      size: PkButtonSize.sm,
                      disabled: isLoading,
                    ),
                  ),
                if (onReject != null && onAccept != null)
                  const SizedBox(width: PkSpace.s8),
                if (onAccept != null)
                  Expanded(
                    flex: 2,
                    child: PkButton(
                      title: tr('assignment.accept'),
                      onPress: onAccept,
                      size: PkButtonSize.sm,
                      loading: isLoading,
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _LocationRow extends StatelessWidget {
  final String label;

  const _LocationRow({required this.label});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Row(
      children: [
        Container(
          width: 9,
          height: 9,
          decoration: BoxDecoration(shape: BoxShape.circle, color: t.ink),
        ),
        const SizedBox(width: PkSpace.s8),
        Expanded(
          child: Text(
            label,
            style: context.type.bodySm,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
