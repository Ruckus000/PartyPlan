import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { generateTimeMarkers } from '../../utils/timeCalculations';

type TimeColumnProps = {
  width: number;
};

export default function TimeColumn({ width }: TimeColumnProps) {
  const timeMarkers = generateTimeMarkers();

  return (
    <View style={[styles.container, { width }]}>
      {timeMarkers.map((marker, index) => {
        // Apply subtle alternating background: every other 15-min slot
        // Use bgSecondary for even indices (0, 2, 4...) to create subtle stripe
        const isAlternateRow = index % 2 === 0;
        
        return (
          <View
            key={index}
            style={[
              styles.timeMarker,
              marker.isHour && styles.hourMarker,
              isAlternateRow && !marker.isHour && styles.alternateRow,
              { top: marker.topOffset },
            ]}
          >
            <Text
              style={[
                styles.timeText,
                marker.isHour && styles.hourText,
              ]}
              allowFontScaling={true}
            >
              {marker.time}
            </Text>
            {marker.isHour && (
              <Text style={styles.dayText} allowFontScaling={true}>{marker.day}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgPrimary,
    borderRightWidth: 1,
    borderRightColor: colors.borderStrong,
    position: 'relative',
  },
  timeMarker: {
    position: 'absolute',
    height: 60, // 15 minutes
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourMarker: {
    backgroundColor: colors.bgSecondary,
  },
  alternateRow: {
    backgroundColor: colors.bgSecondary,
  },
  timeText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  hourText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayText: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
