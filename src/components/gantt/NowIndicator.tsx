import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { getCurrentTimePosition } from '../../utils/timeCalculations';

export default function NowIndicator() {
  const [position, setPosition] = useState(getCurrentTimePosition());

  useEffect(() => {
    // Update position every minute
    const interval = setInterval(() => {
      setPosition(getCurrentTimePosition());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't render if outside event hours
  if (position < 0) {
    return null;
  }

  return (
    <View style={[styles.container, { top: position }]} pointerEvents="none">
      <View style={styles.label}>
        <Text style={styles.labelText}>NOW</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 25,
  },
  label: {
    position: 'absolute',
    left: 8,
    top: -10,
    backgroundColor: colors.accentRed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  line: {
    position: 'absolute',
    left: 60,
    right: 0,
    height: 2,
    backgroundColor: colors.accentRed,
  },
});
