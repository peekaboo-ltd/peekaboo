import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import '../widgets/dialogs.dart';
import '../widgets/pk_button.dart';
import '../widgets/pk_card.dart';
import '../widgets/pk_icon_button.dart';

enum ReportCategory { problem, receipt }

enum ReportMediaType { image, video }

class ReportDraft {
  final String mediaUri;
  final ReportMediaType mediaType;
  final String timestamp;
  final String locationLabel;

  const ReportDraft({
    required this.mediaUri,
    required this.mediaType,
    required this.timestamp,
    required this.locationLabel,
  });
}

class ReportSubmissionPreview {
  final ReportCategory category;
  final String mediaUri;
  final ReportMediaType mediaType;
  final String description;
  final String timestamp;
  final String locationLabel;

  const ReportSubmissionPreview({
    required this.category,
    required this.mediaUri,
    required this.mediaType,
    required this.description,
    required this.timestamp,
    required this.locationLabel,
  });
}

/// Full-screen report flow ported from the dashboard report modal:
/// evidence preview with watermark + overlay, type chips, confirm step,
/// description form, then send.
class ReportSheet extends ConsumerStatefulWidget {
  /// Parent-owned draft; retakes replace `.value` and the sheet rebuilds.
  final ValueNotifier<ReportDraft> draftListenable;
  final Future<bool> Function(ReportCategory category, String description)
      onSend;
  final VoidCallback onRetake;
  final VoidCallback onClose;

  const ReportSheet({
    super.key,
    required this.draftListenable,
    required this.onSend,
    required this.onRetake,
    required this.onClose,
  });

  @override
  ConsumerState<ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends ConsumerState<ReportSheet> {
  ReportCategory? _category;
  bool _confirmed = false;
  bool _sending = false;
  final _description = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.draftListenable.addListener(_onDraftChanged);
  }

  void _onDraftChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    widget.draftListenable.removeListener(_onDraftChanged);
    _description.dispose();
    super.dispose();
  }

  void _confirm(Translate tr) {
    if (_category == null) {
      showPkAlert(
        context,
        title: tr('dashboard.reportTypeRequiredTitle'),
        message: tr('dashboard.reportTypeRequiredMessageContinue'),
      );
      return;
    }
    setState(() => _confirmed = true);
  }

  Future<void> _send(Translate tr) async {
    if (_category == null) {
      await showPkAlert(
        context,
        title: tr('dashboard.reportTypeRequiredTitle'),
        message: tr('dashboard.reportTypeRequiredMessageSend'),
      );
      return;
    }
    if (_description.text.trim().isEmpty) {
      await showPkAlert(
        context,
        title: tr('dashboard.reportDescriptionRequiredTitle'),
        message: tr('dashboard.reportDescriptionRequiredMessage'),
      );
      return;
    }
    setState(() => _sending = true);
    try {
      final ok = await widget.onSend(_category!, _description.text.trim());
      if (!mounted) return;
      if (!ok) {
        await showPkAlert(
          context,
          title: tr('dashboard.reportSendFailedTitle'),
          message: tr('dashboard.reportSendFailedMessage'),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final draft = widget.draftListenable.value;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('dashboard.reportModalTitle')),
        leading: IconButton(
          onPressed: _sending ? null : widget.onClose,
          icon: const Icon(Icons.close),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(PkSpace.s16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(
                          PkSpace.radiusCard,
                        ),
                        child: draft.mediaType == ReportMediaType.image
                            ? Image.file(
                                File(draft.mediaUri),
                                height: 280,
                                width: double.infinity,
                                fit: BoxFit.cover,
                              )
                            : Container(
                                height: 280,
                                width: double.infinity,
                                color: t.ink,
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Image.asset(
                                      'assets/images/peekaboo-watermark.jpeg',
                                      height: 72,
                                    ),
                                    const SizedBox(height: PkSpace.s8),
                                    Icon(
                                      Icons.videocam,
                                      size: 48,
                                      color: t.paper,
                                    ),
                                    Text(
                                      tr('dashboard.reportVideoCaptured'),
                                      style: type.bodySm.copyWith(
                                        color: t.paper,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                      ),
                      Positioned(
                        right: PkSpace.s8,
                        top: PkSpace.s8,
                        child: Image.asset(
                          'assets/images/peekaboo-watermark.jpeg',
                          height: 40,
                        ),
                      ),
                      Positioned(
                        left: PkSpace.s8,
                        bottom: PkSpace.s8,
                        right: PkSpace.s8,
                        child: Container(
                          padding: const EdgeInsets.all(PkSpace.s8),
                          decoration: BoxDecoration(
                            color: t.ink,
                            borderRadius: BorderRadius.circular(
                              PkSpace.radiusPill,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${tr('dashboard.reportTimestamp')}: ${draft.timestamp}',
                                style:
                                    type.meta.copyWith(color: t.paper),
                              ),
                              Text(
                                '${tr('dashboard.reportLocation')}: ${draft.locationLabel.isEmpty ? tr('dashboard.reportLocationUnavailable') : draft.locationLabel}',
                                style:
                                    type.meta.copyWith(color: t.paper),
                              ),
                              Text(
                                '${tr('dashboard.reportType')}: ${draft.mediaType == ReportMediaType.video ? tr('dashboard.mediaVideo') : tr('dashboard.mediaPhoto')}',
                                style:
                                    type.meta.copyWith(color: t.paper),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: PkSpace.s16),
                  Text(tr('dashboard.reportChooseType'), style: type.label),
                  const SizedBox(height: PkSpace.s8),
                  Row(
                    children: [
                      Expanded(
                        child: _TypeChip(
                          label: tr('dashboard.reportProblem'),
                          selected:
                              _category == ReportCategory.problem,
                          onTap: _sending
                              ? null
                              : () => setState(() => _category =
                                  ReportCategory.problem),
                        ),
                      ),
                      const SizedBox(width: PkSpace.s8),
                      Expanded(
                        child: _TypeChip(
                          label: tr('dashboard.reportReceipt'),
                          selected:
                              _category == ReportCategory.receipt,
                          onTap: _sending
                              ? null
                              : () => setState(() => _category =
                                  ReportCategory.receipt),
                        ),
                      ),
                    ],
                  ),
                  if (_confirmed) ...[
                    const SizedBox(height: PkSpace.s16),
                    Text(
                      tr('dashboard.reportDescription'),
                      style: type.label,
                    ),
                    const SizedBox(height: PkSpace.s8),
                    TextField(
                      controller: _description,
                      enabled: !_sending,
                      minLines: 3,
                      maxLines: 6,
                      style: type.bodySm,
                      decoration: InputDecoration(
                        hintText: _category == ReportCategory.receipt
                            ? tr('dashboard.reportDescribeReceipt')
                            : tr('dashboard.reportDescribeProblem'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(PkSpace.s16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: t.line)),
            ),
            child: _confirmed
                ? PkButton(
                    title: tr('dashboard.reportSend'),
                    onPress: () => _send(tr),
                    fullWidth: true,
                    loading: _sending,
                    disabled: _sending,
                    icon: Icon(Icons.send, size: 16, color: t.paper),
                  )
                : Row(
                    children: [
                      PkIconButton(
                        icon: Icons.replay,
                        tooltip: tr('dashboard.reportRetake'),
                        variant: PkIconButtonVariant.outline,
                        size: PkIconButtonSize.lg,
                        onPress: _sending ? null : widget.onRetake,
                      ),
                      const SizedBox(width: PkSpace.s8),
                      Expanded(
                        child: PkButton(
                          title: tr('dashboard.reportConfirm'),
                          onPress: () => _confirm(tr),
                          variant: PkButtonVariant.approve,
                          size: PkButtonSize.lg,
                          disabled:
                              _category == null || _sending,
                          icon: const Icon(Icons.check, size: 16),
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback? onTap;

  const _TypeChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: PkMotion.durState,
        curve: PkMotion.easeFlat,
        height: PkSpace.controlMd,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? t.ink : Colors.transparent,
          borderRadius:
              BorderRadius.circular(PkSpace.radiusControl),
          border: Border.all(color: selected ? t.ink : t.line),
        ),
        child: Text(
          label,
          style: type.label.copyWith(
            color: selected ? t.paper : t.ink,
          ),
        ),
      ),
    );
  }
}

/// Post-submit receipt preview (reportSubmissionPreview modal parity).
class SubmissionPreviewSheet extends ConsumerWidget {
  final ReportSubmissionPreview preview;

  const SubmissionPreviewSheet({super.key, required this.preview});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final p = preview;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('dashboard.reportSubmitted')),
        leading: IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.close),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(PkSpace.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (p.mediaType == ReportMediaType.image)
              Stack(
                children: [
                  ClipRRect(
                    borderRadius:
                        BorderRadius.circular(PkSpace.radiusCard),
                    child: Image.file(
                      File(p.mediaUri),
                      height: 280,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    right: PkSpace.s8,
                    top: PkSpace.s8,
                    child: Image.asset(
                      'assets/images/peekaboo-watermark.jpeg',
                      height: 40,
                    ),
                  ),
                  Positioned(
                    left: PkSpace.s8,
                    bottom: PkSpace.s8,
                    right: PkSpace.s8,
                    child: Container(
                      padding: const EdgeInsets.all(PkSpace.s8),
                      decoration: BoxDecoration(
                        color: t.ink,
                        borderRadius: BorderRadius.circular(
                          PkSpace.radiusPill,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${tr('dashboard.reportTimestamp')}: ${p.timestamp}',
                            style: type.meta.copyWith(color: t.paper),
                          ),
                          Text(
                            '${tr('dashboard.reportLocation')}: ${p.locationLabel}',
                            style: type.meta.copyWith(color: t.paper),
                          ),
                          Text(
                            '${tr('dashboard.reportType')}: ${tr('dashboard.mediaPhoto')}',
                            style: type.meta.copyWith(color: t.paper),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              )
            else
              Container(
                height: 280,
                decoration: BoxDecoration(
                  color: t.ink,
                  borderRadius:
                      BorderRadius.circular(PkSpace.radiusCard),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      'assets/images/peekaboo-watermark.jpeg',
                      height: 72,
                    ),
                    const SizedBox(height: PkSpace.s8),
                    Icon(Icons.videocam, size: 56, color: t.paper),
                    Text(
                      tr('dashboard.reportVideoEvidenceSubmitted'),
                      style: type.bodySm.copyWith(color: t.paper),
                    ),
                    Text(
                      '${tr('dashboard.reportTimestamp')}: ${p.timestamp}',
                      style: type.meta.copyWith(color: t.paper),
                    ),
                    Text(
                      '${tr('dashboard.reportLocation')}: ${p.locationLabel}',
                      style: type.meta.copyWith(color: t.paper),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: PkSpace.s16),
            PkCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tr('dashboard.reportType'), style: type.label),
                  Text(
                    p.category == ReportCategory.receipt
                        ? tr('dashboard.reportReceipt')
                        : tr('dashboard.reportProblem'),
                    style: type.bodySm,
                  ),
                  const SizedBox(height: PkSpace.s12),
                  Text(
                    tr('dashboard.reportDescription'),
                    style: type.label,
                  ),
                  Text(
                    p.description.isEmpty
                        ? tr('dashboard.reportNoDescription')
                        : p.description,
                    style: type.bodySm,
                  ),
                ],
              ),
            ),
            const SizedBox(height: PkSpace.s16),
            PkButton(
              title: tr('dashboard.reportDone'),
              onPress: () => Navigator.of(context).pop(),
              fullWidth: true,
              icon: Icon(
                Icons.check_circle_outline,
                size: 16,
                color: t.paper,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
