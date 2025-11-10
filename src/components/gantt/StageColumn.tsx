import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SetBlock, { SetBlockVariant } from './SetBlock';
import { colors } from '../../constants/colors';
import { timeToPixels, durationToPixels, formatTimeRange, formatCompactTimeRange, generateTimeMarkers } from '../../utils/timeCalculations';

type SetData = {
  id: string;
  artist: string;
  start: string;
  end: string;
  variant?: SetBlockVariant;
  attendees?: string[];
};

type StageColumnProps = {
  sets: SetData[];
  onSetPress?: (setId: string) => void;
  onSetLongPress?: (setId: string) => void;
};

const StageColumn = memo(function StageColumn({ sets, onSetPress, onSetLongPress }: StageColumnProps) {
  const timeMarkers = generateTimeMarkers();

  // Sort sets by start time to find next set for each
  const sortedSets = [...sets].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <View style={styles.container}>
      {/* Subtle alternating background rows matching TimeColumn pattern */}
      {timeMarkers.map((marker, index) => {
        const isAlternateRow = index % 2 === 0;
        if (marker.isHour) return null; // Hour markers handled by TimeColumn

        return (
          <View
            key={`bg-${index}`}
            style={[
              styles.backgroundRow,
              isAlternateRow && styles.alternateBackgroundRow,
              { top: marker.topOffset },
            ]}
            pointerEvents="none"
          />
        );
      })}

      {sortedSets.map((set, index) => {
        const topPosition = Math.max(0, timeToPixels(set.start));
        const actualHeight = durationToPixels(set.start, set.end); // Raw height without minimum
        const timeRange = formatTimeRange(set.start, set.end);
        const compactTimeRange = formatCompactTimeRange(set.start, set.end);

        // Find next set on this stage to calculate available space
        const nextSet = sortedSets.find((s, i) =>
          i > index && new Date(s.start).getTime() >= new Date(set.end).getTime()
        );

        // Calculate available space (from this set's start to next set's start)
        const availableHeight = nextSet
          ? durationToPixels(set.start, nextSet.start)
          : Infinity; // No limit if no next set

        return (
          <SetBlock
            key={set.id}
            artist={set.artist}
            timeRange={timeRange}
            compactTimeRange={compactTimeRange}
            topPosition={topPosition}
            height={actualHeight}
            availableHeight={availableHeight}
            variant={set.variant}
            attendees={set.attendees}
            onPress={() => onSetPress?.(set.id)}
            onLongPress={() => onSetLongPress?.(set.id)}
          />
        );
      })}
    </View>
  );
});

export default StageColumn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 68, // Ensure minimum width for text visibility
    backgroundColor: colors.bgPrimary,
  },
  backgroundRow: {
    position: 'absolute',
    height: 60, // 15 minutes
    width: '100%',
    left: 0,
    right: 0,
  },
  alternateBackgroundRow: {
    backgroundColor: colors.bgSecondary,
  },
});
