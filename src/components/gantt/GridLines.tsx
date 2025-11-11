import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { generateTimeMarkers } from '../../utils/timeCalculations';

type GridLinesProps = {
  leftOffset: number;
};

export default function GridLines({ leftOffset }: GridLinesProps) {
  const timeMarkers = generateTimeMarkers();

  return (
    <View style={[styles.container, { left: leftOffset }]} pointerEvents="none">
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
