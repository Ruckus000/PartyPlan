import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { generateTimeMarkers } from '../../utils/timeCalculations';

export default function GridLines() {
  const timeMarkers = generateTimeMarkers();

  return (
    <View style={styles.container} pointerEvents="none">
      {timeMarkers.map((marker, index) => (
        <View
          key={index}
          style={[
            styles.gridLine,
            marker.isHour && styles.hourLine,
            { top: marker.topOffset },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 60, // Start after time column
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: colors.border,
  },
  hourLine: {
    backgroundColor: colors.borderStrong,
  },
});
