import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/users_api.dart';
import '../i18n/localizations.dart';
import '../models/user.dart';
import '../services/media_service.dart';
import '../state/auth_state.dart';
import '../state/dashboard_state.dart';
import '../theme/tokens.dart';
import '../utils/formatters.dart';
import '../widgets/dialogs.dart';
import '../widgets/language_switcher.dart';
import '../widgets/pk_badge.dart';
import '../widgets/pk_button.dart';
import '../widgets/pk_card.dart';
import '../widgets/pk_section_card.dart';
import '../widgets/pk_text_field.dart';

/// Profile screen ported from mobile/app/(tabs)/profile.tsx: avatar
/// management, editable profile fields, and today's performance.
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _dob = TextEditingController();
  final _nationality = TextEditingController();
  bool _editing = false;
  bool _saving = false;
  bool _avatarLoading = false;
  String? _error;
  bool _seeded = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _dob.dispose();
    _nationality.dispose();
    super.dispose();
  }

  void _seedFrom(User user) {
    _name.text = user.name ?? '';
    _email.text = user.email ?? '';
    _phone.text = user.phoneNumber;
    _dob.text = user.dateOfBirth ?? '';
    _nationality.text = user.nationality ?? '';
  }

  String _initials(User user) {
    if (user.name != null && user.name!.isNotEmpty) {
      return user.name!
          .split(' ')
          .map((p) => p.isEmpty ? '' : p[0].toUpperCase())
          .join()
          .characters
          .take(2)
          .toString();
    }
    if (user.phoneNumber.length >= 2) {
      return user.phoneNumber.substring(user.phoneNumber.length - 2);
    }
    return '--';
  }

  Future<void> _pickImage(bool fromCamera, Translate tr) async {
    final user = ref.read(authProvider).user;
    if (user == null) return;
    String? path;
    try {
      final picked = await ref
          .read(mediaServiceProvider)
          .pickAvatar(fromCamera: fromCamera);
      path = picked?.path;
    } catch (_) {
      path = null;
    }
    if (path == null) {
      if (!mounted) return;
      await showPkAlert(
        context,
        title: tr('profile.permissionRequired'),
        message: fromCamera
            ? tr('profile.cameraPermission')
            : tr('profile.libraryPermission'),
      );
      return;
    }
    setState(() => _avatarLoading = true);
    try {
      final updated =
          await ref.read(usersApiProvider).uploadAvatar(user.id, path);
      ref.read(authProvider.notifier).setUser(updated);
    } catch (_) {
      if (!mounted) return;
      await showPkAlert(
        context,
        title: tr('profile.uploadFailed'),
        message: tr('profile.uploadFailedMessage'),
      );
    } finally {
      if (mounted) setState(() => _avatarLoading = false);
    }
  }

  void _removeAvatar(Translate tr) {
    final user = ref.read(authProvider).user;
    if (user == null) return;
    showPkConfirm(
      context,
      title: tr('profile.removePhotoTitle'),
      message: tr('profile.removePhotoMessage'),
      confirmLabel: tr('profile.remove'),
      onConfirm: () async {
        setState(() => _avatarLoading = true);
        try {
          final updated = await ref
              .read(usersApiProvider)
              .removeAvatar(user.id);
          ref.read(authProvider.notifier).setUser(updated);
        } catch (_) {
          if (!mounted) return;
          await showPkAlert(
            context,
            title: tr('profile.removeFailed'),
            message: tr('profile.removeFailedMessage'),
          );
        } finally {
          if (mounted) setState(() => _avatarLoading = false);
        }
      },
    );
  }

  void _changePhoto(Translate tr) {
    showPkConfirm(
      context,
      title: tr('profile.photoTitle'),
      message: tr('profile.photoMessage'),
      confirmLabel: tr('profile.takePhoto'),
      cancelLabel: tr('profile.cancel'),
      extraActions: [
        (
          label: tr('profile.chooseFromLibrary'),
          onTap: () => _pickImage(false, tr),
        ),
        (
          label: tr('profile.removePhoto'),
          onTap: () => _removeAvatar(tr),
        ),
      ],
      onConfirm: () => _pickImage(true, tr),
    );
  }

  void _startEdit(User user) {
    _seedFrom(user);
    setState(() {
      _error = null;
      _editing = true;
    });
  }

  void _cancelEdit(User user) {
    _seedFrom(user);
    setState(() {
      _error = null;
      _editing = false;
    });
  }

  Future<void> _save(User user, Translate tr) async {
    String? clean(TextEditingController c) =>
        c.text.trim().isEmpty ? null : c.text.trim();
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final updated = await ref.read(usersApiProvider).updateUser(
            user.id,
            UpdateUserPayload(
              name: clean(_name),
              phoneNumber: clean(_phone),
              dateOfBirth: clean(_dob),
              nationality: clean(_nationality),
            ),
          );
      ref.read(authProvider.notifier).setUser(updated);
      if (!mounted) return;
      setState(() => _editing = false);
      await showPkAlert(
        context,
        title: tr('profile.profileUpdated'),
        message: tr('profile.profileUpdatedMessage'),
      );
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = tr('profile.updateFailed'));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final stats = ref.watch(dashboardProvider).stats;

    if (user == null) {
      return Scaffold(
        body: Center(
          child: Text(
            auth.isLoading ? tr('profile.loading') : tr('profile.noData'),
            style: type.body.copyWith(color: t.muted),
          ),
        ),
      );
    }

    if (!_seeded) {
      _seeded = true;
      _seedFrom(user);
    }

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(PkSpace.s24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              PkCard(
                padding: PkCardPadding.lg,
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: _avatarLoading
                          ? null
                          : () => _changePhoto(tr),
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: t.ink,
                        ),
                        clipBehavior: Clip.antiAlias,
                        alignment: Alignment.center,
                        child: _avatarLoading
                            ? SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: t.paper,
                                ),
                              )
                            : user.profilePhotoUrl?.isNotEmpty == true
                                ? Image.network(
                                    user.profilePhotoUrl!,
                                    width: 64,
                                    height: 64,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, _, _) =>
                                        _initialsText(user),
                                  )
                                : _initialsText(user),
                      ),
                    ),
                    const SizedBox(width: PkSpace.s16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name?.isNotEmpty == true
                                ? user.name!
                                : tr('profile.unnamedRider'),
                            style: type.h3,
                          ),
                          Text(
                            user.phoneNumber,
                            style: type.tabular(type.bodySm),
                          ),
                          if (user.email?.isNotEmpty == true)
                            Text(user.email!, style: type.bodySm),
                        ],
                      ),
                    ),
                    PkBadge.status(
                      userStatusToJson(user.status),
                      tr,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: PkSpace.s24),
              PkSectionCard(
                title: tr('profile.infoTitle'),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const LanguageSwitcher(),
                    const SizedBox(height: PkSpace.s16),
                    PkTextField(
                      controller: _name,
                      label: tr('profile.fullName'),
                      placeholder: tr('profile.fullNamePlaceholder'),
                      enabled: _editing,
                    ),
                    const SizedBox(height: PkSpace.s16),
                    PkTextField(
                      controller: _email,
                      label: tr('profile.email'),
                      placeholder: tr('profile.emailPlaceholder'),
                      keyboardType: TextInputType.emailAddress,
                      enabled: false,
                    ),
                    const SizedBox(height: PkSpace.s16),
                    PkTextField(
                      controller: _phone,
                      label: tr('profile.phoneNumber'),
                      placeholder: tr('profile.phonePlaceholder'),
                      keyboardType: TextInputType.phone,
                      enabled: _editing,
                    ),
                    const SizedBox(height: PkSpace.s16),
                    PkTextField(
                      controller: _dob,
                      label: tr('profile.dateOfBirth'),
                      placeholder: 'YYYY-MM-DD',
                      enabled: _editing,
                    ),
                    const SizedBox(height: PkSpace.s16),
                    PkTextField(
                      controller: _nationality,
                      label: tr('profile.nationality'),
                      placeholder: tr('profile.nationalityPlaceholder'),
                      enabled: _editing,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: PkSpace.s24),
              PkSectionCard(
                title: tr('profile.performanceTitle'),
                child: Column(
                  children: [
                    _MetaRow(
                      label: tr('profile.deliveriesToday'),
                      value: '${(stats?.completedToday ?? 0).toInt()}',
                    ),
                    _MetaRow(
                      label: tr('dashboard.bonusActivated'),
                      value: stats?.bonusActive == true
                          ? tr('common.yes')
                          : tr('common.no'),
                    ),
                    _MetaRow(
                      label: tr('dashboard.earnings'),
                      value: stats?.totalEarnings != null
                          ? formatCurrency(stats!.totalEarnings)
                          : 'RWF 0',
                      tabular: true,
                      last: true,
                    ),
                  ],
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: PkSpace.s12),
                Text(_error!, style: type.bodySm),
              ],
              const SizedBox(height: PkSpace.s16),
              if (_editing)
                Row(
                  children: [
                    Expanded(
                      child: PkButton(
                        title: tr('common.cancel'),
                        onPress: () => _cancelEdit(user),
                        variant: PkButtonVariant.outline,
                        disabled: _saving,
                      ),
                    ),
                    const SizedBox(width: PkSpace.s12),
                    Expanded(
                      child: PkButton(
                        title: tr('profile.saveChanges'),
                        onPress: () => _save(user, tr),
                        loading: _saving,
                        disabled: _saving,
                      ),
                    ),
                  ],
                )
              else
                PkButton(
                  title: tr('profile.editProfile'),
                  onPress: () => _startEdit(user),
                  icon: Icon(Icons.edit_outlined, size: 18, color: t.paper),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _initialsText(User user) {
    final t = context.tokens;
    final type = context.type;
    return Text(
      _initials(user),
      style: type.h2.copyWith(color: t.paper),
    );
  }
}

class _MetaRow extends StatelessWidget {
  final String label;
  final String value;
  final bool tabular;
  final bool last;

  const _MetaRow({
    required this.label,
    required this.value,
    this.tabular = false,
    this.last = false,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: PkSpace.s8),
      decoration: last
          ? null
          : BoxDecoration(
              border: Border(bottom: BorderSide(color: t.line)),
            ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: type.bodySm),
          Text(
            value,
            style: (tabular ? type.tabular(type.bodySm) : type.bodySm)
                .copyWith(fontWeight: PkType.medium),
          ),
        ],
      ),
    );
  }
}
