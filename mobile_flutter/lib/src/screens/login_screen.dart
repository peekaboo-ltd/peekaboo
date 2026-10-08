import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../models/user.dart';
import '../state/auth_state.dart';
import '../theme/tokens.dart';
import '../utils/validators.dart';
import '../widgets/language_switcher.dart';
import '../widgets/pk_button.dart';
import '../widgets/pk_text_field.dart';

/// Login screen matching the client's AuthPageShell: surface ground, centred
/// logo, a max-440px card with a 1px line border, centred h3 title with a
/// muted subtitle, inputs, a primary button, and an AuthLink-style support
/// line. No social button — riders sign in with username and password.
/// Errors render as an AuthNotice panel (danger surface/line/text).
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

  Future<void> _handleLogin() async {
    ref.read(authProvider.notifier).clearError();
    final usernameError = getUsernameError(_username.text);
    final passwordError = getPasswordError(_password.text);
    setState(() {
      _usernameError = usernameError;
      _passwordError = passwordError;
    });
    if (usernameError != null || passwordError != null) return;
    await ref.read(authProvider.notifier).login(
          LoginCredentials(
            username: _username.text,
            password: _password.text,
          ),
        );
    if (!mounted) return;
    if (ref.read(authProvider).isAuthenticated) {
      context.go('/dashboard');
    }
    // Failures surface through the AuthNotice panel below; no alert needed.
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: t.surface,
      body: SafeArea(
        child: FadeTransition(
          opacity: _opacity,
          child: SlideTransition(
            position: _rise,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: PkSpace.s20,
                vertical: PkSpace.s24,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 440),
                  child: Column(
                    children: [
                      Image.asset(
                        'assets/images/icon.png',
                        height: 40,
                        fit: BoxFit.contain,
                      ),
                      const SizedBox(height: PkSpace.s20),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          horizontal: PkSpace.s32,
                          vertical: PkSpace.s32,
                        ),
                        decoration: BoxDecoration(
                          color: t.paper,
                          borderRadius: BorderRadius.circular(
                            PkSpace.radiusControl,
                          ),
                          border: Border.all(color: t.line),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              tr('auth.signIn'),
                              style: type.h3,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              tr('auth.formSubtitle'),
                              style: type.bodySm.copyWith(color: t.muted),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: PkSpace.s24),
                            PkTextField(
                              controller: _username,
                              onChanged: (_) => setState(
                                () => _usernameError = null,
                              ),
                              label: tr('auth.usernameOrEmail'),
                              placeholder: tr('auth.usernamePlaceholder'),
                              keyboardType: TextInputType.emailAddress,
                              error: _usernameError,
                              onSubmitted: (_) => _handleLogin(),
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
                              onSubmitted: (_) => _handleLogin(),
                            ),
                            if (auth.error != null &&
                                auth.error!.isNotEmpty) ...[
                              const SizedBox(height: PkSpace.s16),
                              Container(
                                padding: const EdgeInsets.all(PkSpace.s16),
                                decoration: BoxDecoration(
                                  color: t.danger.surface,
                                  borderRadius: BorderRadius.circular(
                                    PkSpace.radiusControl,
                                  ),
                                  border: Border.all(
                                    color: t.danger.line,
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Icon(
                                      Icons.warning_outlined,
                                      size: 18,
                                      color: t.danger.main,
                                    ),
                                    const SizedBox(width: PkSpace.s8),
                                    Expanded(
                                      child: Text(
                                        auth.error!,
                                        style: type.bodySm.copyWith(
                                          color: t.danger.main,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            const SizedBox(height: PkSpace.s16),
                            PkButton(
                              title: tr('auth.signInButton'),
                              onPress: _handleLogin,
                              loading: auth.isLoading,
                              fullWidth: true,
                              size: PkButtonSize.lg,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s24),
                      Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(
                            '${tr('auth.troubleSigningIn')} ',
                            style: type.bodySm,
                          ),
                          GestureDetector(
                            onTap: () => context.push('/support'),
                            child: Text(
                              tr('auth.contactSupport'),
                              style: type.bodySm.copyWith(
                                fontWeight: PkType.medium,
                                decoration: TextDecoration.underline,
                                decorationColor: t.lineStrong,
                                decorationThickness: 1,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: PkSpace.s16),
                      const LanguageSwitcher(compact: true),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
