import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, typography } from '../../theme/tokens';

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
          isFeatured && styles.iconWrapperFeatured,
          isActive && styles.iconWrapperActive,
        ]}
      >
        {icon}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.label, isFeatured && styles.labelFeatured]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {count && <Text style={styles.count}>{count}</Text>}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 140,
    backgroundColor: 'rgba(21, 16, 25, 0.6)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 18,
    padding: 16,
    position: 'relative',
  },
  containerFeatured: {
    width: 200,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconWrapperFeatured: {
    width: 40,
    height: 40,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(229, 64, 79, 0.15)',
  },
  content: {
    gap: 3,
  },
  label: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    letterSpacing: -0.01,
    color: colors.textPrimary,
    lineHeight: 17,
  },
  labelFeatured: {
    fontSize: typography.size.md,
  },
  count: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    lineHeight: 14,
  },
});
