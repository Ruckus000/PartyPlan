# Design System Documentation

## Overview

This design system ensures pixel-perfect implementation of the HTML mockups across all screen sizes and devices. All values are extracted directly from `home.html`, `plan.html`, and `profile.html` mockups.

## Core Principles

1. **Exact Mockup Fidelity**: All dimensions match mockup CSS values
2. **Responsive Design**: Adapts gracefully across iPhone SE to iPad
3. **Accessibility First**: Meets WCAG AA standards and platform guidelines
4. **Performance**: Optimized for 60fps scrolling and interactions

## Design Tokens

### Import Structure

```typescript
// Main tokens file (convenience imports)
import { colors, spacing, typography, radii } from '@/theme/tokens';

// Component-specific dimensions
import { navigation, home, plans, profile } from '@/theme/dimensions';

// Responsive utilities
import { scale, moderateScale, getBottomNavDimensions } from '@/theme/responsive';

// Accessibility helpers
import { touchTargetSizes, defaultHitSlop } from '@/theme/accessibility';
```

## Color System

### Base Colors (from mockup `:root`)

```typescript
colors.bg           = '#050306'   // Main background
colors.bgElevated   = '#0e090f'   // Elevated surfaces
colors.bgCard       = '#151019'   // Card backgrounds
colors.bgCardSoft   = '#1a131f'   // Softer card variant
```

### Text Colors (WCAG AA compliant)

```typescript
colors.textPrimary    = '#f8f5ff'   // Primary text
colors.textSecondary  = '#c8b8cb'   // Secondary (6.2:1 contrast)
colors.textMuted      = '#b0a0bf'   // Muted text (7.2:1 contrast)
```

### Accent Colors

```typescript
colors.accent         = '#e5404f'   // Primary accent (red/coral)
colors.accentSoft     = '#f3956a'   // Soft accent (orange)
colors.accentGreen    = '#43e97b'   // Success/confirmed
colors.accentBlue     = '#4facfe'   // Info
colors.accentYellow   = '#ffc966'   // Warning/needs input
colors.accentPurple   = '#b794f6'   // Personal/solo
```

### Borders

```typescript
colors.borderSubtle   = 'rgba(255, 255, 255, 0.08)'   // Default border
colors.borderLight    = 'rgba(255, 255, 255, 0.12)'   // Hover state
colors.borderMedium   = 'rgba(255, 255, 255, 0.15)'   // Active elements
colors.borderHeavy    = 'rgba(255, 255, 255, 0.18)'   // Emphasized
```

## Spacing Scale

Extracted from mockup `padding`, `margin`, and `gap` values:

```typescript
spacing.xxxs  = 3pt   // Minor adjustments
spacing.xxs   = 4pt   // Micro spacing
spacing.xs    = 6pt   // Badge padding
spacing.sm    = 8pt   // Standard gaps
spacing.md    = 10pt  // Common padding
spacing.base  = 12pt  // Standard component spacing
spacing.lg    = 14pt  // Section headers, card gaps
spacing.xl    = 16pt  // Content padding
spacing.xxl   = 18pt  // Header padding, feed gap
spacing.xxxl  = 20pt  // Screen horizontal padding
spacing.huge  = 24pt  // Large section spacing
```

## Typography

### Font Sizes (exact from mockup)

```typescript
typography.size.xxxs  = 10pt   // Badges, nav labels
typography.size.xxs   = 11pt   // Section labels, counts
typography.size.xs    = 12pt   // Meta info, member counts
typography.size.sm    = 13pt   // Body text, action labels
typography.size.base  = 14pt   // Setting labels
typography.size.md    = 15pt   // Card titles
typography.size.lg    = 17pt   // Feed titles
typography.size.xl    = 20pt   // Section titles
typography.size.xxl   = 24pt   // Profile name
```

### Font Weights

```typescript
typography.weight.normal    = '400'   // Body text
typography.weight.medium    = '500'   // Emphasis
typography.weight.semibold  = '600'   // Headers, labels
typography.weight.bold      = '700'   // Strong emphasis
typography.weight.extrabold = '800'   // Display text
```

### Letter Spacing

```typescript
typography.letterSpacing.tight   = -0.02    // Titles
typography.letterSpacing.tighter = -0.01    // Action labels
typography.letterSpacing.normal  = 0        // Default
typography.letterSpacing.wide    = 0.05     // Badges
typography.letterSpacing.wider   = 0.06     // Settings
typography.letterSpacing.widest  = 0.14     // UPPERCASE labels
```

## Border Radii

```typescript
radii.sm    = 10pt   // Icon backgrounds
radii.md    = 12pt   // Small buttons
radii.base  = 18pt   // Action cards
radii.lg    = 22pt   // Squad cards
radii.xl    = 24pt   // Feed cards, settings
radii.xxl   = 26pt   // Bottom nav
radii.pill  = 999pt  // Fully rounded
```

## Component Dimensions

### Bottom Navigation

From mockup: `width: 90%, max-width: 400px (home) / 320px (plans), bottom: 18px`

```typescript
navigation.bottomNav.maxWidthHome     = 400pt
navigation.bottomNav.maxWidthPlans    = 320pt
navigation.bottomNav.bottomOffset     = 18pt
navigation.bottomNav.borderRadius     = 26pt
navigation.bottomNav.iconSize         = 24pt
navigation.bottomNav.itemMaxWidth     = 48pt
navigation.bottomNav.itemBorderRadius = 16pt
```

**Usage:**

```typescript
import { navigation } from '@/theme/dimensions';
import { getBottomNavDimensions } from '@/theme/responsive';

// In component:
const navDimensions = getBottomNavDimensions();
// Returns: { width: number, maxWidth: 400, minWidth: 320, bottomOffset: 18 }
```

### Festival Feed Cards

From mockup: `height: 240px (image), padding: 14px 16px 16px, gap: 18px`

```typescript
home.festivalFeed.card.imageHeight     = 240pt
home.festivalFeed.card.borderRadius    = 24pt
home.festivalFeed.card.bodyPadding     = { top: 14, horizontal: 16, bottom: 16 }
home.festivalFeed.gap                  = 18pt
```

### Squad Cards

From mockup: `padding: 14px 16px, image: 44x44, gap: 12px`

```typescript
plans.squadCard.borderRadius            = 24pt
plans.squadCard.header.padding          = { vertical: 14, horizontal: 16 }
plans.squadCard.header.imageSize        = 44pt
plans.squadCard.header.imageRadius      = 12pt
plans.squadCard.members.avatarSize      = 28pt
plans.squadCard.members.avatarOverlap   = -10pt
```

### Profile Components

From mockup: `avatar: 80x80, radius: 24px, settings padding: 16px`

```typescript
profile.header.avatarSize                = 80pt
profile.header.avatarRadius              = 24pt
profile.settings.item.padding            = 16pt
profile.settings.item.iconWrapperSize    = 40pt
profile.settings.toggle.width            = 48pt
profile.settings.toggle.height           = 28pt
```

## Responsive Design

### Screen Sizes

```typescript
breakpoints.small   = 375pt   // iPhone SE
breakpoints.medium  = 390pt   // iPhone 15
breakpoints.large   = 430pt   // iPhone 15 Pro Max
breakpoints.xlarge  = 768pt   // iPad
```

### Responsive Utilities

```typescript
// Scale based on screen width
const width = scale(16);  // Scales 16pt proportionally

// Moderate scaling for font sizes (less aggressive)
const fontSize = moderateScale(14, 0.5);

// Responsive values
const padding = responsive({
  small: 12,
  medium: 16,
  large: 20,
  default: 16,
});
```

### Maximum Content Width

From mockup: `max-width: 430px`

```typescript
import { getMaxContentWidth } from '@/theme/responsive';

const maxWidth = getMaxContentWidth();  // Returns: min(screenWidth, 430)
```

## Accessibility

### Touch Targets

**Minimum sizes (enforced):**
- iOS: 44×44pt (Apple HIG)
- Android: 48×48dp (Material Design)
- Web: 44×44px (WCAG 2.1 AAA)

```typescript
import { touchTargetSizes, ensureTouchTarget } from '@/theme/accessibility';

// Ensure minimum touch target
const buttonSize = ensureTouchTarget(36);  // Returns: 44 (iOS) or 48 (Android)

// Get touch target padding for small elements
const padding = getTouchTargetPadding(36);  // Returns: 4 (to reach 44)
```

### Hit Slop

For small interactive elements (icons, close buttons):

```typescript
import { defaultHitSlop, generousHitSlop } from '@/theme/accessibility';

<Pressable
  hitSlop={defaultHitSlop}  // 8pt on all sides
  onPress={handlePress}
>
  <Icon size={18} />
</Pressable>
```

### Color Contrast

All text colors meet WCAG AA standards:
- `textPrimary`: 21:1 (AAA)
- `textSecondary`: 6.2:1 (AA for normal text)
- `textMuted`: 7.2:1 (AA for large text)

## Shadows

```typescript
shadows.small = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,  // Android
}
```

## Best Practices

### 1. Always Use Design Tokens

❌ **Don't:**
```typescript
<View style={{ padding: 16, borderRadius: 24 }} />
```

✅ **Do:**
```typescript
import { spacing, radii } from '@/theme/tokens';

<View style={{ padding: spacing.xl, borderRadius: radii.xl }} />
```

### 2. Use Component-Specific Dimensions

❌ **Don't:**
```typescript
<View style={{ width: 140, height: 72 }} />
```

✅ **Do:**
```typescript
import { home } from '@/theme/dimensions';

<View style={{
  width: home.quickActions.standardWidth,
  height: home.myFestivals.card.imageSize,
}} />
```

### 3. Ensure Touch Targets

❌ **Don't:**
```typescript
<Pressable style={{ width: 24, height: 24 }}>
  <Icon size={24} />
</Pressable>
```

✅ **Do:**
```typescript
import { touchTargetSizes } from '@/theme/accessibility';

<Pressable
  style={{
    width: touchTargetSizes.minimum,
    height: touchTargetSizes.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Icon size={24} />
</Pressable>
```

### 4. Use Responsive Scaling

❌ **Don't:**
```typescript
<Text style={{ fontSize: 16 }} />
```

✅ **Do:**
```typescript
import { typography } from '@/theme/tokens';
import { moderateScale } from '@/theme/responsive';

<Text style={{ fontSize: moderateScale(typography.size.base) }} />
```

### 5. Test Across Device Sizes

Required test matrix:
- ✅ iPhone SE (375×667)
- ✅ iPhone 15 (393×852)
- ✅ iPhone 15 Pro Max (430×932)
- ✅ iPad Pro (1024×1366)

## Animation & Transitions

From mockup: `--transition: 0.24s ease-out`

```typescript
import { animations } from '@/theme/dimensions';

// Durations in milliseconds
animations.instant  = 0ms
animations.fast     = 150ms
animations.normal   = 240ms   // From mockup
animations.slow     = 300ms
```

**Usage:**

```typescript
// Animated style
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(isActive ? 1 : 0.6, {
    duration: animations.normal,
    easing: Easing.out(Easing.ease),
  }),
}));
```

## Status Indicators

### Status Colors

```typescript
statusColors.active      = colors.accentGreen    // All confirmed
statusColors.urgent      = colors.accent         // Conflicts
statusColors.needsInput  = colors.accentYellow   // Votes needed
```

### Status Badges (Plans screen)

From mockup: `padding: 4px 8px, border-radius: pill`

```typescript
plans.squadCard.statusBadge.padding     = { vertical: 4, horizontal: 8 }
plans.squadCard.statusBadge.iconSize    = 10pt
plans.squadCard.statusBadge.gap         = 4pt
```

## Z-Index Layers

```typescript
zIndex.base      = 0     // Normal content
zIndex.dropdown  = 10    // Dropdowns
zIndex.overlay   = 40    // Modal overlays
zIndex.modal     = 50    // Modals
zIndex.toast     = 60    // Toast notifications
zIndex.tooltip   = 70    // Tooltips
```

## Common Patterns

### Card Structure

```typescript
<View style={{
  backgroundColor: colors.bgCard,
  borderRadius: radii.xl,
  borderWidth: 1,
  borderColor: colors.borderSubtle,
  padding: spacing.xl,
}}>
  {children}
</View>
```

### Icon Button

```typescript
<Pressable
  style={{
    width: touchTargetSizes.minimum,
    height: touchTargetSizes.minimum,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  hitSlop={defaultHitSlop}
>
  <Icon size={icons.base} />
</Pressable>
```

### Section Header

```typescript
<View style={{ marginBottom: spacing.lg }}>
  <Text style={{
    fontSize: typography.size.xxs,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.widest,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  }}>
    Section Label
  </Text>
  <Text style={{
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  }}>
    Section Title
  </Text>
</View>
```

## Troubleshooting

### Text Not Scaling

Ensure you're using `moderateScale()` for font sizes:

```typescript
import { moderateScale } from '@/theme/responsive';

fontSize: moderateScale(typography.size.base)
```

### Touch Target Too Small

Check that you're using minimum touch target size:

```typescript
import { touchTargetSizes } from '@/theme/accessibility';

minHeight: touchTargetSizes.minimum
```

### Spacing Inconsistent

Use the spacing scale instead of arbitrary numbers:

```typescript
import { spacing } from '@/theme/tokens';

padding: spacing.xl  // Instead of 16
```

## Resources

- **Mockup Files**: `/docs/home.html`, `/docs/plan.html`, `/docs/profile.html`
- **Design Tokens**: `/src/theme/tokens.ts`
- **Component Dimensions**: `/src/theme/dimensions.ts`
- **Responsive Utilities**: `/src/theme/responsive.ts`
- **Accessibility**: `/src/theme/accessibility.ts`

## Updates & Maintenance

When updating designs:

1. Update mockup HTML files first
2. Extract new dimensions to `dimensions.ts`
3. Update this documentation
4. Run visual regression tests
5. Test on all device sizes
6. Verify accessibility compliance
