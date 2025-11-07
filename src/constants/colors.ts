/**
 * Centralized color palette extracted from mockup design
 * Matches the CSS variables from docs/mockup.md
 */

export const colors = {
  // Backgrounds
  bgPrimary: '#000000',
  bgSecondary: '#0a0a0a',
  bgCard: '#141414',
  bgHover: '#1a1a1a',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#606060',

  // Accents
  accentBlue: '#3b82f6',
  accentGreen: '#10b981',
  accentYellow: '#f59e0b',
  accentRed: '#ef4444',
  accentPurple: '#8b5cf6',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  // Status indicators
  statusOnline: '#10b981',
  statusBusy: '#f59e0b',
  statusOffline: '#6b7280',
  statusLost: '#ef4444',

  // Utility
  white: '#ffffff',
  black: '#000000',
} as const;

// Type for color keys
export type ColorKey = keyof typeof colors;
