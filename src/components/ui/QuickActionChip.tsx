import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, typography } from '../../theme/tokens';
import { useQuickActionDimensions } from '../../hooks/useQuickActionDimensions';

interface QuickActionChipProps {
  label: string;
  count?: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isFeatured?: boolean;
  badge?: string;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * QuickActionChip - Filter/action chips
 * Matches .action-card from home.html
 */
export const QuickActionChip = React.memo(function QuickActionChip({
  label,
  count,
  icon,
  isActive = false,
  isFeatured = false,
  badge,
  onPress,
  style,
}: QuickActionChipProps) {
  const dimensions = useQuickActionDimensions();
  const accessibilityLabel = `${label} filter. ${count || ''}${badge ? `. ${badge}` : ''}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityHint={`Filter festivals by ${label.toLowerCase()}`}
      style={({ pressed }) => [
        styles.container,
        { width: isFeatured ? dimensions.featured : dimensions.standard },
        isFeatured && styles.containerFeatured,
        isActive && styles.containerActive,
        pressed && styles.containerPressed,
        style,
      ]}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <View
        style={[
          styles.iconWrapper,
          {
            width: isFeatured ? dimensions.iconWrapper.featured : dimensions.iconWrapper.standard,
            height: isFeatured ? dimensions.iconWrapper.featured : dimensions.iconWrapper.standard,
          },
          isFeatured && styles.iconWrapperFeatured,
          isActive && styles.iconWrapperActive,
        ]}
      >
        {icon}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.label, isFeatured && styles.labelFeatured]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
        {count && (
          <Text style={styles.count} numberOfLines={1} ellipsizeMode="tail">
            {count}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    // width: 140, // Handled dynamically
    minHeight: 68,
    maxHeight: 68,
    backgroundColor: 'rgba(21, 16, 25, 0.6)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    padding: 10,
    position: 'relative',
  },
  containerFeatured: {
    // width: 200, // Handled dynamically
  },
  containerActive: {
    backgroundColor: 'rgba(229, 64, 79, 0.08)',
    borderColor: 'rgba(229, 64, 79, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  containerPressed: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(229, 64, 79, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(229, 64, 79, 0.3)',
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  iconWrapper: {
    // width: 36, // Handled dynamically
    // height: 36, // Handled dynamically
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconWrapperFeatured: {
    // width: 40, // Handled dynamically
    // height: 40, // Handled dynamically
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(229, 64, 79, 0.15)',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: colors.textPrimary,
    lineHeight: 17,
  },
  labelFeatured: {
    fontSize: typography.size.md,
  },
  count: {
    fontSize: 10,
    color: colors.textMuted,
    opacity: 0.7,
    lineHeight: 14,
  },
});

