import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';

import '../api/dashboard_api.dart';
import '../api/users_api.dart';
import '../i18n/localizations.dart';
import '../models/user.dart';
import '../services/media_service.dart';
import '../state/auth_state.dart';
import '../state/dashboard_state.dart';
import '../theme/tokens.dart';
import '../utils/app_error.dart';
import '../utils/formatters.dart';
import '../widgets/dialogs.dart';
import '../widgets/error_view.dart';
import '../widgets/pk_card.dart';
import '../widgets/pk_icon_button.dart';
import '../widgets/pk_page_header.dart';
import '../widgets/recent_activity.dart';
import '../widgets/stat_card.dart';
import 'proof_sheet.dart';
import 'report_sheet.dart';

String _displayTimestamp(DateTime when) {
  final l = when.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${l.year}-${two(l.month)}-${two(l.day)} ${two(l.hour)}:${two(l.minute)}';
}

/// Dashboard ported from mobile/app/(tabs)/dashboard.tsx: greeting + shift
/// control, hero focus card, snapshot stats, quick actions (assignments,
/// report problem), recent activity, and the check-in/out proof flow.
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Timer? _poll;
  bool _availabilityUpdating = false;
  UserStatus? _pendingStatus;
  ValueNotifier<ProofDraft>? _proof;
  ValueNotifier<ReportDraft>? _report;

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(dashboardProvider.notifier).fetchData(),
    );
    _poll = Timer.periodic(
      const Duration(seconds: 30),
      (_) => ref.read(dashboardProvider.notifier).refresh(),
    );
  }

  @override
  void dispose() {
    _poll?.cancel();
    _proof?.dispose();
    _report?.dispose();
    super.dispose();
  }

  Translate get _tr => ref.read(tProvider);

  Future<bool> _ensureLocationPermission() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      if (!mounted) return false;
      await showPkAlert(
        context,
        title: _tr('dashboard.permissionLocationTitle'),
        message: _tr('dashboard.permissionLocationMessage'),
      );
      return false;
    }
    return true;
  }

  void _goAssignments(String filter) {
    context.go('/assignments?filter=$filter');
  }

  // --- Availability / check-in-out proof flow ---

  Future<void> _toggleAvailability(bool value) async {
    final user = ref.read(authProvider).user;
    if (user == null || _availabilityUpdating) return;
    setState(() => _availabilityUpdating = true);
    final nextStatus = value ? UserStatus.active : UserStatus.inactive;
    try {
      if (!await _ensureLocationPermission()) return;
      final media = ref.read(mediaServiceProvider);
      final position = await media.currentPosition();
      if (position == null || !mounted) return;
      final label = await media.addressLabel(
        position.latitude,
        position.longitude,
      );
      if (!mounted) return;
      String? photoPath;
      try {
        final photo = await media.takePhoto();
        photoPath = photo?.path;
      } catch (_) {
        photoPath = null;
      }
      if (photoPath == null) {
        if (!mounted) return;
        await showPkAlert(
          context,
          title: _tr('dashboard.permissionCameraTitle'),
          message: _tr('dashboard.permissionCameraMessage'),
        );
        return;
      }
      final capturedAt = DateTime.now().toUtc();
      _pendingStatus = nextStatus;
      _proof?.dispose();
      _proof = ValueNotifier(
        ProofDraft(
          imageUri: photoPath,
          timestamp: _displayTimestamp(capturedAt),
          capturedAt: capturedAt.toIso8601String(),
          locationLabel: label,
          latitude: position.latitude,
          longitude: position.longitude,
        ),
      );
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => ProofSheet(
            draftListenable: _proof!,
            actionLabel: nextStatus == UserStatus.active
                ? _tr('dashboard.proofSendCheckIn')
                : _tr('dashboard.proofSendCheckOut'),
            onRetake: _retakeProofPhoto,
            onSave: _saveProof,
            onSend: _submitAvailability,
            onClose: () {
              _pendingStatus = null;
              Navigator.of(context).pop();
            },
          ),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      await showPkAlert(
        context,
        title: _tr('dashboard.updateFailedTitle'),
        message: _tr('dashboard.updateFailedMessage'),
      );
    } finally {
      if (mounted) setState(() => _availabilityUpdating = false);
    }
  }

  Future<void> _retakeProofPhoto() async {
    await showPkConfirm(
      context,
      title: _tr('dashboard.proofRetakeTitle'),
      message: _tr('dashboard.proofRetakeMessage'),
      confirmLabel: _tr('common.ok'),
      onConfirm: () async {
        try {
          final photo = await ref.read(mediaServiceProvider).takePhoto();
          if (photo == null) return;
          final capturedAt = DateTime.now().toUtc();
          _proof?.value = _proof!.value.copyWith(
            imageUri: photo.path,
            capturedAt: capturedAt.toIso8601String(),
            timestamp: _displayTimestamp(capturedAt),
          );
        } catch (_) {
          if (!mounted) return;
          await showPkAlert(
            context,
            title: _tr('dashboard.permissionCameraTitle'),
            message: _tr('dashboard.permissionCameraMessage'),
          );
        }
      },
    );
  }

  Future<bool> _saveProof() async {
    final uri = _proof?.value.imageUri;
    if (uri == null) return false;
    final media = ref.read(mediaServiceProvider);
    try {
      var granted = await media.hasGalleryAccess();
      if (!granted) granted = await media.requestGalleryAccess();
      if (!granted) {
        if (!mounted) return false;
        await showPkAlert(
          context,
          title: _tr('dashboard.permissionRequiredTitle'),
          message: _tr('dashboard.photoLibraryPermissionMessage'),
        );
        return false;
      }
      await media.saveToProofsAlbum(uri);
      if (!mounted) return true;
      await showPkAlert(
        context,
        title: _tr('dashboard.savedTitle'),
        message: _tr(
          'dashboard.savedMessage',
          {'albumName': 'Peekaboo Proofs'},
        ),
      );
      return true;
    } catch (e) {
      if (!mounted) return false;
      final detail = e.toString().isNotEmpty
          ? e.toString()
          : _tr('dashboard.saveFailedMessage');
      await showPkAlert(
        context,
        title: _tr('dashboard.saveFailedTitle'),
        message: detail,
      );
      return false;
    }
  }

  Future<bool> _submitAvailability() async {
    final user = ref.read(authProvider).user;
    final draft = _proof?.value;
    final requested = _pendingStatus;
    if (user == null || draft == null || requested == null) return false;
    try {
      final updated = await ref.read(usersApiProvider).updateMyStatusWithProof(
            StatusWithProofPayload(
              status: requested,
              latitude: draft.latitude,
              longitude: draft.longitude,
              locationLabel: draft.locationLabel,
              capturedAt: draft.capturedAt,
              proofImagePath: draft.imageUri,
              overlayTimestamp: draft.timestamp,
              overlayLocationLabel: draft.locationLabel,
              overlayAppliedOnClient: false,
            ),
          );
      ref
          .read(authProvider.notifier)
          .setUser(updated.copyWith(status: requested));
      ref.read(dashboardProvider.notifier).refresh().ignore();
      _pendingStatus = null;
      if (mounted) Navigator.of(context).pop();
      return true;
    } catch (e) {
      if (!mounted) return false;
      await showPkAlert(
        context,
        title: _tr('dashboard.updateFailedTitle'),
        message:
            serverMessage(e) ?? _tr('dashboard.checkProofFailed'),
      );
      return false;
    }
  }

  // --- Report problem / receipt flow ---

  void _openReportProblem() {
    showPkConfirm(
      context,
      title: _tr('dashboard.reportOpenTitle'),
      message: _tr('dashboard.reportOpenMessage'),
      confirmLabel: _tr('dashboard.mediaVideo'),
      cancelLabel: _tr('common.cancel'),
      extraActions: [
        (
          label: _tr('dashboard.mediaPhoto'),
          onTap: () => _launchReportCamera(ReportMediaType.image),
        ),
      ],
      onConfirm: () => _launchReportCamera(ReportMediaType.video),
    );
  }

  Future<void> _launchReportCamera(ReportMediaType capture) async {
    if (!await _ensureLocationPermission()) return;
    final media = ref.read(mediaServiceProvider);
    final position = await media.currentPosition();
    if (position == null || !mounted) return;
    final label = await media.addressLabel(
      position.latitude,
      position.longitude,
    );
    if (!mounted) return;
    String? path;
    ReportMediaType actual = capture;
    try {
      final picked = capture == ReportMediaType.video
          ? await media.takeVideo()
          : await media.takePhoto();
      path = picked?.path;
      if (path != null && capture == ReportMediaType.video) {
        actual = ReportMediaType.video;
      }
    } catch (_) {
      path = null;
    }
    if (path == null) {
      if (!mounted) return;
      await showPkAlert(
        context,
        title: _tr('dashboard.permissionCameraTitle'),
        message: _tr('dashboard.permissionCameraMessage'),
      );
      return;
    }
    final draft = ReportDraft(
      mediaUri: path,
      mediaType: actual,
      timestamp: _displayTimestamp(DateTime.now().toUtc()),
      locationLabel: label,
    );
    if (_report == null) {
      _report = ValueNotifier(draft);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => ReportSheet(
            draftListenable: _report!,
            onSend: _sendReport,
            onRetake: _retakeReport,
            onClose: () {
              _report?.dispose();
              _report = null;
              Navigator.of(context).pop();
            },
          ),
        ),
      );
    } else {
      _report!.value = draft;
    }
  }

  void _retakeReport() {
    showPkConfirm(
      context,
      title: _tr('dashboard.reportRetakeTitle'),
      message: _tr('dashboard.reportRetakeMessage'),
      confirmLabel: _tr('dashboard.reportRetake'),
      onConfirm: () {
        final current =
            _report?.value.mediaType ?? ReportMediaType.image;
        _launchReportCamera(current);
      },
    );
  }

  Future<bool> _sendReport(
    ReportCategory category,
    String description,
  ) async {
    final draft = _report?.value;
    if (draft == null) return false;
    final prefix = category == ReportCategory.problem
        ? '[${_tr('dashboard.reportProblem')}]'
        : '[${_tr('dashboard.reportReceipt')}]';
    final full = '$prefix ${description.trim()}';
    try {
      await ref.read(dashboardApiProvider).submitProblemReport(
            ProblemReportPayload(
              description: full,
              submissionType:
                  category == ReportCategory.receipt ? 'RECEIPT' : 'PROBLEM',
              capturedAt: DateTime.now().toUtc().toIso8601String(),
              mediaType: draft.mediaType == ReportMediaType.video
                  ? 'video'
                  : 'image',
              evidencePath: draft.mediaUri,
              locationLabel: draft.locationLabel,
            ),
          );
      final preview = ReportSubmissionPreview(
        category: category,
        mediaUri: draft.mediaUri,
        mediaType: draft.mediaType,
        description: full,
        timestamp: draft.timestamp.isEmpty
            ? _displayTimestamp(DateTime.now().toUtc())
            : draft.timestamp,
        locationLabel: draft.locationLabel.isEmpty
            ? _tr('dashboard.reportLocationUnavailable')
            : draft.locationLabel,
      );
      _report?.dispose();
      _report = null;
      if (!mounted) return true;
      Navigator.of(context).pop(); // Close the report sheet.
      await Navigator.of(context).push(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => SubmissionPreviewSheet(preview: preview),
        ),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final user = ref.watch(authProvider).user;
    final dash = ref.watch(dashboardProvider);
    final stats = dash.stats;
    final pendingCount = dash.pendingCount.toInt();

    final collectedAt = user?.currentLocation?.collectedAt;
    final String locationText;
    if (collectedAt == null || collectedAt.isEmpty) {
      locationText = tr('dashboard.locationWaiting');
    } else {
      final parsed = DateTime.tryParse(collectedAt)?.toLocal();
      locationText = parsed == null
          ? tr('dashboard.locationRecent')
          : tr(
              'dashboard.lastLocationCollected',
              {'date': _displayTimestamp(parsed)},
            );
    }

    final displayStatus =
        _pendingStatus ?? user?.status ?? UserStatus.inactive;
    final shiftActive = displayStatus == UserStatus.active;
    final hero = PkTokens.inverted(Theme.of(context).brightness);
    final earnings = formatCurrency(stats?.totalEarnings ?? 0);
    final completed = '${(stats?.completedToday ?? 0).toInt()}';

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                PkSpace.s16,
                PkSpace.s16,
                PkSpace.s16,
                PkSpace.s8,
              ),
              child: PkPageHeader(
                title:
                    '${tr('dashboard.welcomeBack')} ${user?.name?.isNotEmpty == true ? user!.name! : tr('dashboard.defaultRider')}',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    PkIconButton(
                      icon: Icons.report_gmailerrorred_outlined,
                      tooltip: tr('dashboard.reportActionTitle'),
                      variant: PkIconButtonVariant.outline,
                      onPress: _openReportProblem,
                    ),
                    const SizedBox(width: PkSpace.s4),
                    _ShiftSwitch(
                      active: shiftActive,
                      label: shiftActive
                          ? tr('dashboard.shiftActive')
                          : tr('dashboard.shiftInactive'),
                      onChanged: _availabilityUpdating
                          ? null
                          : _toggleAvailability,
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                color: t.ink,
                onRefresh: () =>
                    ref.read(dashboardProvider.notifier).refresh(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(
                    PkSpace.s16,
                    PkSpace.s8,
                    PkSpace.s16,
                    PkSpace.s48,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      PkCard(
                        variant: PkCardVariant.inverted,
                        padding: PkCardPadding.md,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              children: [
                                _HeroChip(
                                  ground: hero,
                                  icon: Icons.schedule,
                                  text: '$pendingCount',
                                  tooltip: pendingCount == 1
                                      ? tr('dashboard.pendingAssignment',
                                          {'count': pendingCount})
                                      : tr('dashboard.pendingAssignments',
                                          {'count': pendingCount}),
                                  onTap: () => _goAssignments('PENDING'),
                                ),
                                if (stats?.bonusActive == true) ...[
                                  const SizedBox(width: PkSpace.s8),
                                  _HeroChip(
                                    ground: hero,
                                    icon: Icons.workspace_premium_outlined,
                                    tooltip: tr('dashboard.bonusActivated'),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: PkSpace.s20),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Expanded(
                                  child: _HeroFigure(
                                    ground: hero,
                                    icon: Icons.payments_outlined,
                                    label: tr('dashboard.earnings'),
                                    value: earnings,
                                    style: type.tabular(type.h2),
                                  ),
                                ),
                                const SizedBox(width: PkSpace.s16),
                                _HeroFigure(
                                  ground: hero,
                                  icon: Icons.check_circle_outline,
                                  label: tr('dashboard.completed'),
                                  value: completed,
                                  style: type.metric,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s12),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 14,
                            color: t.muted,
                          ),
                          const SizedBox(width: PkSpace.s4),
                          Expanded(
                            child: Text(
                              locationText,
                              style: type.meta,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: PkSpace.s24),
                      Text(tr('dashboard.snapshot'), style: type.cardTitle),
                      const SizedBox(height: PkSpace.s12),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: PkSpace.s12,
                        crossAxisSpacing: PkSpace.s12,
                        childAspectRatio: 2.1,
                        children: [
                          StatCard(
                            title: tr('dashboard.deliveries'),
                            value:
                                '${(stats?.todayDeliveries ?? 0).toInt()}',
                            icon: Icons.pedal_bike_outlined,
                            onPress: () => _goAssignments('ALL'),
                          ),
                          StatCard(
                            title: tr('assignments.pending'),
                            value:
                                '${(stats?.pendingAssignments ?? pendingCount).toInt()}',
                            icon: Icons.schedule_outlined,
                            onPress: () => _goAssignments('PENDING'),
                          ),
                          StatCard(
                            title: tr('assignments.completed'),
                            value: completed,
                            icon: Icons.check_circle_outline,
                            onPress: () => _goAssignments('COMPLETED'),
                          ),
                          StatCard(
                            title: tr('dashboard.earnings'),
                            value: earnings,
                            icon: Icons.payments_outlined,
                            onPress: () => _goAssignments('ALL'),
                          ),
                        ],
                      ),
                      const SizedBox(height: PkSpace.s24),
                      Text(
                        tr('dashboard.recentActivity'),
                        style: type.cardTitle,
                      ),
                      const SizedBox(height: PkSpace.s12),
                      RecentActivityList(
                        activities: dash.recentActivity,
                        onActivityPress: (activity) {
                          if (activity.assignmentId != null &&
                              activity.assignmentId!.isNotEmpty) {
                            context.push(
                              '/assignment/${activity.assignmentId}',
                            );
                          }
                        },
                      ),
                      if (dash.error != null &&
                          dash.error!.isNotEmpty) ...[
                        const SizedBox(height: PkSpace.s16),
                        ErrorView(
                          message: dash.error!,
                          retryLabel: tr('common.retry'),
                          onRetry: () => ref
                              .read(dashboardProvider.notifier)
                              .refresh(),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Shift on/off as one switch: green-700 track with a bolt thumb when on,
/// a quiet track with a pause thumb when off. The state name is the tooltip.
class _ShiftSwitch extends StatelessWidget {
  final bool active;
  final String label;
  final ValueChanged<bool>? onChanged;

  const _ShiftSwitch({
    required this.active,
    required this.label,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Tooltip(
      message: label,
      child: Semantics(
        label: label,
        child: Switch(
          value: active,
          onChanged: onChanged,
          trackColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.selected)
                ? t.approve.main
                : t.surface,
          ),
          trackOutlineColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.selected)
                ? t.approve.main
                : t.lineStrong,
          ),
          thumbColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.selected)
                ? t.onConsequence
                : t.muted,
          ),
          thumbIcon: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.selected)
                ? Icon(Icons.bolt, color: t.approve.main)
                : Icon(Icons.pause, color: t.paper),
          ),
        ),
      ),
    );
  }
}

/// Icon (+ optional count) chip on the inverted hero; tappable when [onTap]
/// is given. The meaning is carried by the icon and the tooltip.
class _HeroChip extends StatelessWidget {
  final PkTokens ground;
  final IconData icon;
  final String? text;
  final String tooltip;
  final VoidCallback? onTap;

  const _HeroChip({
    required this.ground,
    required this.icon,
    required this.tooltip,
    this.text,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final type = context.type;
    return Semantics(
      label: tooltip,
      button: onTap != null,
      onTap: onTap,
      excludeSemantics: true,
      child: Tooltip(
        message: tooltip,
        excludeFromSemantics: true,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            height: 32,
            padding: const EdgeInsets.symmetric(horizontal: PkSpace.s12),
            decoration: BoxDecoration(
              color: ground.ink,
              borderRadius: BorderRadius.circular(PkSpace.radiusPill),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 16, color: ground.paper),
                if (text != null) ...[
                  const SizedBox(width: 6),
                  Text(
                    text!,
                    style: type.tabular(type.label).copyWith(
                          color: ground.paper,
                        ),
                  ),
                ],
                if (onTap != null) ...[
                  const SizedBox(width: 2),
                  Icon(Icons.chevron_right, size: 16, color: ground.paper),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// A hero figure: small muted icon over the value, label in semantics.
class _HeroFigure extends StatelessWidget {
  final PkTokens ground;
  final IconData icon;
  final String label;
  final String value;
  final TextStyle style;

  const _HeroFigure({
    required this.ground,
    required this.icon,
    required this.label,
    required this.value,
    required this.style,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label: $value',
      excludeSemantics: true,
      child: Tooltip(
        message: label,
        excludeFromSemantics: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: ground.muted),
            const SizedBox(height: PkSpace.s4),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                style: style.copyWith(color: ground.ink),
                maxLines: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
