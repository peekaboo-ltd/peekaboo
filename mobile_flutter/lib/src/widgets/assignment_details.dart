import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../api/boundaries_api.dart';
import '../i18n/localizations.dart';
import '../models/assignment.dart';
import '../models/order.dart';
import '../theme/tokens.dart';
import '../utils/formatters.dart';
import 'assignment_card.dart' show assignmentStatusLabel;
import 'directions_map.dart';
import 'pk_badge.dart';
import 'pk_button.dart';
import 'pk_card.dart';

/// Full order/customer/location/payment breakdown ported from
/// AssignmentDetails.tsx, including the Rwanda admin-boundary label lookup.
class AssignmentDetails extends ConsumerWidget {
  final Assignment assignment;

  const AssignmentDetails({super.key, required this.assignment});

  Future<void> _openDialer(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openMaps(double lat, double lng) async {
    final url = Platform.isIOS ? 'maps:0,0?q=$lat,$lng' : 'geo:0,0?q=$lat,$lng';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _showRoute(BuildContext context, Translate tr) {
    final order = assignment.order;
    if (order?.locationFrom == null || order?.locationTo == null) return;
    showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  PkSpace.s20,
                  PkSpace.s20,
                  PkSpace.s20,
                  PkSpace.s8,
                ),
                child: Text(
                  tr('assignmentInfo.routeModalTitle'),
                  style: context.type.cardTitle,
                ),
              ),
              DirectionsMap(
                originLat: order!.locationFrom!.latitude,
                originLng: order.locationFrom!.longitude,
                destLat: order.locationTo!.latitude,
                destLng: order.locationTo!.longitude,
                onClose: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.tokens;
    final type = context.type;
    final tr = ref.watch(tProvider);
    final a = assignment;
    final order = a.order;
    final senderPhone = order?.sender?.phoneNumber ?? order?.senderPhoneNumber;
    final recipientPhone =
        order?.recipient?.phoneNumber ?? order?.recipientPhoneNumber;

    return Column(
      children: [
        PkCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionTitle(text: tr('assignmentInfo.orderInformation')),
              _Row(
                label: tr('assignmentInfo.orderId'),
                value: order != null && order.referenceId.isNotEmpty
                    ? formatOrderRef(order.referenceId)
                    : '-',
              ),
              _Row(
                label: tr('assignmentInfo.assignment'),
                trailing: PkBadge.assignment(
                  a.status,
                  assignmentStatusLabel(a.status, tr),
                ),
              ),
              if (order != null)
                _Row(
                  label: tr('assignmentInfo.orderStatus'),
                  value: orderStatusLabel(order.latestStatus),
                ),
              _Row(
                label: tr('assignmentInfo.created'),
                value: formatDateTime(a.createdAt),
              ),
              _Row(
                label: tr('assignmentInfo.senderNumber'),
                value: senderPhone != null
                    ? formatPhoneNumber(senderPhone)
                    : tr('assignmentInfo.na'),
                tabular: true,
              ),
              _Row(
                label: tr('assignmentInfo.receiverNumber'),
                value: recipientPhone != null
                    ? formatPhoneNumber(recipientPhone)
                    : tr('assignmentInfo.na'),
                tabular: true,
                last: a.description == null,
              ),
              if (a.description != null && a.description!.isNotEmpty)
                _Row(
                  label: tr('assignmentInfo.notes'),
                  value: a.description!,
                  last: true,
                ),
            ],
          ),
        ),
        if (order?.recipient != null) ...[
          const SizedBox(height: PkSpace.s16),
          PkCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SectionTitle(
                  text: tr('assignmentInfo.customerInformation'),
                ),
                _Row(
                  label: tr('assignmentInfo.name'),
                  value: order!.recipient!.name?.isNotEmpty == true
                      ? order.recipient!.name!
                      : tr('assignmentInfo.na'),
                ),
                if (order.recipient!.phoneNumber.isNotEmpty)
                  _Row(
                    label: tr('assignmentInfo.phone'),
                    value: formatPhoneNumber(
                      order.recipient!.phoneNumber,
                    ),
                    tabular: true,
                    last: true,
                    trailingAction: IconButton(
                      onPressed: () =>
                          _openDialer(order.recipient!.phoneNumber),
                      icon: Icon(Icons.call, size: 18, color: t.ink),
                    ),
                  ),
              ],
            ),
          ),
        ],
        if (order != null &&
            (order.locationFrom != null || order.locationTo != null)) ...[
          const SizedBox(height: PkSpace.s16),
          PkCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SectionTitle(text: tr('assignmentInfo.locations')),
                if (order.locationFrom != null &&
                    order.locationTo != null) ...[
                  PkButton(
                    title: tr('assignmentInfo.showRoute'),
                    onPress: () => _showRoute(context, tr),
                    variant: PkButtonVariant.outline,
                    size: PkButtonSize.sm,
                    icon: Icon(Icons.map_outlined, size: 16, color: t.ink),
                  ),
                  const SizedBox(height: PkSpace.s16),
                ],
                if (order.locationFrom != null)
                  _LocationBlock(
                    dotFilled: true,
                    label: tr('assignment.pickupLocation'),
                    latitude: order.locationFrom!.latitude,
                    longitude: order.locationFrom!.longitude,
                    directionsLabel: tr('assignmentInfo.getDirections'),
                    onDirections: () => _openMaps(
                      order.locationFrom!.latitude,
                      order.locationFrom!.longitude,
                    ),
                  ),
                if (order.locationFrom != null && order.locationTo != null)
                  const SizedBox(height: PkSpace.s16),
                if (order.locationTo != null)
                  _LocationBlock(
                    dotFilled: false,
                    label: tr('assignment.deliveryLocation'),
                    latitude: order.locationTo!.latitude,
                    longitude: order.locationTo!.longitude,
                    directionsLabel: tr('assignmentInfo.getDirections'),
                    onDirections: () => _openMaps(
                      order.locationTo!.latitude,
                      order.locationTo!.longitude,
                    ),
                  ),
              ],
            ),
          ),
        ],
        if (order != null) ...[
          const SizedBox(height: PkSpace.s16),
          PkCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SectionTitle(
                  text: tr('assignmentInfo.paymentInformation'),
                ),
                _Row(
                  label: tr('assignmentInfo.initialFee'),
                  value: formatCurrency(order.initialFee),
                  tabular: true,
                ),
                if (order.discount > 0)
                  _Row(
                    label: tr('assignmentInfo.discount'),
                    value: '-${formatCurrency(order.discount)}',
                    tabular: true,
                  ),
                Container(
                  margin: const EdgeInsets.only(top: PkSpace.s8),
                  padding: const EdgeInsets.only(top: PkSpace.s16),
                  decoration: BoxDecoration(
                    border: Border(top: BorderSide(color: t.line)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        tr('assignmentInfo.total'),
                        style: type.body.copyWith(fontWeight: PkType.medium),
                      ),
                      Text(
                        formatCurrency(
                          order.finalFee ??
                              ((order.initialFee ?? 0) - order.discount)
                                  .clamp(0, double.infinity),
                        ),
                        style: type.tabular(type.h3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;

  const _SectionTitle({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: PkSpace.s16),
      child: Text(text, style: context.type.label),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String? value;
  final Widget? trailing;
  final Widget? trailingAction;
  final bool tabular;
  final bool last;

  const _Row({
    required this.label,
    this.value,
    this.trailing,
    this.trailingAction,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: Text(label, style: type.bodySm)),
          const SizedBox(width: PkSpace.s8),
          if (trailing != null)
            trailing!
          else
            Expanded(
              flex: 2,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Flexible(
                    child: Text(
                      value ?? '',
                      style: (tabular ? type.tabular(type.bodySm) : type.bodySm)
                          .copyWith(fontWeight: PkType.medium),
                      textAlign: TextAlign.right,
                    ),
                  ),
                  trailingAction ?? const SizedBox.shrink(),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _LocationBlock extends StatelessWidget {
  final bool dotFilled;
  final String label;
  final double latitude;
  final double longitude;
  final String directionsLabel;
  final VoidCallback onDirections;

  const _LocationBlock({
    required this.dotFilled,
    required this.label,
    required this.latitude,
    required this.longitude,
    required this.directionsLabel,
    required this.onDirections,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final type = context.type;
    return Container(
      padding: const EdgeInsets.all(PkSpace.s16),
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.circular(PkSpace.radiusCard),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: dotFilled ? t.ink : Colors.transparent,
                  border: Border.all(color: t.ink),
                ),
              ),
              const SizedBox(width: PkSpace.s8),
              Text(label, style: type.label),
            ],
          ),
          const SizedBox(height: PkSpace.s8),
          _AdminLabel(latitude: latitude, longitude: longitude),
          const SizedBox(height: PkSpace.s8),
          PkButton(
            title: directionsLabel,
            onPress: onDirections,
            variant: PkButtonVariant.outline,
            size: PkButtonSize.sm,
            icon: Icon(Icons.navigation_outlined, size: 16, color: t.ink),
          ),
        ],
      ),
    );
  }
}

final _adminLabelProvider =
    FutureProvider.family<String?, ({double lat, double lng})>((ref, coords) {
  return ref.watch(boundariesApiProvider).administrativeLabel(
        latitude: coords.lat,
        longitude: coords.lng,
      );
});

class _AdminLabel extends ConsumerWidget {
  final double latitude;
  final double longitude;

  const _AdminLabel({required this.latitude, required this.longitude});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fallback =
        '${latitude.toStringAsFixed(5)}, ${longitude.toStringAsFixed(5)}';
    final label = ref
        .watch(_adminLabelProvider((lat: latitude, lng: longitude)))
        .maybeWhen(data: (value) => value, orElse: () => null);
    return Text(
      label ?? fallback,
      style: context.type.bodySm.copyWith(color: context.tokens.muted),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }
}
