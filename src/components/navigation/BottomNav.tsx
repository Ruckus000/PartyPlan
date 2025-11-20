import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows, typography } from '../../theme/tokens';
import { navigation } from '../../theme/dimensions';
import { getBottomNavDimensions } from '../../theme/responsive';
import { defaultHitSlop } from '../../theme/accessibility';

export interface TabConfig {
  key: string;
  label: string;
  iconOutline: React.ReactNode;
  iconFilled: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  showBadge?: boolean;
}

interface BottomNavProps {
  tabs: TabConfig[];
}

/**
 * BottomNav - Floating bottom navigation bar
 * Matches the rounded, blurred container from HTML mockups
 * - Responsive width: min(90%, maxWidth)
 * - Fixed bottom offset: 18pt + safe area
 * - Exact dimensions from mockup
 * - Icon swap on active state (outline → filled)
 * - Safe area inset handling
 */
export function BottomNav({ tabs }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const navDimensions = getBottomNavDimensions();

  return (
    <View
      style={[
        styles.container,
        {
          // From mockup: bottom: 18px + safe area
          bottom: navigation.bottomNav.bottomOffset + Math.max(insets.bottom, 0),
        },
      ]}
    >
      {/* Blur background for iOS, solid background for Android */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="dark" style={styles.blur}>
          <View style={[styles.innerContainer, { width: navDimensions.width }]}>
            {tabs.map(({ key, ...tabProps }) => (
              <NavItem key={key} {...tabProps} />
            ))}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blur, styles.solidBackground]}>
          <View style={[styles.innerContainer, { width: navDimensions.width }]}>
            {tabs.map(({ key, ...tabProps }) => (
              <NavItem key={key} {...tabProps} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function NavItem({
  label,
  iconOutline,
  iconFilled,
  isActive,
  onPress,
  showBadge,
}: TabConfig) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        isActive && styles.navItemActive,
        pressed && styles.navItemPressed,
      ]}
      hitSlop={defaultHitSlop}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      accessibilityHint={`Navigate to ${label}`}
    >
      {/* Notification badge */}
      {showBadge && <View style={styles.badge} />}

      {/* Icon - swap outline/filled based on active state */}
      <View style={styles.iconContainer}>
        {isActive ? iconFilled : iconOutline}
      </View>

      {/* Note: Labels removed - mockup only shows icons */}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  blur: {
    // From mockup: border-radius: 26px
    borderRadius: navigation.bottomNav.borderRadius,
    overflow: 'hidden',
    // From mockup: border: 1px solid rgba(255, 255, 255, 0.08)
    borderWidth: navigation.bottomNav.borderWidth,
    borderColor: colors.borderSubtle,
    ...shadows.large,
  },
  solidBackground: {
    // From mockup: background: rgba(10, 6, 12, 0.96)
    backgroundColor: 'rgba(10, 6, 12, 0.96)',
  },
  innerContainer: {
    flexDirection: 'row',
    // From mockup: justify-content: space-around
    justifyContent: 'space-around',
    alignItems: 'center',
    // From mockup (plans): padding: 10px
    padding: navigation.bottomNav.paddingPlans,
    // Width is applied dynamically via getBottomNavDimensions()
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // From mockup: aspect-ratio: 1
    aspectRatio: 1,
    // From mockup: max-width: 48px
    maxWidth: navigation.bottomNav.itemMaxWidth,
    // From mockup: border-radius: 16px
    borderRadius: navigation.bottomNav.itemBorderRadius,
    position: 'relative',
  },
  navItemActive: {
    // From mockup: background: rgba(229, 64, 79, 0.16)
    backgroundColor: 'rgba(229, 64, 79, 0.16)',
  },
  navItemPressed: {
    opacity: 0.6,
  },
  iconContainer: {
    // From mockup: width/height: 24px
    width: navigation.bottomNav.iconSize,
    height: navigation.bottomNav.iconSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    // From mockup (plan): top: 6px, right: 6px
    position: 'absolute',
    top: 6,
    right: 6,
    // From mockup: width/height: 8px
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    // From mockup: border: 2px solid rgba(10, 6, 12, 0.96)
    borderWidth: 2,
    borderColor: 'rgba(10, 6, 12, 0.96)',
  },
});
