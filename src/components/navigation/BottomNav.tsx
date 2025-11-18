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
import { colors, radii, shadows, typography } from '../../theme/tokens';

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
 * - Fixed at bottom center
 * - Rounded corners (radius-lg)
 * - Blur background effect
 * - Icon swap on active state (outline → filled)
 * - Uppercase labels
 * - Safe area inset handling
 */
export function BottomNav({ tabs }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 18),
        },
      ]}
    >
      {/* Blur background for iOS, solid background for Android */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="dark" style={styles.blur}>
          <View style={styles.innerContainer}>
            {tabs.map((tab) => (
              <NavItem key={tab.key} {...tab} />
            ))}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blur, styles.solidBackground]}>
          <View style={styles.innerContainer}>
            {tabs.map((tab) => (
              <NavItem key={tab.key} {...tab} />
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
    >
      {/* Notification badge */}
      {showBadge && <View style={styles.badge} />}

      {/* Icon - swap outline/filled based on active state */}
      <View style={styles.iconContainer}>
        {isActive ? iconFilled : iconOutline}
      </View>

      {/* Label - only show on larger screens or when active */}
      {isActive && (
        <Text style={styles.navLabel} numberOfLines={1}>
          {label}
        </Text>
      )}
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
    borderRadius: radii.lg + 2, // 26px to match mockups
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.large,
  },
  solidBackground: {
    backgroundColor: 'rgba(10, 6, 12, 0.96)',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '90%',
    maxWidth: 320, // Smaller than home mockup's 400px for compact look
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    maxWidth: 48,
    borderRadius: 16,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(229, 64, 79, 0.16)',
  },
  navItemPressed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: 'rgba(10, 6, 12, 0.96)',
  },
});
