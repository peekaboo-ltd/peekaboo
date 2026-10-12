import 'package:flutter/material.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';

/// Status meaning ported from client/src/components/inputs/StatusBadge.tsx.
enum PkBadgeKind { active, completed, pending, failed, inactive }

const _completedStatuses = {
  'COMPLETED',
  'ACCEPTED',
  'DELIVERED',
  'PAID',
  'PAYMENT_DEFERRED',
  'SUCCESSFUL',
};
const _pendingStatuses = {'CONFIRMED', 'PENDING', 'WAITING', 'PROCESSING'};
const _activeStatuses = {'IN_TRANSIT', 'IN_PROGRESS', 'ASSIGNED', 'ACTIVE'};
const _failedStatuses = {'CANCELLED', 'REJECTED', 'FAILED'};

/// Shared status map covering assignment and order statuses, so the list
/// card, detail screen, and activity feed render the same chips.
PkBadgeKind statusKind(String? status) {
  if (status == null || status.isEmpty) return PkBadgeKind.inactive;
  if (_completedStatuses.contains(status)) return PkBadgeKind.completed;
  if (_pendingStatuses.contains(status)) return PkBadgeKind.pending;
  if (_activeStatuses.contains(status)) return PkBadgeKind.active;
  if (_failedStatuses.contains(status)) return PkBadgeKind.failed;
  return PkBadgeKind.inactive;
}

/// Translated status label (`status.*` keys shared with the client).
String statusLabel(Translate t, String? status) {
  return t('status.${(status ?? 'inactive').toLowerCase()}');
}

/// Status pill matching the client's StatusBadge: 24px pill, 10px side
/// padding, 12/500 text, 12px icon. Color marks resolved/failed/waiting;
/// active stays ink; every treatment keeps icon + label.
class PkBadge extends StatelessWidget {
  final String text;
  final PkBadgeKind kind;

  const PkBadge({super.key, required this.text, required this.kind});

  /// Badge for a raw API status code (assignment or order).
  factory PkBadge.status(String? code, Translate t) {
    return PkBadge(text: statusLabel(t, code), kind: statusKind(code));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;

    final IconData icon;
    Color fill;
    Color edge;
    Color fg;

    switch (kind) {
      case PkBadgeKind.active:
        icon = Icons.autorenew;
        fill = t.ink;
        edge = Colors.transparent;
        fg = t.paper;
      case PkBadgeKind.completed:
        icon = Icons.check;
        fill = t.approve.surface;
        edge = t.approve.line;
        fg = t.approve.main;
      case PkBadgeKind.pending:
        icon = Icons.schedule;
        fill = t.warning.surface;
        edge = t.warning.line;
        fg = t.warning.main;
      case PkBadgeKind.failed:
        icon = Icons.close;
        fill = t.danger.surface;
        edge = t.danger.line;
        fg = t.danger.main;
      case PkBadgeKind.inactive:
        icon = Icons.circle_outlined;
        fill = t.surface;
        edge = Colors.transparent;
        fg = t.muted;
    }

    return Container(
      height: 24,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(PkSpace.radiusPill),
        border: Border.all(color: edge),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontFamily: PkType.family,
              fontWeight: PkType.medium,
              fontSize: 12,
              height: 1.4,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
