import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, radii, shadows } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'soft' | 'elevated';
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * Card - Reusable glass card component
 * Mimics .feed-card, .squad-card, .settings-card from HTML mockups
 * - Semi-transparent background
 * - Subtle border
 * - Rounded corners
 * - Optional pressable interaction
 */
export function Card({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  style,
  contentStyle,
}: CardProps) {
  const cardStyle = [
    styles.base,
    variant === 'soft' && styles.soft,
    variant === 'elevated' && styles.elevated,
    style,
  ];

  if (pressable || onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
      >
        <View style={contentStyle}>{children}</View>
      </Pressable>
    );
  }

  return <View style={[cardStyle, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  soft: {
    backgroundColor: colors.bgCardSoft,
  },
  elevated: {
    backgroundColor: colors.bgCard,
    ...shadows.medium,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

/**
 * CardSection - Padded section within a card
 */
interface CardSectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function CardSection({
  children,
  style,
  padding = 16,
}: CardSectionProps) {
  return <View style={[{ padding }, style]}>{children}</View>;
}

/**
 * CardDivider - Subtle horizontal divider
 */
export function CardDivider() {
  return <View style={dividerStyles.divider} />;
}

const dividerStyles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
