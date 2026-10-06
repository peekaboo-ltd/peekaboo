import 'package:flutter/material.dart';

/// Peekaboo design tokens ported from DESIGN.md §§1–5 for Flutter.
/// Semantic (not literal): dark mode mirrors light by swapping paper/ink.
///
/// Hard constraints enforced here: monochrome structure, inversion-only
/// selection, DM Sans only, 400 default / 500 ceiling, no gradients,
/// press = full-surface inset overlay (never a transform), borders over
/// shadows (only menus/popovers/modals cast one).
class PkTokens {
  final Brightness brightness;

  final Color paper;
  final Color ink;
  final Color surface;
  final Color surfaceHover;
  final Color surfaceSunken;
  final Color line;
  final Color lineStrong;
  final Color muted;
  final Color mutedWeak;
  final Color disabledFg;
  final Color pressOnInk;
  final Color pressOnPaper;
  final Color overlay;
  final List<BoxShadow> shadowMenu;
  final List<BoxShadow> shadowModal;

  const PkTokens._({
    required this.brightness,
    required this.paper,
    required this.ink,
    required this.surface,
    required this.surfaceHover,
    required this.surfaceSunken,
    required this.line,
    required this.lineStrong,
    required this.muted,
    required this.mutedWeak,
    required this.disabledFg,
    required this.pressOnInk,
    required this.pressOnPaper,
    required this.overlay,
    required this.shadowMenu,
    required this.shadowModal,
  });

  factory PkTokens.light() => const PkTokens._(
        brightness: Brightness.light,
        paper: Color(0xFFFFFFFF),
        ink: Color(0xFF000000),
        surface: Color(0xFFF3F3F3),
        surfaceHover: Color(0xFFE2E2E2),
        surfaceSunken: Color(0xFFFAFAFA),
        line: Color(0xFFE2E2E2),
        lineStrong: Color(0xFFAFAFAF),
        muted: Color(0xFF6E6E6E),
        mutedWeak: Color(0xFF757575),
        disabledFg: Color(0xFFAFAFAF),
        pressOnInk: Color.fromRGBO(255, 255, 255, 0.20),
        pressOnPaper: Color.fromRGBO(0, 0, 0, 0.08),
        overlay: Color.fromRGBO(0, 0, 0, 0.60),
        shadowMenu: [
          BoxShadow(
            offset: Offset(0, 4),
            blurRadius: 16,
            color: Color.fromRGBO(0, 0, 0, 0.16),
          ),
        ],
        shadowModal: [
          BoxShadow(
            offset: Offset(0, 8),
            blurRadius: 40,
            color: Color.fromRGBO(0, 0, 0, 0.24),
          ),
        ],
      );

  factory PkTokens.dark() => const PkTokens._(
        brightness: Brightness.dark,
        paper: Color(0xFF000000),
        ink: Color(0xFFFFFFFF),
        surface: Color(0xFF141414),
        surfaceHover: Color(0xFF232323),
        surfaceSunken: Color(0xFF0A0A0A),
        line: Color(0xFF2E2E2E),
        lineStrong: Color(0xFF5E5E5E),
        muted: Color(0xFFA3A3A3),
        mutedWeak: Color(0xFF8F8F8F),
        disabledFg: Color(0xFF5E5E5E),
        // Overlays do NOT flip with theme — chosen by the surface the
        // control sits on (DESIGN.md §2).
        pressOnInk: Color.fromRGBO(255, 255, 255, 0.20),
        pressOnPaper: Color.fromRGBO(0, 0, 0, 0.08),
        overlay: Color.fromRGBO(0, 0, 0, 0.72),
        shadowMenu: [
          BoxShadow(
            offset: Offset(0, 4),
            blurRadius: 16,
            color: Color.fromRGBO(0, 0, 0, 0.55),
          ),
        ],
        shadowModal: [
          BoxShadow(
            offset: Offset(0, 8),
            blurRadius: 40,
            color: Color.fromRGBO(0, 0, 0, 0.70),
          ),
        ],
      );

  bool get isDark => brightness == Brightness.dark;
}

/// Type scale ported from DESIGN.md §3.2. Compose these roles — never an
/// ad-hoc size. 400 is the default, 500 the ceiling, 300 only at display
/// sizes. 12px is the floor. No letter-spacing anywhere.
class PkType {
  final PkTokens t;

  const PkType(this.t);

  static const family = 'DM Sans';
  static const regular = FontWeight.w400;
  static const medium = FontWeight.w500;
  static const light = FontWeight.w300;

  TextStyle get display => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 32,
        height: 1.08,
        color: t.ink,
      );

  TextStyle get h2 => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 24,
        height: 1.16,
        color: t.ink,
      );

  TextStyle get h3 => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 20,
        height: 1.3,
        color: t.ink,
      );

  TextStyle get pageTitle => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 22,
        height: 1.25,
        color: t.ink,
      );

  TextStyle get cardTitle => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 16,
        height: 1.4,
        color: t.ink,
      );

  TextStyle get metric => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 28,
        height: 1.1,
        color: t.ink,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  TextStyle get body => TextStyle(
        fontFamily: family,
        fontWeight: regular,
        fontSize: 16,
        height: 1.6,
        color: t.ink,
      );

  TextStyle get bodySm => TextStyle(
        fontFamily: family,
        fontWeight: regular,
        fontSize: 14,
        height: 1.55,
        color: t.ink,
      );

  TextStyle get label => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 14,
        height: 1.2,
        color: t.ink,
      );

  TextStyle get meta => TextStyle(
        fontFamily: family,
        fontWeight: regular,
        fontSize: 13,
        height: 1.5,
        color: t.muted,
      );

  TextStyle get eyebrow => TextStyle(
        fontFamily: family,
        fontWeight: medium,
        fontSize: 12,
        height: 1.4,
        color: t.muted,
      );

  /// Tabular figures for money, phone numbers, and counters (§3.1).
  TextStyle tabular(TextStyle base) => base.copyWith(
        fontFeatures: const [FontFeature.tabularFigures()],
      );
}

/// Spacing scale (4px base), radii, and control heights (DESIGN.md §4).
class PkSpace {
  static const double s4 = 4;
  static const double s8 = 8;
  static const double s12 = 12;
  static const double s16 = 16;
  static const double s20 = 20;
  static const double s24 = 24;
  static const double s32 = 32;
  static const double s40 = 40;
  static const double s48 = 48;

  static const double radiusControl = 8;
  static const double radiusCard = 12;
  static const double radiusPill = 999;

  static const double controlSm = 36;
  static const double controlMd = 40;
  static const double controlLg = 44;
}

/// Motion tokens measured from Uber (DESIGN.md §5).
class PkMotion {
  static const Curve easeFlat = Curves.linear;
  static const Cubic easeMenu = Cubic(0.2, 0.8, 0.4, 1);
  static const Cubic easeGlide = Cubic(0.22, 1, 0.36, 1);

  static const Duration durMenu = Duration(milliseconds: 100);
  static const Duration durState = Duration(milliseconds: 200);
  static const Duration durSweep = Duration(milliseconds: 500);
}

extension PkContext on BuildContext {
  PkTokens get tokens =>
      Theme.of(this).brightness == Brightness.dark
          ? PkTokens.dark()
          : PkTokens.light();

  PkType get type => PkType(tokens);
}
