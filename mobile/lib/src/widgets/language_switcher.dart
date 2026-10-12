import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';

/// EN/KIN language toggle ported from LanguageSwitcher.tsx. Selection follows
/// the inversion rule (uppercase is reserved for genuine short codes — §3.2).
class LanguageSwitcher extends ConsumerWidget {
  final bool compact;

  const LanguageSwitcher({super.key, this.compact = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final language = ref.watch(localeProvider).language;

    Widget option(AppLanguage value, String code) {
      final selected = language == value;
      return GestureDetector(
        onTap: () => ref.read(localeProvider.notifier).setLanguage(value),
        child: Container(
          constraints: const BoxConstraints(minWidth: 44),
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
          decoration: BoxDecoration(
            color: selected ? t.ink : Colors.transparent,
            borderRadius: BorderRadius.circular(PkSpace.radiusPill),
          ),
          alignment: Alignment.center,
          child: Text(
            code,
            style: type.meta.copyWith(
              color: selected ? t.paper : t.muted,
              fontWeight: PkType.medium,
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!compact) ...[
          Text(tr('language.label'), style: type.meta),
          const SizedBox(height: PkSpace.s8),
        ],
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(PkSpace.radiusPill),
            border: Border.all(color: t.line),
            color: t.paper,
          ),
          padding: const EdgeInsets.all(2),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [option(AppLanguage.en, 'EN'), option(AppLanguage.rw, 'KIN')],
          ),
        ),
      ],
    );
  }
}
