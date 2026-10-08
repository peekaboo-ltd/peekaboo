import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import '../widgets/pk_card.dart';

/// Support screen ported from mobile/app/(auth)/support.tsx.
class SupportScreen extends ConsumerWidget {
  const SupportScreen({super.key});

  static const _address = 'Niboye, Kicukiro, Kigali, Rwanda';
  static const _phoneLabel = '(+250) 794 892 784';
  static const _phoneUrl = 'tel:+250794892784';
  static const _emailLabel = 'info@peekaboo.co.rw';
  static const _emailUrl = 'mailto:info@peekaboo.co.rw';
  static const _copyright = '© 2026 Peekaboo. Peekaboo Ltd. All rights reserved.';

  Future<void> _openLink(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final compact = MediaQuery.widthOf(context) < 380;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? PkSpace.s16 : PkSpace.s24,
            vertical: PkSpace.s24,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: PkSpace.s16,
                      vertical: PkSpace.s8,
                    ),
                    decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(PkSpace.radiusPill),
                      border: Border.all(color: t.line),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.chevron_left,
                          size: 18,
                          color: t.ink,
                        ),
                        Text(tr('common.back'), style: type.label),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: PkSpace.s16),
              PkCard(
                padding: PkCardPadding.lg,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tr('support.title'), style: type.h2),
                    const SizedBox(height: PkSpace.s16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 18,
                          color: t.ink,
                        ),
                        const SizedBox(width: PkSpace.s8),
                        Expanded(
                          child: Text(_address, style: type.body),
                        ),
                      ],
                    ),
                    const SizedBox(height: PkSpace.s12),
                    GestureDetector(
                      onTap: () => _openLink(_phoneUrl),
                      child: Row(
                        children: [
                          Icon(Icons.call_outlined, size: 18, color: t.ink),
                          const SizedBox(width: PkSpace.s8),
                          Text(_phoneLabel, style: type.label),
                        ],
                      ),
                    ),
                    const SizedBox(height: PkSpace.s12),
                    GestureDetector(
                      onTap: () => _openLink(_emailUrl),
                      child: Row(
                        children: [
                          Icon(Icons.mail_outline, size: 18, color: t.ink),
                          const SizedBox(width: PkSpace.s8),
                          Text(_emailLabel, style: type.label),
                        ],
                      ),
                    ),
                    const SizedBox(height: PkSpace.s16),
                    Text(_copyright, style: type.meta),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
