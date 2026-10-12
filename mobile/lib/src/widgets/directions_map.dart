import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../i18n/localizations.dart';
import '../theme/tokens.dart';
import '../utils/formatters.dart';
import 'pk_icon_button.dart';

/// Directions preview ported from AssignmentDirectionsMap.tsx: an embedded
/// Google Maps directions page plus an external deep link. No map SDK.
class DirectionsMap extends ConsumerStatefulWidget {
  final double originLat;
  final double originLng;
  final double destLat;
  final double destLng;
  final VoidCallback? onClose;

  const DirectionsMap({
    super.key,
    required this.originLat,
    required this.originLng,
    required this.destLat,
    required this.destLng,
    this.onClose,
  });

  @override
  ConsumerState<DirectionsMap> createState() => _DirectionsMapState();
}

class _DirectionsMapState extends ConsumerState<DirectionsMap> {
  late final WebViewController _controller;

  String get _url =>
      'https://www.google.com/maps/dir/${widget.originLat},${widget.originLng}/${widget.destLat},${widget.destLng}';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse(_url));
  }

  Future<void> _openExternal() async {
    final uri = Uri.parse(_url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final type = context.type;
    final tr = ref.watch(tProvider);
    final distance = haversineMeters(
      widget.originLat,
      widget.originLng,
      widget.destLat,
      widget.destLng,
    );

    return Padding(
      padding: const EdgeInsets.all(PkSpace.s16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(tr('map.approxDistance'), style: type.bodySm),
              Text(formatDistance(distance), style: type.label),
            ],
          ),
          const SizedBox(height: PkSpace.s8),
          ClipRRect(
            borderRadius: BorderRadius.circular(PkSpace.radiusCard),
            child: SizedBox(
              height: 260,
              width: double.infinity,
              child: WebViewWidget(controller: _controller),
            ),
          ),
          const SizedBox(height: PkSpace.s16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              PkIconButton(
                icon: Icons.open_in_new,
                tooltip: tr('map.openGoogleMaps'),
                variant: PkIconButtonVariant.outline,
                onPress: _openExternal,
              ),
              if (widget.onClose != null)
                PkIconButton(
                  icon: Icons.close,
                  tooltip: tr('common.close'),
                  onPress: widget.onClose,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
