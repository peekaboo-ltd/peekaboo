import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import '../widgets/pk_button.dart';

class ProofDraft {
  final String imageUri;
  final String timestamp;
  final String capturedAt;
  final String locationLabel;
  final double latitude;
  final double longitude;

  const ProofDraft({
    required this.imageUri,
    required this.timestamp,
    required this.capturedAt,
    required this.locationLabel,
    required this.latitude,
    required this.longitude,
  });

  ProofDraft copyWith({
    String? imageUri,
    String? timestamp,
    String? capturedAt,
    String? locationLabel,
    double? latitude,
    double? longitude,
  }) {
    return ProofDraft(
      imageUri: imageUri ?? this.imageUri,
      timestamp: timestamp ?? this.timestamp,
      capturedAt: capturedAt ?? this.capturedAt,
      locationLabel: locationLabel ?? this.locationLabel,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }
}

/// Check-in/check-out proof modal ported from the dashboard proof modal:
/// photo + watermark + timestamp/location overlay, retake / save / send.
class ProofSheet extends ConsumerStatefulWidget {
  /// Parent-owned draft; retakes replace `.value` and the sheet rebuilds.
  final ValueNotifier<ProofDraft> draftListenable;
  final String actionLabel;
  final Future<void> Function() onRetake;
  final Future<bool> Function() onSave;
  final Future<bool> Function() onSend;
  final VoidCallback onClose;

  const ProofSheet({
    super.key,
    required this.draftListenable,
    required this.actionLabel,
    required this.onRetake,
    required this.onSave,
    required this.onSend,
    required this.onClose,
  });

  @override
  ConsumerState<ProofSheet> createState() => _ProofSheetState();
}

class _ProofSheetState extends ConsumerState<ProofSheet> {
  bool _saving = false;
  bool _sending = false;

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
    super.dispose();
  }

  Future<void> _save(Translate tr) async {
    setState(() => _saving = true);
    try {
      await widget.onSave();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _send() async {
    setState(() => _sending = true);
    try {
      await widget.onSend();
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
        title: Image.asset('assets/images/icon.png', height: 32),
        centerTitle: false,
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
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius:
                        BorderRadius.circular(PkSpace.radiusCard),
                    child: Image.file(
                      File(draft.imageUri),
                      height: 380,
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
                            '${tr('dashboard.reportTimestamp')}: ${draft.timestamp}',
                            style: type.meta.copyWith(color: t.paper),
                          ),
                          Text(
                            '${tr('dashboard.reportLocation')}: ${draft.locationLabel}',
                            style: type.meta.copyWith(color: t.paper),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(PkSpace.s16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: t.line)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                PkButton(
                  title: tr('dashboard.reportRetake'),
                  onPress: () => widget.onRetake(),
                  variant: PkButtonVariant.outline,
                  fullWidth: true,
                  disabled: _sending || _saving,
                ),
                const SizedBox(height: PkSpace.s8),
                PkButton(
                  title: tr('dashboard.proofSave'),
                  onPress: () => _save(tr),
                  variant: PkButtonVariant.secondary,
                  fullWidth: true,
                  loading: _saving,
                  disabled: _sending,
                  icon: Icon(
                    Icons.download_outlined,
                    size: 16,
                    color: t.ink,
                  ),
                ),
                const SizedBox(height: PkSpace.s8),
                PkButton(
                  title: widget.actionLabel,
                  onPress: _send,
                  fullWidth: true,
                  loading: _sending,
                  disabled: _saving,
                  icon: Icon(Icons.send, size: 16, color: t.paper),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
