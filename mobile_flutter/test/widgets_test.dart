import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/i18n/localizations.dart';
import 'package:mobile_flutter/src/state/assignments_state.dart';
import 'package:mobile_flutter/src/theme/peekaboo_theme.dart';
import 'package:mobile_flutter/src/widgets/assignment_filters.dart';
import 'package:mobile_flutter/src/widgets/language_switcher.dart';
import 'package:mobile_flutter/src/widgets/pk_badge.dart';
import 'package:mobile_flutter/src/widgets/pk_icon_button.dart';
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

  test('statusKind maps assignment and order codes to one chip set', () {
    expect(statusKind('COMPLETED'), PkBadgeKind.completed);
    expect(statusKind('DELIVERED'), PkBadgeKind.completed);
    expect(statusKind('PENDING'), PkBadgeKind.pending);
    expect(statusKind('CONFIRMED'), PkBadgeKind.pending);
    expect(statusKind('ACTIVE'), PkBadgeKind.active);
    expect(statusKind('IN_TRANSIT'), PkBadgeKind.active);
    expect(statusKind('REJECTED'), PkBadgeKind.failed);
    expect(statusKind('CANCELLED'), PkBadgeKind.failed);
    expect(statusKind(null), PkBadgeKind.inactive);
    expect(statusKind(''), PkBadgeKind.inactive);
    expect(statusKind('SOMETHING_NEW'), PkBadgeKind.inactive);
  });

  testWidgets('PkBadge.status renders the translated status label',
      (tester) async {
    await tester.pumpWidget(_harness(PkBadge.status('IN_TRANSIT', _en)));
    await tester.pumpAndSettle();

    expect(find.text('In transit'), findsOneWidget);
    expect(find.byIcon(Icons.autorenew), findsOneWidget);
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

  testWidgets('PkIconButton is named by its tooltip and fires onPress',
      (tester) async {
    final handle = tester.ensureSemantics();
    var taps = 0;
    await tester.pumpWidget(
      _harness(
        PkIconButton(
          icon: Icons.logout,
          tooltip: 'Sign out',
          variant: PkIconButtonVariant.destructive,
          onPress: () => taps++,
        ),
      ),
    );

    expect(find.byTooltip('Sign out'), findsOneWidget);
    expect(find.bySemanticsLabel('Sign out'), findsOneWidget);
    expect(find.text('Sign out'), findsNothing);

    await tester.tap(find.byIcon(Icons.logout));
    await tester.pumpAndSettle();
    expect(taps, 1);
    handle.dispose();
  });

  testWidgets('AssignmentFilters shows counts, not labels, and filters',
      (tester) async {
    AssignmentFilter? picked;
    await tester.pumpWidget(
      _harness(
        AssignmentFilters(
          activeFilter: AssignmentFilter.all,
          counts: const {
            AssignmentFilter.all: 7,
            AssignmentFilter.pending: 2,
            AssignmentFilter.active: 1,
            AssignmentFilter.completed: 4,
          },
          onFilterChange: (f) => picked = f,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('7'), findsOneWidget);
    expect(find.text('4'), findsOneWidget);
    // Kinyarwanda is the default; the label lives only in the tooltip.
    final pending = translate(AppLanguage.rw, 'assignments.pending');
    expect(find.text(pending), findsNothing);
    expect(find.byTooltip(pending), findsOneWidget);

    await tester.tap(find.byTooltip(pending));
    expect(picked, AssignmentFilter.pending);
  });
}
