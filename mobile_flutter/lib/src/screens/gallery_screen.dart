import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../models/assignment.dart';
import '../theme/tokens.dart';
import '../widgets/assignment_card.dart' show assignmentStatusLabel;
import '../widgets/pk_badge.dart';
import '../widgets/pk_button.dart';
import '../widgets/pk_card.dart';
import '../widgets/pk_text_field.dart';

/// Dev-only theme gallery for visual review of the DESIGN.md port.
/// Reachable at the `/gallery` route; not linked from any production UI.
class GalleryScreen extends ConsumerStatefulWidget {
  const GalleryScreen({super.key});

  @override
  ConsumerState<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends ConsumerState<GalleryScreen> {
  bool _switch = true;

  @override
  Widget build(BuildContext context) {
    final type = context.type;
    final tr = ref.watch(tProvider);

    Widget section(String title, Widget child) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: type.eyebrow),
          const SizedBox(height: PkSpace.s8),
          child,
          const SizedBox(height: PkSpace.s24),
        ],
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Theme gallery (dev)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(PkSpace.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            section(
              'Type scale',
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Display 32', style: type.display),
                  Text('Heading 24', style: type.h2),
                  Text('Heading 20', style: type.h3),
                  Text('Page title 22', style: type.pageTitle),
                  Text('Card title 16', style: type.cardTitle),
                  Text('28 metric', style: type.metric),
                  Text('Body 16 — the quick brown fox', style: type.body),
                  Text('Body small 14 — UI default', style: type.bodySm),
                  Text('Label 14/500', style: type.label),
                  Text('Meta 13 muted', style: type.meta),
                  Text('Eyebrow 12 muted', style: type.eyebrow),
                ],
              ),
            ),
            section(
              'Buttons',
              const Wrap(
                spacing: PkSpace.s8,
                runSpacing: PkSpace.s8,
                children: [
                  PkButton(title: 'Primary', onPress: _noop),
                  PkButton(
                    title: 'Secondary',
                    onPress: _noop,
                    variant: PkButtonVariant.secondary,
                  ),
                  PkButton(
                    title: 'Outline',
                    onPress: _noop,
                    variant: PkButtonVariant.outline,
                  ),
                  PkButton(
                    title: 'Ghost',
                    onPress: _noop,
                    variant: PkButtonVariant.ghost,
                  ),
                  PkButton(
                    title: 'Small',
                    onPress: _noop,
                    size: PkButtonSize.sm,
                  ),
                  PkButton(
                    title: 'Large CTA',
                    onPress: _noop,
                    size: PkButtonSize.lg,
                  ),
                  PkButton(
                    title: 'Loading',
                    onPress: _noop,
                    loading: true,
                  ),
                  PkButton(
                    title: 'Disabled',
                    onPress: _noop,
                    disabled: true,
                  ),
                ],
              ),
            ),
            section(
              'Status badges',
              Wrap(
                spacing: PkSpace.s8,
                runSpacing: PkSpace.s8,
                children: [
                  for (final s in AssignmentStatus.values)
                    PkBadge.assignment(s, assignmentStatusLabel(s, tr)),
                ],
              ),
            ),
            section(
              'Cards',
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  PkCard(
                    onPress: _noop,
                    child: Text('Framed (default)', style: type.cardTitle),
                  ),
                  const SizedBox(height: PkSpace.s8),
                  PkCard(
                    variant: PkCardVariant.quiet,
                    child: Text('Quiet (stats)', style: type.cardTitle),
                  ),
                  const SizedBox(height: PkSpace.s8),
                  PkCard(
                    variant: PkCardVariant.inverted,
                    child: Text(
                      'Inverted (one per page)',
                      style: type.cardTitle,
                    ),
                  ),
                ],
              ),
            ),
            section(
              'Inputs',
              Column(
                children: [
                  const PkTextField(
                    label: 'Label',
                    placeholder: 'Placeholder',
                    helper: 'Helper text',
                  ),
                  const SizedBox(height: PkSpace.s12),
                  const PkTextField(
                    label: 'Error state',
                    placeholder: 'Value',
                    error: 'Error without color',
                  ),
                  const SizedBox(height: PkSpace.s12),
                  Row(
                    children: [
                      Text('Switch', style: type.label),
                      const Spacer(),
                      Switch(
                        value: _switch,
                        onChanged: (v) => setState(() => _switch = v),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

void _noop() {}
