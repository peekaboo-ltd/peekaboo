import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import '../widgets/pk_button.dart';

/// Not-found page ported from mobile/app/+not-found.tsx.
class NotFoundScreen extends ConsumerWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final type = context.type;
    final tr = ref.watch(tProvider);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(PkSpace.s24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(tr('notFound.title'), style: type.h2),
              const SizedBox(height: PkSpace.s8),
              Text(tr('notFound.subtitle'), style: type.bodySm),
              const SizedBox(height: PkSpace.s24),
              PkButton(
                title: tr('notFound.goDashboard'),
                onPress: () => context.go('/dashboard'),
                fullWidth: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
