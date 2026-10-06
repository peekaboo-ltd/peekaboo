import 'package:flutter/material.dart';

import '../models/assignment.dart';
import '../theme/tokens.dart';

/// Status chip implementing the DESIGN.md §2.2 shape + fill + icon system.
/// Every badge carries an icon and a text label; the treatment only reinforces.
enum PkBadgeKind { active, completed, pending, failed, draft }

class PkBadge extends StatelessWidget {
  final String text;
  final PkBadgeKind kind;
  final bool small;

  const PkBadge({
    super.key,
    required this.text,
    required this.kind,
    this.small = false,
  });

  /// Maps assignment statuses onto chip kinds (replaces the Expo
  /// success/warning/danger/info hue variants).
  factory PkBadge.assignment(AssignmentStatus status, String label) {
    return PkBadge(
      text: label,
      kind: switch (status) {
        AssignmentStatus.active => PkBadgeKind.active,
        AssignmentStatus.completed => PkBadgeKind.completed,
        AssignmentStatus.pending => PkBadgeKind.pending,
        AssignmentStatus.rejected => PkBadgeKind.failed,
        AssignmentStatus.cancelled => PkBadgeKind.failed,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;

    final IconData icon;
    Color fill = Colors.transparent;
    Color fg = t.ink;
    bool dashed = false;
    bool strikethrough = false;
    Border? border;

    switch (kind) {
      case PkBadgeKind.active:
        icon = Icons.play_arrow;
        fill = t.ink;
        fg = t.paper;
      case PkBadgeKind.completed:
        icon = Icons.check;
        fg = t.ink;
        border = Border.all(color: t.ink);
      case PkBadgeKind.pending:
        icon = Icons.schedule;
        fg = t.muted;
        dashed = true;
      case PkBadgeKind.failed:
        icon = Icons.close;
        fg = t.ink;
        strikethrough = true;
        border = Border.all(color: t.ink);
      case PkBadgeKind.draft:
        icon = Icons.circle_outlined;
        fill = t.surface;
        fg = t.muted;
    }

    final label = Text(
      text,
      style: (small ? type.meta : type.bodySm).copyWith(
        color: fg,
        fontWeight: PkType.medium,
        decoration: strikethrough ? TextDecoration.lineThrough : null,
      ),
    );

    final content = Container(
      height: small ? 24 : 28,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(PkSpace.radiusPill),
        border: dashed ? null : border,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 4),
          label,
        ],
      ),
    );

    if (!dashed) return content;
    return CustomPaint(
      painter: _DashedPillPainter(color: t.lineStrong),
      child: content,
    );
  }
}

/// Dashed pill outline for the pending treatment.
class _DashedPillPainter extends CustomPainter {
  final Color color;

  _DashedPillPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = RRect.fromRectAndRadius(
      Offset.zero & size,
      const Radius.circular(PkSpace.radiusPill),
    );
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    const dash = 4.0;
    const gap = 3.0;
    final path = Path()..addRRect(rrect);
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        final end = (distance + dash).clamp(0.0, metric.length);
        canvas.drawPath(metric.extractPath(distance, end), paint);
        distance = end + gap;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedPillPainter old) =>
      old.color != color;
}
