/**
 * Accessibility Utilities
 * Ensures components meet WCAG and platform accessibility standards
 */

import { Platform, AccessibilityInfo } from 'react-native';
import { platformSelect } from './responsive';

/**
 * Minimum touch target sizes per platform
 * iOS HIG: 44×44pt minimum
 * Android Material: 48×48dp minimum
 * WCAG 2.1: 44×44px minimum (Level AAA)
 */
export const touchTargetSizes = {
  // Minimum recommended sizes
  minimum: platformSelect({
    ios: 44,
    android: 48,
    default: 44,
  }),
  // Comfortable sizes for better UX
  comfortable: platformSelect({
    ios: 48,
    android: 52,
    default: 48,
  }),
  // Small elements that still meet minimum
  small: 44,
} as const;

/**
 * Ensure size meets minimum touch target
 */
export function ensureTouchTarget(size: number): number {
  return Math.max(size, touchTargetSizes.minimum);
}

/**
 * Get touch target padding to expand interactive area
 * Returns padding needed to reach minimum touch target
 */
export function getTouchTargetPadding(elementSize: number): number {
  const minSize = touchTargetSizes.minimum;
  if (elementSize >= minSize) return 0;

  return (minSize - elementSize) / 2;
}

/**
 * WCAG Color Contrast Ratios
 * AA: 4.5:1 for normal text, 3:1 for large text
 * AAA: 7:1 for normal text, 4.5:1 for large text
 */
export const contrastRatios = {
  AA: {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
  },
  AAA: {
    normalText: 7.0,
    largeText: 4.5,
    uiComponents: 3.0,
  },
} as const;

/**
 * Text size thresholds for WCAG
 * Large text: 18pt+ (24px+) or 14pt+ (18.5px+) bold
 */
export function isLargeText(fontSize: number, isBold: boolean = false): boolean {
  if (fontSize >= 24) return true;
  if (fontSize >= 18.5 && isBold) return true;
  return false;
}

/**
 * Focus indicator sizes
 * WCAG 2.2: Focus indicators must be at least 2px thick
 */
export const focusIndicator = {
  thickness: Platform.select({ web: 2, default: 3 }), // Slightly thicker on native for visibility
  offset: 2, // Distance from element
  borderRadius: 4,
} as const;

/**
 * Animation duration limits for accessibility
 * Some users have motion sensitivity
 */
export const animationDurations = {
  instant: 0,
  quick: 150,
  normal: 240,
  slow: 300,
  // Max duration before it feels sluggish
  maximum: 500,
} as const;

/**
 * Check if reduce motion is enabled
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Check prefers-reduced-motion media query on web
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  // React Native doesn't have built-in API yet
  // This will be available in future versions
  return false;
}

/**
 * Get animation duration respecting user preferences
 */
export async function getAnimationDuration(
  duration: number
): Promise<number> {
  const reduceMotion = await isReduceMotionEnabled();
  return reduceMotion ? 0 : duration;
}

/**
 * Spacing for comfortable tap zones
 * Minimum spacing between interactive elements
 */
export const interactiveSpacing = {
  // Minimum space between adjacent buttons/links
  minimum: 8,
  // Comfortable spacing
  comfortable: 12,
  // Generous spacing for critical actions
  generous: 16,
} as const;

/**
 * Text scaling support
 * iOS supports dynamic type, Android supports font scaling
 */
export function getScaledFontSize(baseFontSize: number): number {
  // This will be enhanced when we implement dynamic type support
  return baseFontSize;
}

/**
 * Accessible label helpers
 */
export const accessibilityLabels = {
  /**
   * Create label for navigation items
   */
  navItem: (label: string, isActive: boolean) =>
    `${label}${isActive ? ', active' : ''}`,

  /**
   * Create label for buttons with state
   */
  button: (label: string, state?: { disabled?: boolean; loading?: boolean }) => {
    let fullLabel = label;
    if (state?.loading) fullLabel += ', loading';
    if (state?.disabled) fullLabel += ', disabled';
    return fullLabel;
  },

  /**
   * Create label for expandable items
   */
  expandable: (label: string, isExpanded: boolean) =>
    `${label}, ${isExpanded ? 'expanded' : 'collapsed'}`,

  /**
   * Create label for count badges
   */
  count: (item: string, count: number) =>
    `${count} ${count === 1 ? item : item + 's'}`,
} as const;

/**
 * Accessibility roles mapping
 * Maps semantic meaning to platform-specific roles
 */
export const accessibilityRoles = {
  button: 'button' as const,
  link: 'link' as const,
  search: 'search' as const,
  image: 'image' as const,
  imageButton: 'imagebutton' as const,
  header: 'header' as const,
  summary: 'summary' as const,
  alert: 'alert' as const,
  checkbox: 'checkbox' as const,
  radio: 'radio' as const,
  switch: 'switch' as const,
  tab: 'tab' as const,
  tablist: 'tablist' as const,
  menu: 'menu' as const,
  menuitem: 'menuitem' as const,
  adjustable: 'adjustable' as const,
  text: 'text' as const,
  none: 'none' as const,
} as const;

/**
 * Semantic color usage for accessibility
 * Ensures meaning isn't conveyed by color alone
 */
export const semanticIndicators = {
  /**
   * Always pair color with icons or text
   */
  error: {
    requiresIcon: true,
    recommendedIcons: ['alert-circle', 'x-circle', 'alert-triangle'],
  },
  success: {
    requiresIcon: true,
    recommendedIcons: ['check-circle', 'check'],
  },
  warning: {
    requiresIcon: true,
    recommendedIcons: ['alert-triangle', 'info'],
  },
  info: {
    requiresIcon: true,
    recommendedIcons: ['info', 'help-circle'],
  },
} as const;

/**
 * High contrast mode detection
 * For users who need increased contrast
 */
export async function isHighContrastEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return window.matchMedia?.('(prefers-contrast: high)').matches ?? false;
  }

  // Native platforms don't have a standard API for this yet
  return false;
}

/**
 * Screen reader detection
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Announce to screen readers
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Loading state announcements
 */
export const loadingAnnouncements = {
  start: (item: string) => `Loading ${item}`,
  complete: (item: string) => `${item} loaded`,
  error: (item: string) => `Error loading ${item}`,
} as const;

/**
 * Helper to create accessible hit slop
 * Expands touch area without changing visual size
 */
export function createHitSlop(size: number = 8) {
  return {
    top: size,
    bottom: size,
    left: size,
    right: size,
  };
}

/**
 * Default hit slop for small interactive elements
 */
export const defaultHitSlop = createHitSlop(8);

/**
 * Generous hit slop for very small icons
 */
export const generousHitSlop = createHitSlop(12);
