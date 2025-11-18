import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, typography, transitions } from '../../theme/tokens';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/**
 * SegmentedControl - Toggle between views
 * Matches .view-toggle from home.html
 */
export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <Pressable
          key={option}
          onPress={() => onChange(index)}
          accessibilityLabel={`${option} view`}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedIndex === index }}
          style={({ pressed }) => [
            styles.button,
            selectedIndex === index && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              selectedIndex === index && styles.buttonTextActive,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radii.pill,
    padding: 3,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    flex: 1,
    paddingVertical: 11, // Increased from 9 to meet 44px minimum touch target
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38, // Ensures button itself is at least 38px (container adds 6px)
  },
  buttonActive: {
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: typography.weight.medium,
  },
});
