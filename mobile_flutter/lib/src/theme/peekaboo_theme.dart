import 'package:flutter/material.dart';

import 'tokens.dart';

/// Material theme built exclusively from [PkTokens]/[PkType]: every color,
/// radius, height, and duration resolves to a DESIGN.md token.
ThemeData buildPeekabooTheme(Brightness brightness) {
  final t = brightness == Brightness.dark ? PkTokens.dark() : PkTokens.light();
  final type = PkType(t);

  final colorScheme = ColorScheme(
    brightness: brightness,
    primary: t.ink,
    onPrimary: t.paper,
    secondary: t.surface,
    onSecondary: t.ink,
    surface: t.paper,
    onSurface: t.ink,
    error: t.danger.main,
    onError: t.onConsequence,
  );

  final textTheme = TextTheme(
    displayLarge: type.display,
    headlineMedium: type.h2,
    headlineSmall: type.h3,
    titleLarge: type.pageTitle,
    titleMedium: type.cardTitle,
    titleSmall: type.label,
    bodyLarge: type.body,
    bodyMedium: type.bodySm,
    bodySmall: type.meta,
    labelLarge: type.label,
    labelMedium: type.meta,
    labelSmall: type.eyebrow,
  );

  final controlShape = RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(PkSpace.radiusControl),
  );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: t.paper,
    fontFamily: PkType.family,
    textTheme: textTheme,
    dividerColor: t.line,
    dividerTheme: DividerThemeData(color: t.line, thickness: 1),
    splashFactory: NoSplash.splashFactory,
    // Primary button: ink fill, paper label, press = inset overlay flood.
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        minimumSize: const WidgetStatePropertyAll(
          Size(0, PkSpace.controlMd),
        ),
        backgroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return t.surface;
          return t.ink;
        }),
        foregroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return t.disabledFg;
          return t.paper;
        }),
        overlayColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.pressed)) return t.pressOnInk;
          if (states.contains(WidgetState.hovered)) {
            return t.pressOnInk.withValues(alpha: 0.12);
          }
          return Colors.transparent;
        }),
        textStyle: WidgetStatePropertyAll(type.label.copyWith(color: t.paper)),
        shape: WidgetStatePropertyAll(controlShape),
        elevation: const WidgetStatePropertyAll(0),
        shadowColor: const WidgetStatePropertyAll(Colors.transparent),
        animationDuration: PkMotion.durState,
      ),
    ),
    // Secondary: surface fill, no border.
    filledButtonTheme: FilledButtonThemeData(
      style: ButtonStyle(
        minimumSize: const WidgetStatePropertyAll(
          Size(0, PkSpace.controlMd),
        ),
        backgroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return t.surface;
          if (states.contains(WidgetState.hovered)) return t.surfaceHover;
          return t.surface;
        }),
        foregroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return t.disabledFg;
          return t.ink;
        }),
        overlayColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.pressed)) return t.pressOnPaper;
          return Colors.transparent;
        }),
        textStyle: WidgetStatePropertyAll(type.label),
        shape: WidgetStatePropertyAll(controlShape),
        elevation: const WidgetStatePropertyAll(0),
        animationDuration: PkMotion.durState,
      ),
    ),
    // Outline: ink border, hovers to surface (never flips to a fill).
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: ButtonStyle(
        minimumSize: const WidgetStatePropertyAll(
          Size(0, PkSpace.controlMd),
        ),
        backgroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.hovered)) return t.surface;
          return Colors.transparent;
        }),
        foregroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return t.disabledFg;
          return t.ink;
        }),
        overlayColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.pressed)) return t.pressOnPaper;
          return Colors.transparent;
        }),
        side: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) {
            return BorderSide(color: t.line);
          }
          return BorderSide(color: t.ink);
        }),
        textStyle: WidgetStatePropertyAll(type.label),
        shape: WidgetStatePropertyAll(controlShape),
        elevation: const WidgetStatePropertyAll(0),
        animationDuration: PkMotion.durState,
      ),
    ),
    // Ghost: transparent, hovers to surface.
    textButtonTheme: TextButtonThemeData(
      style: ButtonStyle(
        minimumSize: const WidgetStatePropertyAll(
          Size(0, PkSpace.controlMd),
        ),
        foregroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return t.disabledFg;
          return t.ink;
        }),
        overlayColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.pressed)) return t.pressOnPaper;
          if (states.contains(WidgetState.hovered)) return t.surface;
          return Colors.transparent;
        }),
        textStyle: WidgetStatePropertyAll(type.label),
        shape: WidgetStatePropertyAll(controlShape),
        animationDuration: PkMotion.durState,
      ),
    ),
    // Client control contract: 40px, 1px line border, ink border + 1px
    // ring on focus (rendered as a 2px ink edge), danger border on error.
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: t.paper,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 10,
      ),
      constraints: const BoxConstraints(minHeight: PkSpace.controlMd),
      hintStyle: type.bodySm.copyWith(color: t.muted),
      labelStyle: type.label,
      helperStyle: type.meta,
      errorStyle: type.meta.copyWith(color: t.danger.main),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        borderSide: BorderSide(color: t.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        borderSide: BorderSide(color: t.line),
      ),
      hoverColor: Colors.transparent,
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        borderSide: BorderSide(color: t.ink, width: 2),
      ),
      // Invalid is the one place a field is allowed color.
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        borderSide: BorderSide(color: t.danger.main),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        borderSide: BorderSide(color: t.danger.main, width: 2),
      ),
      disabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        borderSide: BorderSide(color: t.line),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: t.paper,
      foregroundColor: t.ink,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: type.cardTitle,
    ),
    tabBarTheme: TabBarThemeData(
      labelColor: t.paper,
      unselectedLabelColor: t.muted,
      labelStyle: type.label,
      unselectedLabelStyle: type.label.copyWith(color: t.muted),
      indicator: BoxDecoration(
        color: t.ink,
        borderRadius: BorderRadius.circular(PkSpace.radiusPill),
      ),
      indicatorSize: TabBarIndicatorSize.tab,
      dividerColor: Colors.transparent,
      overlayColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.pressed)) return t.pressOnPaper;
        return Colors.transparent;
      }),
    ),
    cardTheme: CardThemeData(
      color: t.paper,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusCard),
        side: BorderSide(color: t.line),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: t.paper,
      elevation: 0,
      barrierColor: t.overlay,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusCard),
      ),
      titleTextStyle: type.cardTitle,
      contentTextStyle: type.bodySm,
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: t.paper,
      modalBarrierColor: t.overlay,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(PkSpace.radiusCard),
        ),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: t.paper,
      contentTextStyle: type.bodySm,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(PkSpace.radiusControl),
        side: BorderSide(color: t.line),
      ),
      behavior: SnackBarBehavior.floating,
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return t.paper;
        return t.muted;
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return t.ink;
        if (states.contains(WidgetState.disabled)) return t.surface;
        return t.surfaceHover;
      }),
      trackOutlineColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return Colors.transparent;
        }
        return t.line;
      }),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: t.ink),
    iconTheme: IconThemeData(color: t.ink, size: 20),
  );
}
