import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/i18n/localizations.dart';
import 'package:mobile_flutter/src/i18n/strings_en.dart';
import 'package:mobile_flutter/src/i18n/strings_rw.dart';

void main() {
  test('en and rw tables cover identical keys', () {
    final enKeys = stringsEn.keys.toSet();
    final rwKeys = stringsRw.keys.toSet();
    expect(
      rwKeys.difference(enKeys),
      isEmpty,
      reason: 'rw has keys missing from en',
    );
    expect(
      enKeys.difference(rwKeys),
      isEmpty,
      reason: 'en has keys missing from rw',
    );
    expect(enKeys, isNotEmpty);
  });

  test('t() interpolates {{values}}', () {
    expect(
      translate(AppLanguage.en, 'dashboard.pendingAssignments', {'count': 3}),
      '3 Pending Assignments',
    );
    expect(
      translate(AppLanguage.rw, 'assignments.emptyFiltered', {'filter': 'x'}),
      'Nta delivery za x zabonetse.',
    );
  });

  test('t() falls back to en, then to the key itself', () {
    // Both tables share keys, so exercise fallback via a missing key.
    expect(translate(AppLanguage.rw, 'nope.missing'), 'nope.missing');
    expect(translate(AppLanguage.en, 'auth.signIn'), 'Sign in');
    expect(translate(AppLanguage.rw, 'auth.signIn'), 'Injira');
  });

  test('default language is Kinyarwanda', () {
    expect(appLanguageToCode(AppLanguage.rw), 'rw');
    expect(appLanguageFromCode(null), AppLanguage.rw);
    expect(appLanguageFromCode('xx'), AppLanguage.rw);
    expect(appLanguageFromCode('en'), AppLanguage.en);
  });
}
