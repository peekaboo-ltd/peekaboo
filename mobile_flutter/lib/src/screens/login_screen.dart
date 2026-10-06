import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../models/user.dart';
import '../state/auth_state.dart';
import '../theme/tokens.dart';
import '../utils/validators.dart';
import '../widgets/dialogs.dart';
import '../widgets/language_switcher.dart';
import '../widgets/pk_button.dart';
import '../widgets/pk_card.dart';
import '../widgets/pk_text_field.dart';

/// Login screen ported from mobile/app/(auth)/login.tsx. Entrance is the
/// single §5 motion (opacity + 8px rise, 200ms) — no stagger cascades.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _username = TextEditingController();
  final _password = TextEditingController();
  String? _usernameError;
  String? _passwordError;
  late final AnimationController _enter;
  late final Animation<double> _opacity;
  late final Animation<Offset> _rise;

  @override
  void initState() {
    super.initState();
    _enter = AnimationController(
      vsync: this,
      duration: PkMotion.durState,
    );
    _opacity = Tween<double>(begin: 0, end: 1).animate(_enter);
    _rise = Tween<Offset>(
      begin: const Offset(0, 8 / 600),
      end: Offset.zero,
    ).animate(_enter);
    _enter.forward();
  }

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    _enter.dispose();
    super.dispose();
  }

  Future<void> _handleLogin(Translate tr) async {
    ref.read(authProvider.notifier).clearError();
    final usernameError = getUsernameError(_username.text);
    final passwordError = getPasswordError(_password.text);
    setState(() {
      _usernameError = usernameError;
      _passwordError = passwordError;
    });
    if (usernameError != null || passwordError != null) return;

    final ok = await ref.read(authProvider.notifier).login(
          LoginCredentials(
            username: _username.text,
            password: _password.text,
          ),
        );
    if (!mounted) return;
    if (ok) {
      context.go('/dashboard');
    } else {
      final error = ref.read(authProvider).error;
      if (error != null && error.isNotEmpty) {
        await showPkAlert(
          context,
          title: tr('auth.loginFailed'),
          message: error,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final auth = ref.watch(authProvider);
    final compact = MediaQuery.widthOf(context) < 380;

    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _opacity,
          child: SlideTransition(
            position: _rise,
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: compact ? PkSpace.s16 : PkSpace.s24,
                vertical: PkSpace.s32,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: t.ink,
                        ),
                      ),
                      const SizedBox(width: PkSpace.s8),
                      Text(tr('auth.riderPortal'), style: type.eyebrow),
                    ],
                  ),
                  const SizedBox(height: PkSpace.s8),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: LanguageSwitcher(compact: true),
                  ),
                  const SizedBox(height: PkSpace.s24),
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: t.ink,
                      borderRadius: BorderRadius.circular(PkSpace.radiusCard),
                    ),
                    child: Icon(
                      Icons.pedal_bike,
                      size: 40,
                      color: t.paper,
                    ),
                  ),
                  const SizedBox(height: PkSpace.s16),
                  Text(tr('auth.title'), style: type.h2),
                  const SizedBox(height: PkSpace.s4),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 260),
                    child: Text(
                      tr('auth.subtitle'),
                      style: type.bodySm.copyWith(color: t.muted),
                    ),
                  ),
                  const SizedBox(height: PkSpace.s24),
                  PkCard(
                    padding: PkCardPadding.lg,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(tr('auth.signIn'), style: type.h3),
                        const SizedBox(height: PkSpace.s4),
                        Text(
                          tr('auth.formSubtitle'),
                          style: type.bodySm.copyWith(color: t.muted),
                        ),
                        const SizedBox(height: PkSpace.s16),
                        PkTextField(
                          controller: _username,
                          onChanged: (_) => setState(
                            () => _usernameError = null,
                          ),
                          label: tr('auth.usernameOrEmail'),
                          placeholder: tr('auth.usernamePlaceholder'),
                          keyboardType: TextInputType.emailAddress,
                          error: _usernameError,
                          prefixIcon: Icon(
                            Icons.person_outline,
                            size: 20,
                            color: t.muted,
                          ),
                        ),
                        const SizedBox(height: PkSpace.s16),
                        PkTextField(
                          controller: _password,
                          onChanged: (_) => setState(
                            () => _passwordError = null,
                          ),
                          label: tr('auth.password'),
                          placeholder: tr('auth.passwordPlaceholder'),
                          obscureText: true,
                          error: _passwordError,
                          onSubmitted: (_) => _handleLogin(tr),
                          prefixIcon: Icon(
                            Icons.lock_outline,
                            size: 20,
                            color: t.muted,
                          ),
                        ),
                        if (auth.error != null &&
                            auth.error!.isNotEmpty) ...[
                          const SizedBox(height: PkSpace.s16),
                          Row(
                            children: [
                              Icon(
                                Icons.warning_outlined,
                                size: 18,
                                color: t.ink,
                              ),
                              const SizedBox(width: PkSpace.s8),
                              Expanded(
                                child: Text(
                                  auth.error!,
                                  style: type.bodySm,
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: PkSpace.s16),
                        PkButton(
                          title: tr('auth.signInButton'),
                          onPress: () => _handleLogin(tr),
                          loading: auth.isLoading,
                          fullWidth: true,
                          size: PkButtonSize.lg,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: PkSpace.s24),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.push('/support'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: PkSpace.s16,
                          vertical: PkSpace.s8,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(
                            PkSpace.radiusPill,
                          ),
                          border: Border.all(color: t.line),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.help_outline,
                              size: 18,
                              color: t.ink,
                            ),
                            const SizedBox(width: PkSpace.s4),
                            Text(
                              tr('auth.troubleSigningIn'),
                              style: type.bodySm.copyWith(color: t.muted),
                            ),
                            const SizedBox(width: PkSpace.s4),
                            Text(
                              tr('auth.contactSupport'),
                              style: type.label,
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
        ),
      ),
    );
  }
}
