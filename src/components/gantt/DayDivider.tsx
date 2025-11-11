import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type DayDividerProps = {
  dayLabel: string;
  topPosition: number;
  isFirst?: boolean;
  leftOffset: number;
};

export default function DayDivider({ dayLabel, topPosition, isFirst = false, leftOffset }: DayDividerProps) {
  return (
    <View style={[styles.container, { top: topPosition, left: leftOffset }]}>
      <View style={styles.line} />
      <View style={styles.labelContainer}>
        <Text style={styles.labelText} allowFontScaling={true}>{dayLabel}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 200, // Above all set blocks (max z-index 100)
    backgroundColor: colors.bgPrimary,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderStrong,
  },
  labelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.bgPrimary,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
});
