/**
 * Design Tokens
 * Extracted from HTML mockups (home.html, plan.html, profile.html)
 * Based on CSS variables in :root
 */

export const colors = {
  // Backgrounds
  bg: '#050306',
  bgElevated: '#0e090f',
  bgCard: '#151019',
  bgCardSoft: '#1a131f',

  // Text
  textPrimary: '#f8f5ff',
  textSecondary: '#a191aa',
  textMuted: '#746978',

  // Accents
  accent: '#e5404f',
  accentSoft: '#f3956a',
  accentGreen: '#43e97b',
  accentBlue: '#4facfe',
  accentYellow: '#ffc966',
  accentPurple: '#b794f6',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderMedium: 'rgba(255, 255, 255, 0.15)',
  borderHeavy: 'rgba(255, 255, 255, 0.18)',
} as const;

export const radii = {
  lg: 24,
  md: 18,
  sm: 12,
  pill: 999,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 20,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const typography = {
  // Font sizes
  size: {
    xs: 10,
    sm: 11,
    base: 13,
    md: 14,
    lg: 15,
    xl: 17,
    xxl: 20,
    xxxl: 24,
  },
  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  // Letter spacing
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.06,
    wider: 0.14,
  },
} as const;

// Gradient backgrounds from mockups
export const gradients = {
  appContainer: {
    colors: ['rgba(229, 64, 79, 0.25)', 'transparent'],
    locations: [0, 0.55],
  },
  header: {
    colors: ['rgba(5, 3, 6, 0.98)', 'rgba(5, 3, 6, 0.92)', 'transparent'],
    locations: [0, 0.5, 1],
  },
  radialBg: {
    colors: ['#1a1016', '#050306', '#000000'],
    locations: [0, 0.55, 1],
  },
} as const;

// Status colors
export const statusColors = {
  online: colors.accentGreen,
  busy: colors.accentYellow,
  offline: colors.textMuted,
  lost: colors.accent,
  active: colors.accentGreen,
  urgent: colors.accent,
  needsInput: colors.accentYellow,
} as const;

// Transition duration (in ms)
export const transitions = {
  fast: 150,
  normal: 240,
  slow: 300,
} as const;
