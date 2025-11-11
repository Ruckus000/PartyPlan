import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import StageHeaders from './StageHeaders';
import TimeColumn from './TimeColumn';
import StageColumn from './StageColumn';
import MeetupBlock from './MeetupBlock';
import GridLines from './GridLines';
import NowIndicator from './NowIndicator';
import DayDivider from './DayDivider';
import { colors } from '../../constants/colors';
import { getTimelineHeight, getCurrentTimePosition, timeToPixels, PIXELS_PER_MINUTE, EVENT_START_HOUR, EVENT_END_HOUR } from '../../utils/timeCalculations';
import { SetBlockVariant } from './SetBlock';

type ArtistSet = {
  id: string;
  artist: string;
  start: string;
  end: string;
  stage: string;
};

type Meetup = {
  id: string;
  time: string;
  location: string;
  note?: string;
};

type Stage = {
  id: string;
  name: string;
  host?: string;
};

type TimelineGanttProps = {
  stages: Stage[];
  sets: ArtistSet[];
  meetups?: Meetup[];
  plannedSetIds?: Set<string>;
  attendeesBySetId?: Map<string, string[]>;
  onSetPress?: (setId: string) => void;
  onSetLongPress?: (setId: string) => void;
  onMeetupPress?: (meetupId: string) => void;
  onMeetupLongPress?: (meetupId: string) => void;
};

export default function TimelineGantt({
  stages,
  sets,
  meetups = [],
  plannedSetIds = new Set(),
  attendeesBySetId = new Map(),
  onSetPress,
  onSetLongPress,
  onMeetupPress,
  onMeetupLongPress,
}: TimelineGanttProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const timelineHeight = getTimelineHeight();
  const { width: screenWidth } = useWindowDimensions();
  
  // Calculate responsive time column width: 18% of screen, clamped between 72px and 80px
  const timeColumnWidth = Math.max(72, Math.min(80, screenWidth * 0.18));

  // Calculate day divider positions
  const hoursPerDay = EVENT_END_HOUR - EVENT_START_HOUR; // 11 hours
  const pixelsPerDay = hoursPerDay * 60 * PIXELS_PER_MINUTE; // 2640 pixels

  // Day divider dimensions and spacing
  const DAY_DIVIDER_HEIGHT = 40;
  const DAY_DIVIDER_TOP_MARGIN = 8;
  const DIVIDER_CLEARANCE = 48; // ~12 minutes of space above divider for Saturday/Sunday

  const dayDividers = [
    // Position Friday divider above timeline content (negative position, in padding area)
    { label: 'FRIDAY, NOVEMBER 7', position: -(DAY_DIVIDER_HEIGHT + DAY_DIVIDER_TOP_MARGIN), isFirst: true },
    { label: 'SATURDAY, NOVEMBER 8', position: pixelsPerDay - DIVIDER_CLEARANCE, isFirst: false },
    { label: 'SUNDAY, NOVEMBER 9', position: (pixelsPerDay * 2) - DIVIDER_CLEARANCE, isFirst: false },
  ];

  // Group sets by stage
  const setsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = sets
      .filter(set => set.stage === stage.id)
      .map(set => ({
        ...set,
        variant: (plannedSetIds.has(set.id) ? 'planned' : 'default') as SetBlockVariant,
        attendees: attendeesBySetId.get(set.id) || [],
      }));
    return acc;
  }, {} as Record<string, Array<ArtistSet & { variant: SetBlockVariant; attendees: string[] }>>);

  // Auto-scroll to current time on mount
  useEffect(() => {
    const currentPosition = getCurrentTimePosition();
    if (scrollViewRef.current && currentPosition > 0) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentPosition - 200 + 48), // Center-ish, accounting for new paddingTop (48px)
          animated: true,
        });
      }, 100);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StageHeaders stages={stages} timeColumnWidth={timeColumnWidth} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.timelineGrid, { height: timelineHeight }]}>
          <TimeColumn width={timeColumnWidth} />
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              sets={setsByStage[stage.id] || []}
              onSetPress={onSetPress}
              onSetLongPress={onSetLongPress}
            />
          ))}
          <GridLines leftOffset={timeColumnWidth} />
          <NowIndicator />
          {/* Day dividers */}
          {dayDividers.map((divider, index) => (
            <DayDivider
              key={index}
              dayLabel={divider.label}
              topPosition={divider.position}
              isFirst={index === 0}
              leftOffset={timeColumnWidth}
            />
          ))}
          {/* Meetup blocks overlay */}
          {meetups.map((meetup) => (
            <MeetupBlock
              key={meetup.id}
              location={meetup.location}
              note={meetup.note}
              topPosition={timeToPixels(meetup.time)}
              onPress={() => onMeetupPress?.(meetup.id)}
              onLongPress={() => onMeetupLongPress?.(meetup.id)}
            />
          ))}
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
  scrollContent: {
    paddingTop: 48, // Space for Friday day divider (40px height + 8px margin)
    paddingBottom: 16,
  },
  timelineGrid: {
    flexDirection: 'row',
    position: 'relative',
  },
});
