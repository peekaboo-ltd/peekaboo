import 'package:flutter/material.dart';

/// Peekaboo design tokens for Flutter. The visual source of truth is the
/// implemented client UI (`client/src/index.css` and its components); the
/// values below are that system's tokens, ported 1:1.
///
/// Structure stays monochrome; consequence color (danger/approve/warning/
/// info) is spent only where something failed, is about to be destroyed, or
/// has been resolved. Light uses Tailwind 700s (red/green/yellow); dark
/// uses the 400s so they hold contrast on black. DM Sans only, 400 default / 500 ceiling, no gradients,
/// press = full-surface inset overlay (never a transform), borders over
/// shadows (only menus/popovers/modals cast one).
class PkConsequence {
  final Color main;
  final Color strong;
  final Color surface;
  final Color line;

  const PkConsequence({
    required this.main,
    required this.strong,
    required this.surface,
    required this.line,
  });
}

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
  final PkConsequence danger;
  final PkConsequence approve;
  final PkConsequence warning;
  final PkConsequence info;
  final Color onConsequence;

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
    required this.danger,
    required this.approve,
    required this.warning,
    required this.info,
    required this.onConsequence,
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
        pressOnInk: Color.fromRGBO(255, 255, 255, 0.22),
        pressOnPaper: Color.fromRGBO(0, 0, 0, 0.10),
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
        danger: PkConsequence(
          main: Color(0xFFB91C1C),
          strong: Color(0xFF991B1B),
          surface: Color(0xFFFEF2F2),
          line: Color(0xFFFECACA),
        ),
        approve: PkConsequence(
          main: Color(0xFF15803D),
          strong: Color(0xFF166534),
          surface: Color(0xFFF0FDF4),
          line: Color(0xFFBBF7D0),
        ),
        warning: PkConsequence(
          main: Color(0xFFA16207),
          strong: Color(0xFF854D0E),
          surface: Color(0xFFFEFCE8),
          line: Color(0xFFFEF08A),
        ),
        info: PkConsequence(
          main: Color(0xFF1D4ED8),
          strong: Color(0xFF1E40AF),
          surface: Color(0xFFEFF6FF),
          line: Color(0xFFBFDBFE),
        ),
        onConsequence: Color(0xFFFFFFFF),
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
        // control sits on.
        pressOnInk: Color.fromRGBO(255, 255, 255, 0.22),
        pressOnPaper: Color.fromRGBO(0, 0, 0, 0.10),
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
        danger: PkConsequence(
          main: Color(0xFFF87171),
          strong: Color(0xFFFCA5A5),
          surface: Color(0xFF1C1011),
          line: Color(0xFF4C1D1D),
        ),
        approve: PkConsequence(
          main: Color(0xFF4ADE80),
          strong: Color(0xFF86EFAC),
          surface: Color(0xFF0C1A10),
          line: Color(0xFF14532D),
        ),
        warning: PkConsequence(
          main: Color(0xFFFACC15),
          strong: Color(0xFFFDE047),
          surface: Color(0xFF1C1A08),
          line: Color(0xFF543F0B),
        ),
        info: PkConsequence(
          main: Color(0xFF60A5FA),
          strong: Color(0xFF93C5FD),
          surface: Color(0xFF0D1526),
          line: Color(0xFF1E3A5F),
        ),
        onConsequence: Color(0xFF000000),
      );

  /// Inverted ground matching the client's `.invert-surface`: on a light
  /// page the ground goes black, on a dark page it goes white.
  factory PkTokens.inverted(Brightness page) {
    final base =
        page == Brightness.dark ? PkTokens.light() : PkTokens.dark();
    if (page == Brightness.dark) {
      return PkTokens._(
        brightness: Brightness.light,
        paper: const Color(0xFFFFFFFF),
        ink: const Color(0xFF000000),
        surface: const Color(0xFFF3F3F3),
        surfaceHover: const Color(0xFFE2E2E2),
        surfaceSunken: base.surfaceSunken,
        line: const Color(0xFFE2E2E2),
        lineStrong: base.lineStrong,
        muted: const Color(0xFF6E6E6E),
        mutedWeak: base.mutedWeak,
        disabledFg: base.disabledFg,
        pressOnInk: base.pressOnInk,
        pressOnPaper: base.pressOnPaper,
        overlay: base.overlay,
        shadowMenu: base.shadowMenu,
        shadowModal: base.shadowModal,
        danger: base.danger,
        approve: base.approve,
        warning: base.warning,
        info: base.info,
        onConsequence: base.onConsequence,
      );
    }
    return PkTokens._(
      brightness: Brightness.dark,
      paper: const Color(0xFF000000),
      ink: const Color(0xFFFFFFFF),
      surface: const Color(0xFF1A1A1A),
      surfaceHover: const Color(0xFF2B2B2B),
      surfaceSunken: base.surfaceSunken,
      line: const Color(0xFF2E2E2E),
      lineStrong: base.lineStrong,
      muted: const Color(0xFFA3A3A3),
      mutedWeak: base.mutedWeak,
      disabledFg: base.disabledFg,
      pressOnInk: base.pressOnInk,
      pressOnPaper: base.pressOnPaper,
      overlay: base.overlay,
      shadowMenu: base.shadowMenu,
      shadowModal: base.shadowModal,
      danger: base.danger,
      approve: base.approve,
      warning: base.warning,
      info: base.info,
      onConsequence: base.onConsequence,
    );
  }

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
