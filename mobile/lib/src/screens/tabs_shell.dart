import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../models/user.dart';
import '../state/auth_state.dart';
import '../theme/tokens.dart';
import '../widgets/language_switcher.dart';
import '../widgets/pk_icon_button.dart';

/// App shell: an inverted (black) 64px top bar with the bare logo mark and
/// an avatar trigger, over icon-only bottom tabs. Labels live in tooltips
/// and semantics so long Kinyarwanda strings never wrap the bar.
class TabsShell extends ConsumerWidget {
  final StatefulNavigationShell shell;

  const TabsShell({super.key, required this.shell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final page = context.tokens;
    final ground = PkTokens.inverted(Theme.of(context).brightness);
    final tr = ref.watch(tProvider);

    final tabs = [
      (Icons.home_outlined, Icons.home, tr('tab.dashboard')),
      (Icons.list_alt_outlined, Icons.list_alt, tr('tab.assignments')),
      (Icons.person_outline, Icons.person, tr('tab.profile')),
    ];

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: Container(
          color: ground.paper,
          padding: const EdgeInsets.symmetric(horizontal: PkSpace.s16),
          child: SafeArea(
            bottom: false,
            child: SizedBox(
              height: 64,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Semantics(
                    label: 'Peekaboo',
                    image: true,
                    child: Image.asset(
                      'assets/images/logo.png',
                      height: 28,
                      fit: BoxFit.contain,
                      color: ground.ink,
                      colorBlendMode: BlendMode.srcIn,
                    ),
                  ),
                  _AccountMenuButton(shell: shell),
                ],
              ),
            ),
          ),
        ),
      ),
      body: shell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: page.paper,
          border: Border(top: BorderSide(color: page.line)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: [
                for (var i = 0; i < tabs.length; i++)
                  Expanded(
                    child: _TabButton(
                      icon: tabs[i].$1,
                      selectedIcon: tabs[i].$2,
                      label: tabs[i].$3,
                      selected: shell.currentIndex == i,
                      onTap: () => shell.goBranch(
                        i,
                        initialLocation: i == shell.currentIndex,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// One bottom tab: the selected tab is an ink pill holding the filled icon.
class _TabButton extends StatelessWidget {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TabButton({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      onTap: onTap,
      excludeSemantics: true,
      child: Tooltip(
        message: label,
        excludeFromSemantics: true,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          child: Center(
            child: AnimatedContainer(
              duration: PkMotion.durState,
              curve: PkMotion.easeFlat,
              width: 64,
              height: 40,
              decoration: BoxDecoration(
                color: selected ? t.ink : Colors.transparent,
                borderRadius: BorderRadius.circular(PkSpace.radiusPill),
              ),
              child: Icon(
                selected ? selectedIcon : icon,
                size: 24,
                color: selected ? t.paper : t.muted,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Avatar trigger opening the account menu.
class _AccountMenuButton extends ConsumerWidget {
  final StatefulNavigationShell shell;

  const _AccountMenuButton({required this.shell});

  String _initial(User? user) {
    final name = user?.name;
    if (name != null && name.isNotEmpty) return name[0].toUpperCase();
    return 'R';
  }

  void _openMenu(BuildContext context) {
    showDialog<void>(
      context: context,
      barrierColor: Colors.transparent,
      builder: (context) => _AccountMenu(shell: shell),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ground = PkTokens.inverted(Theme.of(context).brightness);
    final user = ref.watch(authProvider).user;
    final tr = ref.watch(tProvider);
    final initial = Text(
      _initial(user),
      style: TextStyle(
        fontFamily: PkType.family,
        fontWeight: PkType.medium,
        fontSize: 15,
        color: ground.ink,
      ),
    );
    return Semantics(
      button: true,
      label: tr('common.account'),
      onTap: () => _openMenu(context),
      excludeSemantics: true,
      child: Tooltip(
        message: tr('common.account'),
        excludeFromSemantics: true,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => _openMenu(context),
          child: Padding(
            padding: const EdgeInsets.all(4),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: ground.surface,
                shape: BoxShape.circle,
                border: Border.all(color: ground.line),
              ),
              clipBehavior: Clip.antiAlias,
              alignment: Alignment.center,
              child: user?.profilePhotoUrl?.isNotEmpty == true
                  ? Image.network(
                      user!.profilePhotoUrl!,
                      width: 36,
                      height: 36,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => initial,
                    )
                  : initial,
            ),
          ),
        ),
      ),
    );
  }
}

/// Account menu: who is signed in plus a red-700 sign-out icon on the
/// first row; profile and support icons with the EN/KIN switch below.
class _AccountMenu extends ConsumerWidget {
  final StatefulNavigationShell shell;

  const _AccountMenu({required this.shell});

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    Navigator.of(context).pop();
    await ref.read(authProvider.notifier).logout();
    if (context.mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final user = ref.watch(authProvider).user;
    final name = user?.name?.isNotEmpty == true
        ? user!.name!
        : (user?.phoneNumber ?? '');
    final contact = user?.email?.isNotEmpty == true
        ? user!.email!
        : (user?.phoneNumber ?? '');

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: () => Navigator.of(context).pop(),
          ),
        ),
        Positioned(
          top: MediaQuery.paddingOf(context).top + 64,
          right: PkSpace.s16,
          child: Container(
            width: 300,
            constraints: BoxConstraints(
              maxWidth: MediaQuery.widthOf(context) - 32,
            ),
            padding: const EdgeInsets.all(PkSpace.s12),
            decoration: BoxDecoration(
              color: t.paper,
              borderRadius: BorderRadius.circular(PkSpace.radiusCard),
              border: Border.all(color: t.line),
              boxShadow: t.shadowMenu,
            ),
            child: Material(
              color: Colors.transparent,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const SizedBox(width: PkSpace.s4),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: type.label,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              contact,
                              style: type.meta,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      PkIconButton(
                        icon: Icons.logout,
                        tooltip: tr('common.logout'),
                        variant: PkIconButtonVariant.destructive,
                        onPress: () => _logout(context, ref),
                      ),
                    ],
                  ),
                  const SizedBox(height: PkSpace.s8),
                  Container(height: 1, color: t.line),
                  const SizedBox(height: PkSpace.s8),
                  Row(
                    children: [
                      PkIconButton(
                        icon: Icons.person_outline,
                        tooltip: tr('tab.profile'),
                        variant: PkIconButtonVariant.outline,
                        onPress: () {
                          Navigator.of(context).pop();
                          shell.goBranch(2);
                        },
                      ),
                      PkIconButton(
                        icon: Icons.support_agent_outlined,
                        tooltip: tr('support.title'),
                        variant: PkIconButtonVariant.outline,
                        onPress: () {
                          Navigator.of(context).pop();
                          context.push('/support');
                        },
                      ),
                      const Spacer(),
                      const LanguageSwitcher(compact: true),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
