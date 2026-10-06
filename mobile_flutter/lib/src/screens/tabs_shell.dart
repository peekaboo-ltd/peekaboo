import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';

/// Bottom tab shell ported from mobile/app/(tabs)/_layout.tsx.
/// Active tab follows the inversion rule; labels stay at 12px+ (§3.2 floor).
class TabsShell extends ConsumerWidget {
  final StatefulNavigationShell shell;

  const TabsShell({super.key, required this.shell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);

    final tabs = [
      (Icons.home_outlined, Icons.home, tr('tab.dashboard')),
      (Icons.list_alt_outlined, Icons.list_alt, tr('tab.assignments')),
      (Icons.person_outline, Icons.person, tr('tab.profile')),
    ];

    return Scaffold(
      body: shell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: t.paper,
          border: Border(top: BorderSide(color: t.line)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              for (var i = 0; i < tabs.length; i++)
                Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => shell.goBranch(
                      i,
                      initialLocation:
                          i == shell.currentIndex,
                    ),
                    child: AnimatedContainer(
                      duration: PkMotion.durState,
                      curve: PkMotion.easeFlat,
                      margin: const EdgeInsets.symmetric(
                        horizontal: PkSpace.s8,
                        vertical: PkSpace.s4,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      decoration: BoxDecoration(
                        color: shell.currentIndex == i
                            ? t.ink
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(
                          PkSpace.radiusPill,
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            shell.currentIndex == i
                                ? tabs[i].$2
                                : tabs[i].$1,
                            size: 22,
                            color: shell.currentIndex == i
                                ? t.paper
                                : t.muted,
                          ),
                          Text(
                            tabs[i].$3,
                            style: type.eyebrow.copyWith(
                              color: shell.currentIndex == i
                                  ? t.paper
                                  : t.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
