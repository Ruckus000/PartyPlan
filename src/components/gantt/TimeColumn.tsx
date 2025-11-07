import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { generateTimeMarkers } from '../../utils/timeCalculations';

export default function TimeColumn() {
  const timeMarkers = generateTimeMarkers();

  return (
    <View style={styles.container}>
      {timeMarkers.map((marker, index) => (
        <View
          key={index}
          style={[
            styles.timeMarker,
            marker.isHour && styles.hourMarker,
            { top: marker.topOffset },
          ]}
        >
          <Text
            style={[
              styles.timeText,
              marker.isHour && styles.hourText,
            ]}
          >
            {marker.time}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
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
  timeText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  hourText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
