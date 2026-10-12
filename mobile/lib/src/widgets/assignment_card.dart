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
                    Text(
                      order?.referenceId.isNotEmpty == true
                          ? formatOrderRef(order!.referenceId)
                          : '#${a.id.length > 8 ? a.id.substring(0, 8) : a.id}',
                      style: type.cardTitle,
                    ),
                    const SizedBox(height: PkSpace.s8),
                    Wrap(
                      spacing: PkSpace.s8,
                      runSpacing: PkSpace.s8,
                      children: [
                        PkBadge.status(
                          assignmentStatusToJson(a.status),
                          tr,
                        ),
                        if (order?.latestStatus != null)
                          PkBadge.status(
                            orderStatusToJson(order!.latestStatus!),
                            tr,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              Text(formatSmartDate(a.createdAt, tr), style: type.meta),
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
                      variant: PkButtonVariant.destructive,
                      size: PkButtonSize.sm,
                      disabled: isLoading,
                      icon: const Icon(Icons.close, size: 16),
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
                      variant: PkButtonVariant.approve,
                      size: PkButtonSize.sm,
                      loading: isLoading,
                      icon: const Icon(Icons.check, size: 16),
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
