import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import StageHeaders from './StageHeaders';
import TimeColumn from './TimeColumn';
import StageColumn from './StageColumn';
import { colors } from '../../constants/colors';
import { getTimelineHeight, getCurrentTimePosition } from '../../utils/timeCalculations';
import { SetBlockVariant } from './SetBlock';

type ArtistSet = {
  id: string;
  artist: string;
  start: string;
  end: string;
  stage: string;
};

type Stage = {
  id: string;
  name: string;
  host?: string;
};

type TimelineGanttProps = {
  stages: Stage[];
  sets: ArtistSet[];
  plannedSetIds?: Set<string>;
  onSetPress?: (setId: string) => void;
  onSetLongPress?: (setId: string) => void;
};

export default function TimelineGantt({
  stages,
  sets,
  plannedSetIds = new Set(),
  onSetPress,
  onSetLongPress,
}: TimelineGanttProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const timelineHeight = getTimelineHeight();

  // Group sets by stage
  const setsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = sets
      .filter(set => set.stage === stage.id)
      .map(set => ({
        ...set,
        variant: (plannedSetIds.has(set.id) ? 'planned' : 'default') as SetBlockVariant,
      }));
    return acc;
  }, {} as Record<string, Array<ArtistSet & { variant: SetBlockVariant }>>);

  // Auto-scroll to current time on mount
  useEffect(() => {
    const currentPosition = getCurrentTimePosition();
    if (scrollViewRef.current && currentPosition > 0) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentPosition - 200), // Center-ish
          animated: true,
        });
      }, 100);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StageHeaders stages={stages} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.timelineGrid, { height: timelineHeight }]}>
          <TimeColumn />
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              sets={setsByStage[stage.id] || []}
              onSetPress={onSetPress}
              onSetLongPress={onSetLongPress}
            />
          ))}
          {/* TODO: Add grid lines and "now" indicator in future phase */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  scrollView: {
    flex: 1,
  },
  timelineGrid: {
    flexDirection: 'row',
    position: 'relative',
  },
});
