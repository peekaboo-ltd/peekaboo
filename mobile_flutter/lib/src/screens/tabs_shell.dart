import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../models/user.dart';
import '../state/auth_state.dart';
import '../theme/tokens.dart';

/// App shell matching the client's authenticated layout: an inverted (black)
/// 64px top bar with the logo and an account menu, over bottom tabs on paper
/// with a top line border. The selected tab is an inverted pill.
class TabsShell extends ConsumerWidget {
  final StatefulNavigationShell shell;

  const TabsShell({super.key, required this.shell});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final page = context.tokens;
    final ground = PkTokens.inverted(Theme.of(context).brightness);
    final type = context.type;
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
          height: 64,
          color: ground.paper,
          padding: const EdgeInsets.symmetric(horizontal: PkSpace.s16),
          child: SafeArea(
            bottom: false,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Image.asset(
                  'assets/images/icon.png',
                  height: 40,
                  fit: BoxFit.contain,
                ),
                _AccountMenuButton(shell: shell),
              ],
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
          child: Row(
            children: [
              for (var i = 0; i < tabs.length; i++)
                Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => shell.goBranch(
                      i,
                      initialLocation: i == shell.currentIndex,
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
                            ? page.ink
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
                                ? page.paper
                                : page.muted,
                          ),
                          Text(
                            tabs[i].$3,
                            style: type.eyebrow.copyWith(
                              color: shell.currentIndex == i
                                  ? page.paper
                                  : page.muted,
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

/// Avatar trigger opening the account dropdown (client's account menu:
/// user header, bordered Profile/Language/Support rows, danger Logout row).
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
    return GestureDetector(
      onTap: () => _openMenu(context),
      child: Container(
        height: PkSpace.controlLg,
        padding: const EdgeInsets.symmetric(horizontal: PkSpace.s12),
        decoration: BoxDecoration(
          color: ground.paper,
          borderRadius: BorderRadius.circular(PkSpace.radiusControl),
          border: Border.all(color: ground.line),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: ground.surface,
                borderRadius:
                    BorderRadius.circular(PkSpace.radiusControl),
                border: Border.all(color: ground.line),
              ),
              clipBehavior: Clip.antiAlias,
              alignment: Alignment.center,
              child: user?.profilePhotoUrl?.isNotEmpty == true
                  ? Image.network(
                      user!.profilePhotoUrl!,
                      width: 32,
                      height: 32,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Text(
                        _initial(user),
                        style: TextStyle(
                          fontFamily: PkType.family,
                          fontSize: 14,
                          color: ground.ink,
                        ),
                      ),
                    )
                  : Text(
                      _initial(user),
                      style: TextStyle(
                        fontFamily: PkType.family,
                        fontSize: 14,
                        color: ground.ink,
                      ),
                    ),
            ),
            const SizedBox(width: PkSpace.s8),
            Icon(Icons.expand_more, size: 16, color: ground.muted),
          ],
        ),
      ),
    );
  }
}

class _AccountMenu extends ConsumerWidget {
  final StatefulNavigationShell shell;

  const _AccountMenu({required this.shell});

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    Navigator.of(context).pop();
    await ref.read(authProvider.notifier).logout();
    if (context.mounted) context.go('/login');
  }

  void _pickLanguage(BuildContext context, WidgetRef ref) {
    Navigator.of(context).pop();
    showDialog<void>(
      context: context,
      builder: (context) => Consumer(
        builder: (context, ref, _) {
          final t = context.tokens;
          final type = context.type;
          final tr = ref.watch(tProvider);
          final language = ref.watch(localeProvider).language;
          return AlertDialog(
            title: Text(tr('language.label')),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (final option in [
                  (AppLanguage.en, tr('language.english')),
                  (AppLanguage.rw, tr('language.kinyarwanda')),
                ])
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(option.$2, style: type.bodySm),
                    trailing: language == option.$1
                        ? Icon(Icons.check, size: 18, color: t.ink)
                        : null,
                    onTap: () {
                      ref
                          .read(localeProvider.notifier)
                          .setLanguage(option.$1);
                      Navigator.of(context).pop();
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final user = ref.watch(authProvider).user;

    return Stack(
      children: [
        Positioned.fill(
          child: GestureDetector(
            onTap: () => Navigator.of(context).pop(),
          ),
        ),
        Positioned(
          top: 70,
          right: PkSpace.s16,
          child: Container(
            width: 320,
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
                  Padding(
                    padding: const EdgeInsets.fromLTRB(4, 4, 4, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name?.isNotEmpty == true
                              ? user!.name!
                              : (user?.phoneNumber ?? ''),
                          style: type.label,
                        ),
                        Text(
                          user?.email?.isNotEmpty == true
                              ? user!.email!
                              : (user?.phoneNumber ?? ''),
                          style: type.meta,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(height: 1, color: t.line),
                  const SizedBox(height: PkSpace.s8),
                  _MenuRow(
                    icon: Icons.person_outline,
                    label: tr('tab.profile'),
                    onTap: () {
                      Navigator.of(context).pop();
                      shell.goBranch(2);
                    },
                  ),
                  const SizedBox(height: PkSpace.s8),
                  _MenuRow(
                    icon: Icons.translate_outlined,
                    label: tr('language.label'),
                    onTap: () => _pickLanguage(context, ref),
                  ),
                  const SizedBox(height: PkSpace.s8),
                  _MenuRow(
                    icon: Icons.help_outline,
                    label: tr('support.title'),
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/support');
                    },
                  ),
                  const SizedBox(height: PkSpace.s8),
                  _MenuRow(
                    icon: Icons.logout,
                    label: tr('common.logout'),
                    danger: true,
                    onTap: () => _logout(context, ref),
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

class _MenuRow extends StatefulWidget {
  final IconData icon;
  final String label;
  final bool danger;
  final VoidCallback onTap;

  const _MenuRow({
    required this.icon,
    required this.label,
    this.danger = false,
    required this.onTap,
  });

  @override
  State<_MenuRow> createState() => _MenuRowState();
}

class _MenuRowState extends State<_MenuRow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final fg = widget.danger ? t.danger.main : t.ink;
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: PkMotion.durState,
        curve: PkMotion.easeFlat,
        padding: const EdgeInsets.symmetric(
          horizontal: PkSpace.s16,
          vertical: PkSpace.s12,
        ),
        decoration: BoxDecoration(
          color: !_pressed
              ? t.paper
              : widget.danger
                  ? t.danger.surface
                  : t.surface,
          borderRadius: BorderRadius.circular(PkSpace.radiusControl),
          border: Border.all(
            color: _pressed ? t.lineStrong : t.line,
          ),
        ),
        child: Row(
          children: [
            Icon(widget.icon, size: 16, color: fg),
            const SizedBox(width: PkSpace.s12),
            Text(
              widget.label,
              style: type.label.copyWith(color: fg),
            ),
          ],
        ),
      ),
    );
  }
}
