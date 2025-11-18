import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, typography } from '../../theme/tokens';

export type StatusType = 'urgent' | 'needs-input' | 'active' | 'pending';

interface StatusBadgeProps {
  type: StatusType;
  text: string;
  showIcon?: boolean;
}

/**
 * StatusBadge - Status indicators for plans
 * Matches .status-badge from plan.html
 */
export function StatusBadge({ type, text, showIcon = false }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, styles[type]]}>
      {showIcon && type === 'urgent' && (
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>!</Text>
        </View>
      )}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  urgent: {
    backgroundColor: 'rgba(229, 64, 79, 0.15)',
    borderColor: 'rgba(229, 64, 79, 0.3)',
  },
  'needs-input': {
    backgroundColor: 'rgba(243, 150, 106, 0.15)',
    borderColor: 'rgba(243, 150, 106, 0.3)',
  },
  active: {
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
    borderColor: 'rgba(67, 233, 123, 0.2)',
  },
  pending: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconWrapper: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.accent,
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
});
