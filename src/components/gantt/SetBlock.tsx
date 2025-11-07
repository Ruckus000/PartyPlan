import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

export type SetBlockVariant = 'planned' | 'friend-set' | 'conflict-set' | 'maybe-set' | 'default';

type SetBlockProps = {
  artist: string;
  timeRange: string;
  topPosition: number;
  height: number;
  variant?: SetBlockVariant;
  attendees?: string[];
  onPress?: () => void;
  onLongPress?: () => void;
};

const SetBlock = memo(function SetBlock({
  artist,
  timeRange,
  topPosition,
  height,
  variant = 'default',
  attendees = [],
  onPress,
  onLongPress,
}: SetBlockProps) {
  const blockStyle = [
    styles.block,
    {
      top: topPosition,
      height: height,
    },
    variant === 'planned' && styles.plannedBlock,
    variant === 'friend-set' && styles.friendBlock,
    variant === 'conflict-set' && styles.conflictBlock,
    variant === 'maybe-set' && styles.maybeBlock,
    variant === 'default' && styles.defaultBlock,
  ];

  // Text color based on variant
  const textColor = variant === 'default' ? styles.defaultText : styles.coloredText;

  return (
    <TouchableOpacity
      style={blockStyle}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.8}
    >
      <Text style={[styles.artistName, textColor]} numberOfLines={height < 50 ? 1 : 2}>
        {artist.toUpperCase()}
      </Text>
      {height > 40 && (
        <Text style={[styles.timeText, textColor]} numberOfLines={1}>
          {timeRange}
        </Text>
      )}
      {attendees.length > 0 && height > 60 && (
        <View style={styles.attendeesContainer}>
          <Text style={[styles.attendeesText, textColor]} numberOfLines={1}>
            {attendees.join(' ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default SetBlock;

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 6,
    padding: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  artistName: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },
  timeText: {
    fontSize: 8,
    opacity: 0.85,
    marginBottom: 3,
  },
  attendeesContainer: {
    marginTop: 'auto',
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  attendeesText: {
    fontSize: 8,
    opacity: 0.9,
  },
  // Variant styles
  plannedBlock: {
    backgroundColor: colors.accentBlue,
    color: colors.white,
  },
  friendBlock: {
    backgroundColor: colors.accentGreen,
    color: colors.white,
  },
  conflictBlock: {
    backgroundColor: colors.accentRed,
    color: colors.white,
  },
  maybeBlock: {
    backgroundColor: colors.accentYellow,
    color: colors.white,
  },
  defaultBlock: {
    backgroundColor: colors.bgCard,
    borderColor: colors.border,
  },
  // Text colors
  coloredText: {
    color: colors.white,
  },
  defaultText: {
    color: colors.textSecondary,
  },
});
