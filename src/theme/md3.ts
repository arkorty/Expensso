/**
 * Material Design 3 Theme System for Expensso
 *
 * Implements full MD3 color roles, typography scales, elevation,
 * and shape tokens with "Material You"–style palette.
 */

// ─── MD3 Color Palette ───────────────────────────────────────────────

export const MD3LightColors = {
  // Primary
  primary: '#4078F2',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DCE6FF',
  onPrimaryContainer: '#1E3E8A',

  // Secondary
  secondary: '#A626A4',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F3E5F5',
  onSecondaryContainer: '#4E1A4C',

  // Tertiary (Fintech Teal)
  tertiary: '#0184BC',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D8F1FC',
  onTertiaryContainer: '#004B6C',

  // Error
  error: '#E45649',
  onError: '#FFFFFF',
  errorContainer: '#FCE3E1',
  onErrorContainer: '#7A211C',

  // Success (custom MD3 extension)
  success: '#50A14F',
  onSuccess: '#FFFFFF',
  successContainer: '#DDF3D1',
  onSuccessContainer: '#1F4D1E',

  // Warning (custom MD3 extension)
  warning: '#C18401',
  onWarning: '#FFFFFF',
  warningContainer: '#F8EACB',
  onWarningContainer: '#5C4300',

  // Surface
  background: '#FAFAFA',
  onBackground: '#383A42',
  surface: '#FAFAFA',
  onSurface: '#383A42',
  surfaceVariant: '#E9ECF3',
  onSurfaceVariant: '#4B5260',
  surfaceDim: '#EDEFF2',
  surfaceBright: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F4F5F7',
  surfaceContainer: '#EEF0F4',
  surfaceContainerHigh: '#E8EBF0',
  surfaceContainerHighest: '#E2E6EC',

  // Outline
  outline: '#7F8693',
  outlineVariant: '#BCC3CF',

  // Inverse
  inverseSurface: '#383A42',
  inverseOnSurface: '#FAFAFA',
  inversePrimary: '#8FB1FF',

  // Scrim & Shadow
  scrim: '#000000',
  shadow: '#000000',

  // ─── App-Specific Semantic Colors ─────────────────────────────

  income: '#50A14F',
  expense: '#E45649',
  asset: '#4078F2',
  liability: '#C18401',

  // Chart palette (MD3 tonal)
  chartColors: [
    '#4078F2', '#A626A4', '#0184BC', '#50A14F',
    '#E45649', '#C18401', '#56B6C2', '#C678DD',
    '#61AFEF', '#D19A66',
  ],
};

export const MD3DarkColors: typeof MD3LightColors = {
  // Primary
  primary: '#61AFEF',
  onPrimary: '#1B2838',
  primaryContainer: '#2C3E55',
  onPrimaryContainer: '#D6E9FF',

  // Secondary
  secondary: '#C678DD',
  onSecondary: '#2F1B36',
  secondaryContainer: '#4B2F55',
  onSecondaryContainer: '#F0D7F6',

  // Tertiary
  tertiary: '#56B6C2',
  onTertiary: '#102D31',
  tertiaryContainer: '#1F4A50',
  onTertiaryContainer: '#CDEFF3',

  // Error
  error: '#E06C75',
  onError: '#3A1519',
  errorContainer: '#5A232A',
  onErrorContainer: '#FFD9DC',

  // Success
  success: '#98C379',
  onSuccess: '#1B2A17',
  successContainer: '#2D4524',
  onSuccessContainer: '#DDF3D1',

  // Warning
  warning: '#E5C07B',
  onWarning: '#342915',
  warningContainer: '#5A4728',
  onWarningContainer: '#FFE8C1',

  // Surface
  background: '#282C34',
  onBackground: '#E6EAF0',
  surface: '#282C34',
  onSurface: '#E6EAF0',
  surfaceVariant: '#3A404B',
  onSurfaceVariant: '#BCC3CF',
  surfaceDim: '#21252B',
  surfaceBright: '#353B45',
  surfaceContainerLowest: '#1E2228',
  surfaceContainerLow: '#2B3038',
  surfaceContainer: '#313741',
  surfaceContainerHigh: '#393F4A',
  surfaceContainerHighest: '#424955',

  // Outline
  outline: '#8E97A8',
  outlineVariant: '#5A6271',

  // Inverse
  inverseSurface: '#ABB2BF',
  inverseOnSurface: '#282C34',
  inversePrimary: '#4078F2',

  // Scrim & Shadow
  scrim: '#000000',
  shadow: '#000000',

  // App-Specific
  income: '#98C379',
  expense: '#E06C75',
  asset: '#61AFEF',
  liability: '#E5C07B',

  chartColors: [
    '#61AFEF', '#C678DD', '#56B6C2', '#98C379',
    '#E06C75', '#E5C07B', '#D19A66', '#ABB2BF',
    '#7F848E', '#8BE9FD',
  ],
};

export const MD3BlackColors: typeof MD3LightColors = {
  ...MD3DarkColors,
  background: '#000000',
  surface: '#000000',
  surfaceDim: '#000000',
  surfaceBright: '#0D0D0D',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#070707',
  surfaceContainer: '#0E0E0E',
  surfaceContainerHigh: '#141414',
  surfaceContainerHighest: '#1B1B1B',
  inverseSurface: '#F1F1F1',
  inverseOnSurface: '#000000',
  outline: '#767676',
  outlineVariant: '#333333',
};

// ─── MD3 Typography Scale ────────────────────────────────────────────

const fontFamily = 'JetBrainsMono-Regular';
const fontFamilyMedium = 'JetBrainsMono-Medium';
const fontFamilySemiBold = 'JetBrainsMono-SemiBold';
const fontFamilyBold = 'JetBrainsMono-Bold';

export const MD3Typography = {
  displayLarge: {
    fontFamily: fontFamilyBold,
    fontSize: 57,
    fontWeight: '400' as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamilyBold,
    fontSize: 45,
    fontWeight: '400' as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamilySemiBold,
    fontSize: 36,
    fontWeight: '400' as const,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: fontFamilySemiBold,
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamilySemiBold,
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamilyMedium,
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: fontFamilyMedium,
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamilyMedium,
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
    fontFamily: fontFamilyMedium,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamilyMedium,
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
  extraSmall: 2,
  small: 2,
  medium: 4,
  large: 4,
  extraLarge: 6,
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

export const BlackTheme: MD3Theme = {
  colors: MD3BlackColors,
  typography: MD3Typography,
  elevation: MD3Elevation,
  shape: MD3Shape,
  spacing: Spacing,
  isDark: true,
};
