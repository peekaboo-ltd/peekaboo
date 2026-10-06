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

  Future<void> _logout() async {
    await ref.read(authProvider.notifier).logout();
    if (mounted) context.go('/login');
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
              child: PkCard(
                padding: PkCardPadding.lg,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
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
                              Text(
                                tr('dashboard.kicker'),
                                style: type.eyebrow,
                              ),
                            ],
                          ),
                          const SizedBox(height: PkSpace.s4),
                          Text(
                            tr('dashboard.welcomeBack'),
                            style: type.bodySm.copyWith(color: t.muted),
                          ),
                          Text(
                            user?.name?.isNotEmpty == true
                                ? user!.name!
                                : tr('dashboard.defaultRider'),
                            style: type.h3,
                          ),
                          Text(
                            tr('dashboard.readyRoutes'),
                            style: type.meta,
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: PkSpace.s8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: shiftActive ? t.ink : t.surface,
                                borderRadius: BorderRadius.circular(
                                  PkSpace.radiusPill,
                                ),
                                border: shiftActive
                                    ? null
                                    : Border.all(color: t.line),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    shiftActive
                                        ? Icons.bolt
                                        : Icons.pause_circle_outline,
                                    size: 14,
                                    color: shiftActive ? t.paper : t.muted,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    shiftActive
                                        ? tr('dashboard.shiftActive')
                                        : tr('dashboard.shiftInactive'),
                                    style: type.meta.copyWith(
                                      color: shiftActive ? t.paper : t.muted,
                                      fontWeight: PkType.medium,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: PkSpace.s4),
                            Switch(
                              value: shiftActive,
                              onChanged: _availabilityUpdating
                                  ? null
                                  : _toggleAvailability,
                            ),
                          ],
                        ),
                        const SizedBox(height: PkSpace.s8),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: t.ink,
                                borderRadius: BorderRadius.circular(
                                  PkSpace.radiusCard,
                                ),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                (user?.name?.isNotEmpty == true
                                        ? user!.name![0]
                                        : 'R')
                                    .toUpperCase(),
                                style: type.h3.copyWith(color: t.paper),
                              ),
                            ),
                            IconButton(
                              onPressed: _logout,
                              icon: Icon(
                                Icons.logout,
                                size: 22,
                                color: t.muted,
                              ),
                            ),
                          ],
                        ),
                      ],
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
                        padding: PkCardPadding.lg,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tr('dashboard.todaysFocus'),
                                        style: type.eyebrow.copyWith(
                                          color: t.paper,
                                        ),
                                      ),
                                      Text(
                                        tr('dashboard.keepMomentum'),
                                        style: type.meta.copyWith(
                                          color: t.paper,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: PkSpace.s12,
                                    vertical: PkSpace.s4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: t.paper,
                                    borderRadius: BorderRadius.circular(
                                      PkSpace.radiusPill,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.schedule,
                                        size: 14,
                                        color: t.ink,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '$pendingCount ${tr('dashboard.pending')}',
                                        style: type.meta.copyWith(
                                          color: t.ink,
                                          fontWeight: PkType.medium,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: PkSpace.s12),
                            Text(
                              tr('dashboard.stayTop'),
                              style: type.h3.copyWith(color: t.paper),
                            ),
                            const SizedBox(height: PkSpace.s12),
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tr('dashboard.earnings'),
                                        style: type.meta.copyWith(
                                          color: t.paper,
                                        ),
                                      ),
                                      Text(
                                        formatCurrency(
                                          stats?.totalEarnings ?? 0,
                                        ),
                                        style: type.tabular(
                                          type.h2.copyWith(color: t.paper),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 40,
                                  color: t.paper.withValues(alpha: 0.25),
                                ),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.only(
                                      left: PkSpace.s16,
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          tr('dashboard.completed'),
                                          style: type.meta.copyWith(
                                            color: t.paper,
                                          ),
                                        ),
                                        Text(
                                          '${(stats?.completedToday ?? 0).toInt()}',
                                          style: type.metric.copyWith(
                                            color: t.paper,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (pendingCount > 0) ...[
                              const SizedBox(height: PkSpace.s12),
                              GestureDetector(
                                onTap: () => _goAssignments('ALL'),
                                child: Container(
                                  padding: const EdgeInsets.all(
                                    PkSpace.s12,
                                  ),
                                  decoration: BoxDecoration(
                                    color: t.paper,
                                    borderRadius: BorderRadius.circular(
                                      PkSpace.radiusControl,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.notifications_outlined,
                                        size: 18,
                                        color: t.ink,
                                      ),
                                      const SizedBox(width: PkSpace.s8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              pendingCount == 1
                                                  ? tr(
                                                      'dashboard.pendingAssignment',
                                                      {
                                                        'count': pendingCount,
                                                      },
                                                    )
                                                  : tr(
                                                      'dashboard.pendingAssignments',
                                                      {
                                                        'count': pendingCount,
                                                      },
                                                    ),
                                              style: type.label.copyWith(
                                                color: t.ink,
                                              ),
                                            ),
                                            Text(
                                              tr('dashboard.tapToView'),
                                              style: type.meta.copyWith(
                                                color: t.ink,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Icon(
                                        Icons.chevron_right,
                                        size: 18,
                                        color: t.ink,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s16),
                      PkCard(
                        child: Row(
                          children: [
                            Icon(
                              Icons.location_on_outlined,
                              size: 16,
                              color: t.muted,
                            ),
                            const SizedBox(width: PkSpace.s8),
                            Expanded(
                              child: Text(
                                locationText,
                                style: type.bodySm.copyWith(color: t.muted),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s24),
                      _SectionHeader(
                        kicker: tr('dashboard.overview'),
                        title: tr('dashboard.snapshot'),
                        hint: tr('dashboard.updatedNow'),
                      ),
                      const SizedBox(height: PkSpace.s12),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: PkSpace.s16,
                        crossAxisSpacing: PkSpace.s16,
                        childAspectRatio: 1.15,
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
                            value:
                                '${(stats?.completedToday ?? 0).toInt()}',
                            icon: Icons.check_circle_outline,
                            onPress: () => _goAssignments('COMPLETED'),
                          ),
                          StatCard(
                            title: tr('dashboard.earnings'),
                            value: formatCurrency(
                              stats?.totalEarnings ?? 0,
                            ),
                            icon: Icons.payments_outlined,
                            onPress: () => _goAssignments('ALL'),
                          ),
                        ],
                      ),
                      const SizedBox(height: PkSpace.s16),
                      PkCard(
                        child: Column(
                          children: [
                            _MetaRow(
                              label: tr('profile.deliveriesToday'),
                              value:
                                  '${(stats?.completedToday ?? 0).toInt()}',
                            ),
                            _MetaRow(
                              label: tr('dashboard.bonusActivated'),
                              value: stats?.bonusActive == true
                                  ? tr('common.yes')
                                  : tr('common.no'),
                            ),
                            _MetaRow(
                              label: tr('dashboard.earnings'),
                              value: formatCurrency(
                                stats?.totalEarnings ?? 0,
                              ),
                              tabular: true,
                              last: true,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s24),
                      _SectionHeader(
                        kicker: tr('dashboard.shortcuts'),
                        title: tr('dashboard.quickActions'),
                        hint: tr('dashboard.stayOnTrack'),
                      ),
                      const SizedBox(height: PkSpace.s12),
                      PkCard(
                        onPress: () => _goAssignments('ALL'),
                        child: Row(
                          children: [
                            _ActionIcon(icon: Icons.list_alt_outlined),
                            const SizedBox(width: PkSpace.s12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tr('dashboard.viewAssignments'),
                                    style: type.label,
                                  ),
                                  Text(
                                    tr('dashboard.acceptAndStart'),
                                    style: type.meta,
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.chevron_right,
                              size: 16,
                              color: t.muted,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s12),
                      PkCard(
                        onPress: _openReportProblem,
                        child: Row(
                          children: [
                            _ActionIcon(
                              icon: Icons.warning_outlined,
                            ),
                            const SizedBox(width: PkSpace.s12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tr('dashboard.reportActionTitle'),
                                    style: type.label,
                                  ),
                                  Text(
                                    tr('dashboard.reportActionSubtitle'),
                                    style: type.meta,
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.chevron_right,
                              size: 16,
                              color: t.muted,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: PkSpace.s24),
                      _SectionHeader(
                        kicker: tr('dashboard.timeline'),
                        title: tr('dashboard.recentActivity'),
                        hint: tr('dashboard.last7Days'),
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

class _SectionHeader extends StatelessWidget {
  final String kicker;
  final String title;
  final String hint;

  const _SectionHeader({
    required this.kicker,
    required this.title,
    required this.hint,
  });

  @override
  Widget build(BuildContext context) {
    final type = context.type;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(kicker, style: type.eyebrow),
            Text(title, style: type.cardTitle),
          ],
        ),
        Text(hint, style: type.meta),
      ],
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

class _ActionIcon extends StatelessWidget {
  final IconData icon;

  const _ActionIcon({required this.icon});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
      ),
      child: Icon(icon, size: 22, color: t.ink),
    );
  }
}
