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
import '../widgets/pk_icon_button.dart';
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
      confirmVariant: PkButtonVariant.destructive,
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

  void _changePhoto(Translate tr, User user) {
    showModalBottomSheet<void>(
      context: context,
      builder: (sheet) {
        final type = sheet.type;
        void run(VoidCallback action) {
          Navigator.of(sheet).pop();
          action();
        }

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(PkSpace.s24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(tr('profile.photoTitle'), style: type.cardTitle),
                const SizedBox(height: PkSpace.s16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    PkIconButton(
                      icon: Icons.photo_camera_outlined,
                      tooltip: tr('profile.takePhoto'),
                      variant: PkIconButtonVariant.outline,
                      size: PkIconButtonSize.lg,
                      circle: true,
                      onPress: () => run(() => _pickImage(true, tr)),
                    ),
                    const SizedBox(width: PkSpace.s16),
                    PkIconButton(
                      icon: Icons.photo_library_outlined,
                      tooltip: tr('profile.chooseFromLibrary'),
                      variant: PkIconButtonVariant.outline,
                      size: PkIconButtonSize.lg,
                      circle: true,
                      onPress: () => run(() => _pickImage(false, tr)),
                    ),
                    if (user.profilePhotoUrl?.isNotEmpty == true) ...[
                      const SizedBox(width: PkSpace.s16),
                      PkIconButton(
                        icon: Icons.delete_outline,
                        tooltip: tr('profile.removePhoto'),
                        variant: PkIconButtonVariant.destructive,
                        size: PkIconButtonSize.lg,
                        circle: true,
                        onPress: () => run(() => _removeAvatar(tr)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
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
          padding: const EdgeInsets.all(PkSpace.s16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              PkCard(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Semantics(
                      button: true,
                      label: tr('profile.photoTitle'),
                      child: GestureDetector(
                        onTap: _avatarLoading
                            ? null
                            : () => _changePhoto(tr, user),
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
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
                            Positioned(
                              right: -2,
                              bottom: -2,
                              child: Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: t.paper,
                                  border: Border.all(color: t.line),
                                ),
                                child: Icon(
                                  Icons.photo_camera_outlined,
                                  size: 14,
                                  color: t.ink,
                                ),
                              ),
                            ),
                          ],
                        ),
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
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: PkSpace.s4),
                          PkBadge.status(
                            userStatusToJson(user.status),
                            tr,
                          ),
                          const SizedBox(height: PkSpace.s8),
                          _ContactLine(
                            icon: Icons.call_outlined,
                            text: user.phoneNumber,
                            tabular: true,
                          ),
                          if (user.email?.isNotEmpty == true)
                            _ContactLine(
                              icon: Icons.mail_outline,
                              text: user.email!,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: PkSpace.s24),
              PkSectionCard(
                title: tr('profile.infoTitle'),
                trailing: _editing
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          PkIconButton(
                            icon: Icons.close,
                            tooltip: tr('common.cancel'),
                            onPress:
                                _saving ? null : () => _cancelEdit(user),
                          ),
                          PkIconButton(
                            icon: Icons.check,
                            tooltip: tr('profile.saveChanges'),
                            variant: PkIconButtonVariant.approve,
                            loading: _saving,
                            onPress: () => _save(user, tr),
                          ),
                        ],
                      )
                    : PkIconButton(
                        icon: Icons.edit_outlined,
                        tooltip: tr('profile.editProfile'),
                        variant: PkIconButtonVariant.outline,
                        onPress: () => _startEdit(user),
                      ),
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
                Row(
                  children: [
                    Icon(Icons.error_outline, size: 16, color: t.danger.main),
                    const SizedBox(width: PkSpace.s8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: type.bodySm.copyWith(color: t.danger.main),
                      ),
                    ),
                  ],
                ),
              ],
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

/// One contact line in the profile header: icon plus a single ellipsized
/// line, so long emails never break mid-word.
class _ContactLine extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool tabular;

  const _ContactLine({
    required this.icon,
    required this.text,
    this.tabular = false,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Row(
        children: [
          Icon(icon, size: 14, color: t.muted),
          const SizedBox(width: PkSpace.s8),
          Expanded(
            child: Text(
              text,
              style: (tabular ? type.tabular(type.bodySm) : type.bodySm)
                  .copyWith(color: t.muted),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
