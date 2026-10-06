// Formatting helpers ported from mobile/utils/formatters.ts.
import 'dart:math' as math;

const _months = <String>[
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

String _twoDigits(int n) => n.toString().padLeft(2, '0');

String formatCurrency(
  num? amount, {
  String currency = 'RWF',
}) {
  if (amount == null || amount.isNaN) return '$currency 0';
  final isNegative = amount < 0;
  var parts = amount.abs().truncate().toString();
  final buf = StringBuffer();
  var count = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    buf.write(parts[i]);
    count++;
    if (count == 3 && i != 0) {
      buf.write(',');
      count = 0;
    }
  }
  parts = buf.toString().split('').reversed.join();
  return '$currency ${isNegative ? '-' : ''}$parts';
}

String formatDate(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'N/A';
  final date = DateTime.tryParse(dateString)?.toLocal();
  if (date == null) return 'Invalid Date';
  return '${_months[date.month - 1]} ${_twoDigits(date.day)}, ${date.year}';
}

String formatTime(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'N/A';
  final date = DateTime.tryParse(dateString)?.toLocal();
  if (date == null) return 'Invalid Time';
  return '${_twoDigits(date.hour)}:${_twoDigits(date.minute)}';
}

String formatDateTime(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'N/A';
  final date = DateTime.tryParse(dateString)?.toLocal();
  if (date == null) return 'Invalid Date';
  return '${formatDate(dateString)} ${_twoDigits(date.hour)}:${_twoDigits(date.minute)}';
}

/// Approximates date-fns `formatDistanceToNow(..., {addSuffix: true})`.
String formatRelativeTime(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'N/A';
  final date = DateTime.tryParse(dateString)?.toLocal();
  if (date == null) return 'Invalid Date';
  final diff = DateTime.now().difference(date);
  final seconds = diff.inSeconds;
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'less than a minute ago';
  final minutes = diff.inMinutes;
  if (minutes < 2) return '1 minute ago';
  if (minutes < 60) return '$minutes minutes ago';
  final hours = diff.inHours;
  if (hours < 2) return 'about 1 hour ago';
  if (hours < 24) return 'about $hours hours ago';
  final days = diff.inDays;
  if (days < 2) return '1 day ago';
  if (days < 30) return '$days days ago';
  final months = days ~/ 30;
  if (months < 2) return 'about 1 month ago';
  if (months < 12) return '$months months ago';
  final years = days ~/ 365;
  if (years < 2) return 'about 1 year ago';
  return 'about $years years ago';
}

bool _isSameDay(DateTime a, DateTime b) =>
    a.year == b.year && a.month == b.month && a.day == b.day;

String formatSmartDate(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'N/A';
  final date = DateTime.tryParse(dateString)?.toLocal();
  if (date == null) return 'Invalid Date';
  final now = DateTime.now();
  final time = '${_twoDigits(date.hour)}:${_twoDigits(date.minute)}';
  if (_isSameDay(date, now)) return 'Today, $time';
  if (_isSameDay(date, now.subtract(const Duration(days: 1)))) {
    return 'Yesterday, $time';
  }
  return '${_months[date.month - 1]} ${_twoDigits(date.day)}, $time';
}

String formatPhoneNumber(String phone) {
  final cleaned = phone.replaceAll(RegExp(r'\D'), '');
  if (cleaned.length == 10) {
    return '${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}';
  }
  if (cleaned.length == 12) {
    return '+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} '
        '${cleaned.substring(6, 9)} ${cleaned.substring(9)}';
  }
  return phone;
}

String truncateText(String text, int maxLength) {
  if (text.length <= maxLength) return text;
  return '${text.substring(0, maxLength)}...';
}

String formatDistance(double meters) {
  if (meters < 1000) return '${meters.round()} m';
  return '${(meters / 1000).toStringAsFixed(1)} km';
}

String formatEstimatedTime(double minutes) {
  if (minutes < 60) return '${minutes.round()} min';
  final hours = minutes ~/ 60;
  final remaining = (minutes % 60).round();
  return remaining > 0 ? '${hours}h ${remaining}m' : '${hours}h';
}

String formatOrderRef(String referenceId) => '#$referenceId';

/// Haversine distance in meters (ported from AssignmentDirectionsMap.tsx).
double haversineMeters(
  double lat1,
  double lon1,
  double lat2,
  double lon2,
) {
  const r = 6371000.0;
  final dLat = (lat2 - lat1) * math.pi / 180;
  final dLon = (lon2 - lon1) * math.pi / 180;
  final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(lat1 * math.pi / 180) *
          math.cos(lat2 * math.pi / 180) *
          math.sin(dLon / 2) *
          math.sin(dLon / 2);
  final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  return r * c;
}
