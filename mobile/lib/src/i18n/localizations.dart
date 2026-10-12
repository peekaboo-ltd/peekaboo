import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/secure_storage.dart';
import 'strings_en.dart';
import 'strings_rw.dart';

/// Supported app languages. Defaults to Kinyarwanda (mobile/i18n/index.tsx).
enum AppLanguage { en, rw }

AppLanguage appLanguageFromCode(String? code) =>
    code == 'en' ? AppLanguage.en : AppLanguage.rw;

String appLanguageToCode(AppLanguage language) =>
    language == AppLanguage.en ? 'en' : 'rw';

/// Lookup with English fallback and `{{key}}` interpolation (same semantics
/// as the Expo `t()` helper).
String translate(
  AppLanguage language,
  String key, [
  Map<String, Object>? values,
]) {
  final tables = {
    AppLanguage.en: stringsEn,
    AppLanguage.rw: stringsRw,
  };
  final template = tables[language]![key] ?? stringsEn[key] ?? key;
  if (values == null || values.isEmpty) return template;
  var result = template;
  values.forEach((k, v) {
    result = result.replaceAll('{{$k}}', v.toString());
  });
  return result;
}

class LocaleState {
  final AppLanguage language;
  final bool isHydrated;

  const LocaleState({required this.language, required this.isHydrated});
}

class LocaleNotifier extends Notifier<LocaleState> {
  @override
  LocaleState build() {
    _hydrate();
    return const LocaleState(language: AppLanguage.rw, isHydrated: false);
  }

  Future<void> _hydrate() async {
    try {
      final stored = await ref.read(secureStorageProvider).getLanguage();
      final language = stored == 'en' || stored == 'rw'
          ? appLanguageFromCode(stored)
          : AppLanguage.rw;
      state = LocaleState(language: language, isHydrated: true);
    } catch (_) {
      state = const LocaleState(
        language: AppLanguage.rw,
        isHydrated: true,
      );
    }
  }

  Future<void> setLanguage(AppLanguage language) async {
    state = LocaleState(language: language, isHydrated: state.isHydrated);
    try {
      await ref
          .read(secureStorageProvider)
          .saveLanguage(appLanguageToCode(language));
    } catch (_) {
      // Language preference must never break the UI.
    }
  }

  Future<void> toggleLanguage() {
    return setLanguage(
      state.language == AppLanguage.en ? AppLanguage.rw : AppLanguage.en,
    );
  }
}

final localeProvider =
    NotifierProvider<LocaleNotifier, LocaleState>(LocaleNotifier.new);

/// Shorthand to match the Expo `t('key', {values})` call sites.
typedef Translate = String Function(String key, [Map<String, Object>? values]);

final tProvider = Provider<Translate>((ref) {
  final language = ref.watch(localeProvider).language;
  return (key, [values]) => translate(language, key, values);
});
