import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { colors, radii, typography } from '../../theme/tokens';
import { ToggleSwitch } from './ToggleSwitch';

export type SettingIcon =
  | 'user'
  | 'bell'
  | 'help'
  | 'mail'
  | 'chevron';

interface SettingItemProps {
  icon: SettingIcon;
  label: string;
  description?: string;
  onPress?: () => void;
  showChevron?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  isLastItem?: boolean;
}

/**
 * SettingItem - Individual settings row
 * Matches .setting-item from profile.html
 */
export function SettingItem({
  icon,
  label,
  description,
  onPress,
  showChevron = false,
  toggleValue,
  onToggleChange,
  isLastItem = false,
}: SettingItemProps) {
  const hasToggle = toggleValue !== undefined && onToggleChange;
  const isInteractive = onPress || hasToggle;

  const accessibilityLabel = `${label}${description ? `. ${description}` : ''}${
    hasToggle ? `. ${toggleValue ? 'Enabled' : 'Disabled'}` : ''
  }`;

  const content = (
    <>
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <SettingIconSvg icon={icon} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>

      <View style={styles.right}>
        {hasToggle ? (
          <ToggleSwitch
            value={toggleValue}
            onValueChange={onToggleChange}
            accessibilityLabel={`Toggle ${label}`}
          />
        ) : showChevron ? (
          <ChevronIcon />
        ) : null}
      </View>
    </>
  );

  if (!isInteractive) {
    return (
      <View style={[styles.container, isLastItem && styles.containerLast]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={hasToggle ? undefined : 'Tap to open'}
      style={({ pressed }) => [
        styles.container,
        isLastItem && styles.containerLast,
        pressed && styles.containerPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

function SettingIconSvg({ icon }: { icon: SettingIcon }) {
  const commonProps = {
    width: 20,
    height: 20,
    stroke: colors.textSecondary,
    strokeWidth: 2,
    fill: 'none',
  };

  switch (icon) {
    case 'user':
      return (
        <Svg viewBox="0 0 24 24" {...commonProps}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg viewBox="0 0 24 24" {...commonProps}>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
    case 'help':
      return (
        <Svg viewBox="0 0 24 24" {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg viewBox="0 0 24 24" {...commonProps}>
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <Polyline points="22,6 12,13 2,6" />
        </Svg>
      );
    default:
      return null;
  }
}

function ChevronIcon() {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.textMuted}
      strokeWidth={2}
    >
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    minHeight: 44, // Touch target
  },
  containerLast: {
    borderBottomWidth: 0,
  },
  containerPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  description: {
    fontSize: typography.size.base,
    color: colors.textMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
