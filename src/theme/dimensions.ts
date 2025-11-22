/**
 * Component Dimensions
 * Exact sizing from HTML mockups (home.html, plan.html, profile.html)
 * All values in points (pt) for iOS / density-independent pixels (dp) for Android
 */

import { touchTargetSizes } from './accessibility';

/**
 * Precise spacing scale from mockups
 * Extracted from CSS padding, margin, gap values
 */
export const spacing = {
  xxxs: 3,  // Minor adjustments
  xxs: 4,   // section-label margin-bottom
  xs: 6,    // Small gaps, badge padding
  sm: 8,    // Standard gaps, padding
  md: 10,   // Common padding (action cards, notification bars)
  base: 12, // Standard component spacing (filter tabs, header padding)
  lg: 14,   // Section header margin, card gaps
  xl: 16,   // Content padding, section margins
  xxl: 18,  // Header top padding, feed gap
  xxxl: 20, // Screen horizontal padding, section margins
  huge: 24, // Large section spacing
} as const;

/**
 * Border radii from mockup
 * Matches CSS --radius-* variables
 */
export const radii = {
  sm: 10,   // Small elements, icon backgrounds
  md: 12,   // Input fields, small buttons
  base: 18, // Action cards, cards
  lg: 22,   // My festival cards, squad cards
  xl: 24,   // Festival feed cards, settings cards, profile avatar
  xxl: 26,  // Bottom navigation
  pill: 999, // Fully rounded (pills, badges)
} as const;

/**
 * Typography from mockup
 * Font sizes match CSS exactly
 */
export const typography = {
  size: {
    xxxs: 10,  // Badge text, nav labels, tab counts
    xxs: 11,   // Action count, section labels, setting descriptions
    xs: 12,    // Feed location, my-meta, member count, app info
    sm: 13,    // Action labels, feed body text, section labels
    base: 14,  // Setting labels, profile username
    md: 15,    // My festival name, squad name, setting labels
    lg: 17,    // Feed title
    xl: 20,    // Section titles
    xxl: 24,   // Profile name
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  letterSpacing: {
    tight: -0.02,   // Titles (section-title, feed-title)
    tighter: -0.01, // Action labels
    normal: 0,
    wide: 0.05,     // Badges
    wider: 0.06,    // Setting section titles
    widest: 0.14,   // Section labels (UPPERCASE), nav labels
  },
} as const;

/**
 * Navigation components
 */
export const navigation = {
  bottomNav: {
    // From mockup: width: 90%, max-width: 400px (home), 320px (plan)
    maxWidthHome: 400,
    maxWidthPlans: 320,
    widthPercentage: 0.9,
    // From mockup: bottom: 18px
    bottomOffset: 18,
    // From mockup: padding: 8px 10px (home), 10px (plan)
    paddingHome: { vertical: 8, horizontal: 10 },
    paddingPlans: 10,
    // From mockup: border-radius: 26px
    borderRadius: radii.xxl,
    // From mockup: border: 1px solid rgba(255, 255, 255, 0.08)
    borderWidth: 1,
    // Nav item sizing
    iconSize: 24, // From mockup: width/height: 24px
    itemMaxWidth: 48, // From mockup: max-width: 48px
    itemBorderRadius: 16, // From mockup: border-radius: 16px
    // Gap between nav items (calculated from flex layout)
    itemGap: 0, // Handled by flex: 1, justify-content: space-around
  },

  header: {
    // From mockup: padding: 18px 20px 12px (home)
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 20,
    // From mockup (plans): padding: 16px 20px 12px
    paddingTopPlans: 16,
  },

  searchButton: {
    // From mockup: 36×36px
    size: 36,
    borderRadius: 12,
  },

  addButton: {
    // From mockup: 36×36px
    size: 36,
    borderRadius: 12,
  },
} as const;

/**
 * Home screen components
 */
export const home = {
  quickActions: {
    // From mockup: padding: 0 20px 8px
    paddingHorizontal: 20,
    paddingBottom: 8,
    // From mockup: gap: 10px
    gap: 10,
    // From mockup: width: 140px (standard), 200px (featured)
    standardWidth: 140,
    featuredWidth: 200,
    // From mockup: padding: 14px 16px
    cardPadding: { vertical: 14, horizontal: 16 },
    // From mockup: border-radius: 18px
    borderRadius: radii.base,
    // Icon wrapper
    iconSize: {
      standard: 18,
      featured: 20,
    },
    iconWrapperSize: {
      standard: 36,
      featured: 40,
    },
    iconWrapperRadius: 10,
    // Fade gradients
    fadeWidth: 60,
  },

  festivalFeed: {
    // From mockup: gap: 18px
    gap: 18,
    // Card structure
    card: {
      borderRadius: radii.xl, // 24px
      borderWidth: 1,
      // From mockup: height: 240px for image
      imageHeight: 240,
      // From mockup: padding: 14px 16px 16px
      bodyPadding: { top: 14, horizontal: 16, bottom: 16 },
    },
    // Date badge
    dateBadge: {
      // From mockup: top: 12px, left: 12px
      position: { top: 12, left: 12 },
      // From mockup: padding: 6px 12px
      padding: { vertical: 6, horizontal: 12 },
      borderRadius: radii.pill,
      borderWidth: 1,
    },
    // Friends overlay
    friendsOverlay: {
      // From mockup: top: 12px, right: 12px
      position: { top: 12, right: 12 },
      // From mockup: padding: 6px 10px 6px 6px
      padding: { vertical: 6, horizontal: 10, left: 6 },
      borderRadius: radii.pill,
      borderWidth: 1,
      // Avatar sizing
      avatarSize: 26,
      avatarBorderWidth: 1.5,
      avatarOverlap: -8, // margin-left: -8px (except first child)
    },
  },

  myFestivals: {
    // From mockup: gap: 14px
    gap: 14,
    card: {
      // From mockup: border-radius: 22px
      borderRadius: 22,
      // From mockup: padding: 12px
      padding: 12,
      borderWidth: 1,
      // Image sizing
      imageSize: 72,
      imageRadius: 18,
      // Gap between image and content
      gap: 12,
    },
  },
} as const;

/**
 * Plans screen components
 */
export const plans = {
  filterTabs: {
    // From mockup: gap: 8px
    gap: 8,
    // Tab sizing
    tab: {
      // From mockup: padding: 8px 14px
      padding: { vertical: 8, horizontal: 14 },
      borderRadius: radii.pill,
      borderWidth: 1,
    },
    // Count badge in tab
    count: {
      // From mockup: margin-left: 4px, padding: 2px 6px
      marginLeft: 4,
      padding: { vertical: 2, horizontal: 6 },
      borderRadius: 10,
    },
  },

  squadCard: {
    // From mockup: gap: 12px (between cards)
    gap: 12,
    // From mockup: border-radius: 24px
    borderRadius: radii.xl,
    borderWidth: 1,
    // Notification bar
    notification: {
      // From mockup: padding: 10px 16px
      padding: { vertical: 10, horizontal: 16 },
      // From mockup: gap: 10px
      gap: 10,
      // Notification button
      button: {
        // From mockup: padding: 5px 10px
        padding: { vertical: 5, horizontal: 10 },
        borderRadius: radii.pill,
        borderWidth: 1,
      },
    },
    // Squad header
    header: {
      // From mockup: padding: 14px 16px
      padding: { vertical: 14, horizontal: 16 },
      // Image sizing
      imageSize: 44,
      imageRadius: radii.md,
      // Gap between elements
      gap: 12,
    },
    // Member avatars
    members: {
      // From mockup: width/height: 28px
      avatarSize: 28,
      avatarBorderWidth: 2,
      avatarOverlap: -10, // margin-left: -10px
      // Confirmed indicator
      confirmedDotSize: 10,
      confirmedDotBorderWidth: 2,
    },
    // Status badges
    statusBadge: {
      // From mockup: padding: 4px 8px
      padding: { vertical: 4, horizontal: 8 },
      borderRadius: radii.pill,
      borderWidth: 1,
      iconSize: 10,
      gap: 4,
    },
    // Activity items
    activity: {
      // From mockup: padding: 8px 0
      padding: { vertical: 8, horizontal: 0 },
      gap: 10,
      iconSize: 28,
      iconRadius: 14,
      iconInnerSize: 14,
    },
  },
} as const;

/**
 * Profile screen components
 */
export const profile = {
  header: {
    // From mockup: padding: 24px 20px
    padding: { vertical: 24, horizontal: 20 },
    // Avatar
    avatarSize: 80,
    avatarRadius: radii.xl, // 24px
    avatarBorderWidth: 2,
    // Spacing below avatar
    avatarMarginBottom: 16,
  },

  settings: {
    // Section spacing
    sectionMarginBottom: 24,
    // Settings card
    card: {
      borderRadius: radii.xl, // 24px
      borderWidth: 1,
    },
    // Setting item
    item: {
      // From mockup: padding: 16px
      padding: 16,
      // From mockup: gap: 12px
      gap: 12,
      minHeight: touchTargetSizes.minimum, // Ensure touch target
      // Icon wrapper
      iconSize: 20,
      iconWrapperSize: 40,
      iconWrapperRadius: 12,
      // Chevron
      chevronSize: 20,
    },
    // Toggle switch
    toggle: {
      // From mockup: width: 48px, height: 28px
      width: 48,
      height: 28,
      borderRadius: 14,
      // Knob sizing
      knobSize: 22,
      knobOffset: 3,
      knobTranslate: 20, // 48 - 22 - 3 - 3 = 20
    },
  },

  dangerCard: {
    // From mockup: border-radius: 24px, padding: 16px
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    // Button sizing
    button: {
      // From mockup: padding: 10px 24px
      padding: { vertical: 10, horizontal: 24 },
      borderRadius: radii.pill,
      borderWidth: 1,
      minHeight: touchTargetSizes.minimum,
    },
  },

  appInfo: {
    // From mockup: padding: 24px 20px
    padding: { vertical: 24, horizontal: 20 },
    // Version text margin
    versionMarginBottom: 10,
    // Links gap
    linksGap: 20,
  },
} as const;

/**
 * Common card dimensions
 */
export const card = {
  borderWidth: 1,
  borderRadius: {
    small: radii.base,  // 18px
    medium: radii.lg,   // 22px
    large: radii.xl,    // 24px
  },
  padding: {
    small: 12,
    medium: 14,
    large: 16,
  },
  gap: {
    small: 12,
    medium: 14,
    large: 18,
  },
} as const;

/**
 * Icon sizes
 */
export const icons = {
  tiny: 10,
  small: 14,
  base: 18,
  medium: 20,
  large: 24,
  xlarge: 28,
  huge: 36,
} as const;

/**
 * Elevation levels (for shadows)
 */
export const elevation = {
  none: 0,
  small: 4,
  medium: 12,
  large: 20,
} as const;

/**
 * Z-index layers
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

/**
 * Screen layout
 */
export const screen = {
  // Max content width (from mockup: max-width: 430px)
  maxWidth: 430,
  // Horizontal padding
  paddingHorizontal: 20,
  // Bottom padding to account for bottom nav
  paddingBottom: 110, // navHeight (72) + bottomOffset (18) + padding (20)
} as const;

/**
 * Animation durations (in ms)
 */
export const animations = {
  instant: 0,
  fast: 150,
  normal: 240,  // From mockup: --transition: 0.24s
  slow: 300,
  slower: 400,
} as const;
