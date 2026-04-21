import 'package:flutter/material.dart';

const _primary = Color(0xFF0E7C86);
const _accent = Color(0xFFF97316);

ThemeData appTheme(Brightness brightness) {
  final scheme = ColorScheme.fromSeed(
    seedColor: _primary,
    brightness: brightness,
  ).copyWith(secondary: _accent);
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    textTheme: Typography.englishLike2021.apply(
      fontFamily: 'Inter',
      bodyColor: scheme.onSurface,
      displayColor: scheme.onSurface,
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
  );
}
