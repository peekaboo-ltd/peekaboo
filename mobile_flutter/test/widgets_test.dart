import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/i18n/localizations.dart';
import 'package:mobile_flutter/src/theme/peekaboo_theme.dart';
import 'package:mobile_flutter/src/widgets/language_switcher.dart';
import 'package:mobile_flutter/src/widgets/pk_badge.dart';
import 'package:mobile_flutter/src/widgets/reject_sheet.dart';

String _en(String key, [Map<String, Object>? values]) =>
    translate(AppLanguage.en, key, values);

Widget _harness(Widget child) {
  return ProviderScope(
    child: MaterialApp(
      theme: buildPeekabooTheme(Brightness.light),
      home: Scaffold(body: child),
    ),
  );
}

void main() {
  testWidgets('LanguageSwitcher toggles EN/KIN selection', (tester) async {
    await tester.pumpWidget(_harness(const LanguageSwitcher()));
    await tester.pumpAndSettle();

    // Default language is Kinyarwanda; KIN starts selected.
    expect(find.text('EN'), findsOneWidget);
    expect(find.text('KIN'), findsOneWidget);

    await tester.tap(find.text('EN'));
    await tester.pumpAndSettle();

    final container = ProviderScope.containerOf(
      tester.element(find.byType(LanguageSwitcher)),
    );
    expect(container.read(localeProvider).language, AppLanguage.en);
  });

  testWidgets('PkBadge renders label and icon per kind', (tester) async {
    await tester.pumpWidget(
      _harness(
        const Column(
          children: [
            PkBadge(text: 'Pending', kind: PkBadgeKind.pending),
            PkBadge(text: 'Active', kind: PkBadgeKind.active),
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Pending'), findsOneWidget);
    expect(find.text('Active'), findsOneWidget);
    expect(find.byIcon(Icons.schedule), findsOneWidget);
    expect(find.byIcon(Icons.autorenew), findsOneWidget);
  });

  testWidgets('reject sheet returns the typed reason', (tester) async {
    String? result;
    await tester.pumpWidget(
      _harness(
        Builder(
          builder: (context) => TextButton(
            onPressed: () async {
              result = await showRejectSheet(context, _en);
            },
            child: const Text('open'),
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();

    expect(find.text('Reject Assignment'), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'Too far away');
    await tester.tap(find.text('Reject').last);
    await tester.pumpAndSettle();
    expect(result, 'Too far away');
  });

  testWidgets('reject sheet cancel returns null', (tester) async {
    var called = false;
    String? result = 'unset';
    await tester.pumpWidget(
      _harness(
        Builder(
          builder: (context) => TextButton(
            onPressed: () async {
              called = true;
              result = await showRejectSheet(context, _en);
            },
            child: const Text('open'),
          ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();
    expect(called, isTrue);
    expect(result, isNull);
  });
}
