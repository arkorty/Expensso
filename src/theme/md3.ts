/**
 * Material Design 3 Theme System for Expensso
 *
 * Implements full MD3 color roles, typography scales, elevation,
 * and shape tokens with "Material You"–style palette.
 */

// ─── MD3 Color Palette ───────────────────────────────────────────────

export const MD3LightColors = {
  // Primary
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',

  // Secondary
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',

  // Tertiary (Fintech Teal)
  tertiary: '#00897B',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#A7F3D0',
  onTertiaryContainer: '#00382E',

  // Error
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',

  // Success (custom MD3 extension)
  success: '#1B873B',
  onSuccess: '#FFFFFF',
  successContainer: '#D4EDDA',
  onSuccessContainer: '#0A3D1B',

  // Warning (custom MD3 extension)
  warning: '#E65100',
  onWarning: '#FFFFFF',
  warningContainer: '#FFE0B2',
  onWarningContainer: '#3E2723',

  // Surface
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  surfaceDim: '#DED8E1',
  surfaceBright: '#FFF8FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F7F2FA',
  surfaceContainer: '#F3EDF7',
  surfaceContainerHigh: '#ECE6F0',
  surfaceContainerHighest: '#E6E0E9',

  // Outline
  outline: '#79747E',
  outlineVariant: '#CAC4D0',

  // Inverse
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',

  // Scrim & Shadow
  scrim: '#000000',
  shadow: '#000000',

  // ─── App-Specific Semantic Colors ─────────────────────────────

  income: '#1B873B',
  expense: '#B3261E',
  asset: '#6750A4',
  liability: '#E65100',

  // Chart palette (MD3 tonal)
  chartColors: [
    '#6750A4', '#00897B', '#1E88E5', '#E65100',
    '#8E24AA', '#00ACC1', '#43A047', '#F4511E',
    '#5C6BC0', '#FFB300',
  ],
};

export const MD3DarkColors: typeof MD3LightColors = {
  // Primary
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',

  // Secondary
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',

  // Tertiary
  tertiary: '#4DB6AC',
  onTertiary: '#003730',
  tertiaryContainer: '#005048',
  onTertiaryContainer: '#A7F3D0',

  // Error
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',

  // Success
  success: '#81C784',
  onSuccess: '#0A3D1B',
  successContainer: '#1B5E20',
  onSuccessContainer: '#D4EDDA',

  // Warning
  warning: '#FFB74D',
  onWarning: '#3E2723',
  warningContainer: '#BF360C',
  onWarningContainer: '#FFE0B2',

  // Surface
  background: '#141218',
  onBackground: '#E6E0E9',
  surface: '#141218',
  onSurface: '#E6E0E9',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  surfaceDim: '#141218',
  surfaceBright: '#3B383E',
  surfaceContainerLowest: '#0F0D13',
  surfaceContainerLow: '#1D1B20',
  surfaceContainer: '#211F26',
  surfaceContainerHigh: '#2B2930',
  surfaceContainerHighest: '#36343B',

  // Outline
  outline: '#938F99',
  outlineVariant: '#49454F',

  // Inverse
  inverseSurface: '#E6E0E9',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4',

  // Scrim & Shadow
  scrim: '#000000',
  shadow: '#000000',

  // App-Specific
  income: '#81C784',
  expense: '#F2B8B5',
  asset: '#D0BCFF',
  liability: '#FFB74D',

  chartColors: [
    '#D0BCFF', '#4DB6AC', '#64B5F6', '#FFB74D',
    '#CE93D8', '#4DD0E1', '#81C784', '#FF8A65',
    '#9FA8DA', '#FFD54F',
  ],
};

// ─── MD3 Typography Scale ────────────────────────────────────────────

const fontFamily = 'System'; // Falls back to Roboto on Android, SF Pro on iOS

export const MD3Typography = {
  displayLarge: {
    fontFamily,
    fontSize: 57,
    fontWeight: '400' as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily,
    fontSize: 45,
    fontWeight: '400' as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily,
    fontSize: 36,
    fontWeight: '400' as const,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily,
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily,
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily,
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily,
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

// ─── MD3 Elevation (Shadow Presets) ──────────────────────────────────

export const MD3Elevation = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 6,
  },
  level4: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 8,
  },
  level5: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.17,
    shadowRadius: 12,
    elevation: 12,
  },
};

// ─── MD3 Shape (Corner Radii) ────────────────────────────────────────

export const MD3Shape = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
};

// ─── Spacing Scale ───────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ─── Composite Theme Object ─────────────────────────────────────────

export type MD3ColorScheme = typeof MD3LightColors;

export interface MD3Theme {
  colors: MD3ColorScheme;
  typography: typeof MD3Typography;
  elevation: typeof MD3Elevation;
  shape: typeof MD3Shape;
  spacing: typeof Spacing;
  isDark: boolean;
}

export const LightTheme: MD3Theme = {
  colors: MD3LightColors,
  typography: MD3Typography,
  elevation: MD3Elevation,
  shape: MD3Shape,
  spacing: Spacing,
  isDark: false,
};

export const DarkTheme: MD3Theme = {
  colors: MD3DarkColors,
  typography: MD3Typography,
  elevation: MD3Elevation,
  shape: MD3Shape,
  spacing: Spacing,
  isDark: true,
};
