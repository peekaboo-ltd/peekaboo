import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../models/order.dart';
import '../theme/tokens.dart';
import '../utils/formatters.dart';

enum TrailStepState { done, current, upcoming }

class TrailStep {
  final String key;
  final String label;
  final String? description;
  final IconData? icon;
  final String? timestamp;
  final TrailStepState state;

  const TrailStep({
    required this.key,
    required this.label,
    this.description,
    this.icon,
    this.timestamp,
    required this.state,
  });
}

int _orderRank(OrderStatus? status) {
  switch (status) {
    case OrderStatus.draft:
      return 0;
    case OrderStatus.created:
      return 1;
    case OrderStatus.pending:
      return 2;
    case OrderStatus.paid:
      return 3;
    case OrderStatus.confirmed:
      return 4;
    case OrderStatus.accepted:
      return 5;
    case OrderStatus.active:
      return 6;
    case OrderStatus.inTransit:
      return 7;
    case OrderStatus.delivered:
      return 8;
    case OrderStatus.completed:
      return 9;
    case OrderStatus.cancelled:
    case null:
      return -1;
  }
}

String? _stepTimestamp(
    Order order, Set<OrderStatus> matches, Translate t) {
  final hits = (order.activities ?? [])
      .where((a) => a.status != null && matches.contains(a.status))
      .toList()
    ..sort((a, b) => (DateTime.tryParse(b.createdAt)?.millisecondsSinceEpoch ??
            0) -
        (DateTime.tryParse(a.createdAt)?.millisecondsSinceEpoch ?? 0));
  if (hits.isEmpty) return null;
  return formatSmartDate(hits.first.createdAt, t);
}

/// Order progress as trail steps: accepted, then confirmed/in transit, then
/// completed — with the "Now" pill on the current step.
List<TrailStep> orderProgressSteps(Order order, Translate t) {
  final rank = _orderRank(order.latestStatus);
  final cancelled = order.latestStatus == OrderStatus.cancelled;
  const thresholds = [5, 7, 9];
  final currentIndex = thresholds.indexWhere((th) => rank <= th);
  TrailStepState stateAt(int i) {
    if (cancelled) return TrailStepState.upcoming;
    if (currentIndex == -1) return TrailStepState.done;
    if (i < currentIndex) return TrailStepState.done;
    if (i == currentIndex) return TrailStepState.current;
    return TrailStepState.upcoming;
  }

  return [
    TrailStep(
      key: 'accepted',
      label: t('status.accepted'),
      timestamp: _stepTimestamp(order, {OrderStatus.accepted}, t),
      state: stateAt(0),
    ),
    TrailStep(
      key: 'transit',
      label: t('status.in_transit'),
      timestamp: _stepTimestamp(
        order,
        {OrderStatus.confirmed, OrderStatus.inTransit},
        t,
      ),
      state: stateAt(1),
    ),
    TrailStep(
      key: 'completed',
      label: t('status.completed'),
      timestamp: _stepTimestamp(
        order,
        {OrderStatus.completed, OrderStatus.delivered},
        t,
      ),
      state: stateAt(2),
    ),
  ];
}

/// Vertical milestone rail ported from client/src/components/orders/StepTrail.
/// State rides on fill, border style, and glyph — never color alone. The
/// current step carries a "Now" pill; timestamps arrive pre-formatted.
class StepTrail extends ConsumerWidget {
  final List<TrailStep> steps;
  final String label;

  const StepTrail({super.key, required this.steps, required this.label});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tr = ref.watch(tProvider);

    return Semantics(
      label: label,
      child: Column(
        children: [
          for (var i = 0; i < steps.length; i++)
            _StepRow(
              step: steps[i],
              isLast: i == steps.length - 1,
              nowLabel: tr('common.now'),
            ),
        ],
      ),
    );
  }
}

class _StepRow extends StatelessWidget {
  final TrailStep step;
  final bool isLast;
  final String nowLabel;

  const _StepRow({
    required this.step,
    required this.isLast,
    required this.nowLabel,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final done = step.state == TrailStepState.done;
    final current = step.state == TrailStepState.current;

    Color markerFill;
    Color markerEdge;
    Color markerFg;
    if (current) {
      markerFill = t.ink;
      markerEdge = t.ink;
      markerFg = t.paper;
    } else if (done) {
      markerFill = t.paper;
      markerEdge = t.ink;
      markerFg = t.ink;
    } else {
      markerFill = t.paper;
      markerEdge = t.lineStrong;
      markerFg = t.muted;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 32,
          child: Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: markerFill,
                  border: Border.all(color: markerEdge),
                ),
                child: Icon(
                  done
                      ? Icons.check
                      : (step.icon ?? Icons.circle),
                  size: done || current ? 14 : 8,
                  color: markerFg,
                ),
              ),
              if (!isLast)
                Container(
                  width: 1,
                  height: 20,
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  color: done ? t.ink : t.line,
                ),
            ],
          ),
        ),
        const SizedBox(width: PkSpace.s16),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : PkSpace.s20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step.label,
                        style: done || current
                            ? type.label
                            : type.bodySm.copyWith(color: t.muted),
                      ),
                      if (step.description != null) ...[
                        const SizedBox(height: 2),
                        Text(step.description!, style: type.meta),
                      ],
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (current)
                      Container(
                        height: 24,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: t.ink,
                          borderRadius: BorderRadius.circular(
                            PkSpace.radiusPill,
                          ),
                        ),
                        child: Text(
                          nowLabel,
                          style: type.meta.copyWith(
                            color: t.paper,
                            fontWeight: PkType.medium,
                          ),
                        ),
                      ),
                    if (step.timestamp != null) ...[
                      const SizedBox(height: 4),
                      Text(step.timestamp!, style: type.meta),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
