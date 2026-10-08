import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'pk_button.dart';
import 'pk_card.dart';

/// Inline error card: icon + copy, no colored variants (toast rule, §6.4).
class ErrorView extends StatelessWidget {
  final String message;
  final String retryLabel;
  final VoidCallback onRetry;

  const ErrorView({
    super.key,
    required this.message,
    required this.retryLabel,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return PkCard(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.warning_outlined, size: 24, color: t.ink),
          const SizedBox(height: PkSpace.s8),
          Text(message, style: type.bodySm, textAlign: TextAlign.center),
          const SizedBox(height: PkSpace.s12),
          PkButton(
            title: retryLabel,
            onPress: onRetry,
            variant: PkButtonVariant.outline,
            size: PkButtonSize.sm,
          ),
        ],
      ),
    );
  }
}

/// Static loading placeholder blocks (surface fill, no shimmer animation).
class SkeletonBlock extends StatelessWidget {
  final double height;
  final double? width;
  final double radius;

  const SkeletonBlock({
    super.key,
    required this.height,
    this.width,
    this.radius = PkSpace.radiusCard,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: context.tokens.surface,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

class AssignmentSkeletonCard extends StatelessWidget {
  final bool compact;

  const AssignmentSkeletonCard({super.key, this.compact = false});

  @override
  Widget build(BuildContext context) {
    return PkCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SkeletonBlock(height: 16, width: 120, radius: 4),
              SkeletonBlock(height: 14, width: 80, radius: 4),
            ],
          ),
          const SizedBox(height: PkSpace.s12),
          const SkeletonBlock(height: 14, width: 180, radius: 4),
          const SizedBox(height: PkSpace.s8),
          const SkeletonBlock(height: 14, width: 140, radius: 4),
          if (!compact) ...[
            const SizedBox(height: PkSpace.s12),
            const SkeletonBlock(height: 36, radius: PkSpace.radiusControl),
          ],
        ],
      ),
    );
  }
}

class AssignmentDetailsSkeleton extends StatelessWidget {
  const AssignmentDetailsSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      padding: EdgeInsets.all(PkSpace.s16),
      child: Column(
        children: [
          SkeletonBlock(height: 180),
          SizedBox(height: PkSpace.s16),
          SkeletonBlock(height: 140),
          SizedBox(height: PkSpace.s16),
          SkeletonBlock(height: 160),
        ],
      ),
    );
  }
}
