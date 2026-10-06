import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/src/utils/formatters.dart';

void main() {
  test('formatCurrency groups thousands and defaults safely', () {
    expect(formatCurrency(1234567), 'RWF 1,234,567');
    expect(formatCurrency(0), 'RWF 0');
    expect(formatCurrency(null), 'RWF 0');
    expect(formatCurrency(double.nan), 'RWF 0');
  });

  test('formatDate/formatTime handle ISO input and nulls', () {
    expect(formatDate('2026-10-06T10:20:30.000Z'), contains('Oct 06, 2026'));
    expect(formatTime(null), 'N/A');
    expect(formatDateTime('bogus'), 'Invalid Date');
  });

  test('formatSmartDate labels today and yesterday', () {
    final now = DateTime.now();
    expect(formatSmartDate(now.toIso8601String()), startsWith('Today, '));
    expect(
      formatSmartDate(
        now.subtract(const Duration(days: 1)).toIso8601String(),
      ),
      startsWith('Yesterday, '),
    );
    expect(formatSmartDate(null), 'N/A');
  });

  test('formatRelativeTime approximates date-fns buckets', () {
    final now = DateTime.now();
    expect(
      formatRelativeTime(now.toIso8601String()),
      'less than a minute ago',
    );
    expect(
      formatRelativeTime(
        now.subtract(const Duration(minutes: 5)).toIso8601String(),
      ),
      '5 minutes ago',
    );
    expect(
      formatRelativeTime(
        now.subtract(const Duration(hours: 3)).toIso8601String(),
      ),
      'about 3 hours ago',
    );
    expect(formatRelativeTime(null), 'N/A');
  });

  test('formatPhoneNumber groups 10- and 12-digit numbers', () {
    expect(formatPhoneNumber('0781234567'), '0781 234 567');
    expect(formatPhoneNumber('250781234567'), '+250 781 234 567');
    expect(formatPhoneNumber('123'), '123');
  });

  test('formatDistance/formatOrderRef', () {
    expect(formatDistance(850), '850 m');
    expect(formatDistance(1500), '1.5 km');
    expect(formatOrderRef('ABC123'), '#ABC123');
  });

  test('haversineMeters approximates Kigali distances', () {
    // ~5.5km between two Kigali points.
    final d = haversineMeters(-1.9441, 30.0619, -1.9706, 30.1044);
    expect(d, greaterThan(5000));
    expect(d, lessThan(6000));
    expect(haversineMeters(0, 0, 0, 0), 0);
  });

  test('truncateText', () {
    expect(truncateText('hello', 10), 'hello');
    expect(truncateText('hello world', 5), 'hello...');
  });
}
