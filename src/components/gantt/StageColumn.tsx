import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import SetBlock, { SetBlockVariant } from './SetBlock';
import { colors } from '../../constants/colors';
import { timeToPixels, durationToPixels, formatTimeRange } from '../../utils/timeCalculations';

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
  return (
    <View style={styles.container}>
      {sets.map((set) => {
        const topPosition = timeToPixels(set.start);
        const height = durationToPixels(set.start, set.end);
        const timeRange = formatTimeRange(set.start, set.end);

        return (
          <SetBlock
            key={set.id}
            artist={set.artist}
            timeRange={timeRange}
            topPosition={topPosition}
            height={height}
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
    minWidth: 0,
  },
});
