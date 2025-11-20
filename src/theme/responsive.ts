/**
 * Responsive Design System
 * Handles screen size adaptation, safe areas, and device-specific scaling
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

// Base design dimensions (iPhone 15 Pro - 393×852pt)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Get current screen dimensions
 */
export function getScreenDimensions() {
  return {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    screenWidth: Dimensions.get('screen').width,
    screenHeight: Dimensions.get('screen').height,
  };
}

/**
 * Device size categories
 */
export type DeviceSize = 'small' | 'medium' | 'large' | 'xlarge';

export function getDeviceSize(): DeviceSize {
  const { width } = getScreenDimensions();

  if (width < 375) return 'small'; // iPhone SE
  if (width < 430) return 'medium'; // iPhone 15, 15 Pro
  if (width < 768) return 'large'; // iPhone 15 Pro Max
  return 'xlarge'; // iPad
}

/**
 * Check if device is a tablet
 */
export function isTablet(): boolean {
  const { width, height } = getScreenDimensions();
  const aspectRatio = height / width;

  // iPad detection: larger screen and aspect ratio closer to 4:3
  return (
    (width >= 768 || height >= 1024) &&
    (aspectRatio >= 1.2 && aspectRatio <= 1.5)
  );
}

/**
 * Responsive scaling functions
 * Scale sizes based on screen width compared to base design
 */

/**
 * Horizontal scaling - for width, margin, padding
 */
export function scale(size: number): number {
  const { width } = getScreenDimensions();
  return (width / BASE_WIDTH) * size;
}

/**
 * Vertical scaling - for height, line-height
 */
export function verticalScale(size: number): number {
  const { height } = getScreenDimensions();
  return (height / BASE_HEIGHT) * size;
}

/**
 * Moderate scaling - for font sizes (less aggressive scaling)
 * factor 0.5 = half the scaling effect
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (scale(size) - size) * factor;
}

/**
 * Normalize size for consistent rendering across devices
 * Uses PixelRatio to convert design pixels to device pixels
 */
export function normalize(size: number): number {
  const { width } = getScreenDimensions();

  // Different scaling for tablets vs phones
  if (isTablet()) {
    return Math.round(PixelRatio.roundToNearestPixel(size * (width / BASE_WIDTH) * 0.8));
  }

  return Math.round(PixelRatio.roundToNearestPixel(size * (width / BASE_WIDTH)));
}

/**
 * Get responsive value based on device size
 */
export function responsive<T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
  default: T;
}): T {
  const deviceSize = getDeviceSize();
  return values[deviceSize] ?? values.default;
}

/**
 * Breakpoint utilities
 */
export const breakpoints = {
  small: 375,   // iPhone SE
  medium: 390,  // iPhone 15
  large: 430,   // iPhone 15 Pro Max
  xlarge: 768,  // iPad
} as const;

export function isSmallScreen(): boolean {
  return getScreenDimensions().width < breakpoints.medium;
}

export function isMediumScreen(): boolean {
  const { width } = getScreenDimensions();
  return width >= breakpoints.medium && width < breakpoints.large;
}

export function isLargeScreen(): boolean {
  const { width } = getScreenDimensions();
  return width >= breakpoints.large && width < breakpoints.xlarge;
}

export function isXLargeScreen(): boolean {
  return getScreenDimensions().width >= breakpoints.xlarge;
}

/**
 * Safe area utilities
 * These work with react-native-safe-area-context
 */
export const safeAreaDefaults = {
  top: Platform.select({ ios: 47, android: 24, default: 0 }),
  bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  left: 0,
  right: 0,
} as const;

/**
 * Calculate maximum content width for centered layouts
 * Matches mockup max-width: 430px with 90% constraint
 */
export function getMaxContentWidth(): number {
  const { width } = getScreenDimensions();

  // Mockup uses: width: 90%, max-width: 430px
  const ninetyPercent = width * 0.9;
  const maxWidth = 430;

  return Math.min(ninetyPercent, maxWidth);
}

/**
 * Get bottom navigation dimensions matching mockup
 * Mockup: width: 90%, max-width: 400px, bottom: 18px
 */
export function getBottomNavDimensions() {
  const { width } = getScreenDimensions();
  const ninetyPercent = width * 0.9;
  const maxWidth = 400; // From plan.html mockup
  const minWidth = 320; // From plan.html mockup

  return {
    width: Math.min(Math.max(ninetyPercent, minWidth), maxWidth),
    maxWidth,
    minWidth,
    bottomOffset: 8, // Reduced from 18 to lower nav bar
  };
}

/**
 * Platform-specific utilities
 */
export const platformSelect = <T,>(values: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T => {
  return Platform.select({
    ios: values.ios ?? values.default,
    android: values.android ?? values.default,
    web: values.web ?? values.default,
    default: values.default,
  });
};

/**
 * Get platform-specific shadow elevation
 */
export function getShadowElevation(elevation: number) {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.3 + (elevation / 100) * 0.4,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {},
  });
}
