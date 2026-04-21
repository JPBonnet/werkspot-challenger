// Single source of truth for design tokens. Mirrored to Dart via packages/ui-tokens/scripts/gen-dart.mjs.

export const colors = {
  primary: "#0E7C86",
  primaryForeground: "#FFFFFF",
  accent: "#F97316",
  bg: "#FFFFFF",
  bgDark: "#0B1320",
  fg: "#0F172A",
  fgDark: "#E2E8F0",
  muted: "#64748B",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#2563EB",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, "2xl": 40 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
} as const;
