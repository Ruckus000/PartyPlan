import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

export type SetBlockVariant = 'planned' | 'friend-set' | 'conflict-set' | 'maybe-set' | 'default';

// Height constants for different purposes
const VISUAL_MIN_HEIGHT = 32; // Minimum height for readability (artist name OR time visible)
const TOUCH_TARGET_HEIGHT = 44; // iOS accessibility guideline for touch targets
const IDEAL_MIN_HEIGHT = 52; // Ideal minimum when space allows

type SetBlockProps = {
  artist: string;
  timeRange: string;
  compactTimeRange: string;
  topPosition: number;
  height: number;
  availableHeight?: number;
  variant?: SetBlockVariant;
  attendees?: string[];
  onPress?: () => void;
  onLongPress?: () => void;
};

const SetBlock = memo(function SetBlock({
  artist,
  timeRange,
  compactTimeRange,
  topPosition,
  height,
  availableHeight = Infinity,
  variant = 'default',
  attendees = [],
  onPress,
  onLongPress,
}: SetBlockProps) {
  // Smart height calculation with readability priority
  // Strategy: Ensure minimum readability even if it causes controlled overlap
  // Short events get high z-index (already calculated below) so they render on top

  // 1. Calculate ideal height (prefer IDEAL_MIN_HEIGHT when space allows)
  const idealHeight = Math.max(height, IDEAL_MIN_HEIGHT);
  const canUseIdeal = availableHeight >= IDEAL_MIN_HEIGHT;

  // 2. Final height: prioritize readability, allow controlled overlap
  const finalHeight = canUseIdeal
    ? Math.min(idealHeight, availableHeight) // Use available space if enough
    : Math.max(height, VISUAL_MIN_HEIGHT);   // Force minimum for readability (may overlap)

  // Determine block size category
  const isVeryShort = finalHeight < 40; // 32-40px - compact display
  const isShort = finalHeight >= 40 && finalHeight < IDEAL_MIN_HEIGHT; // 40-52px
  const isIdealHeight = finalHeight >= IDEAL_MIN_HEIGHT;

  // Padding: tighter for shorter blocks
  const padding = isVeryShort ? 3 : isShort ? 4 : 8;

  // Z-index: shorter blocks get higher z-index to ensure visibility when overlapping
  // Range: 10-100, inversely proportional to height
  const zIndex = Math.max(10, Math.min(100, Math.round(500 / finalHeight)));

  // Visual distinction for short blocks that might overlap
  const willOverlap = finalHeight > availableHeight;
  const borderWidth = isVeryShort && willOverlap ? 2 : 1;

  const blockStyle = [
    styles.block,
    {
      top: topPosition,
      height: finalHeight,
      paddingVertical: padding,
      paddingHorizontal: padding,
      overflow: 'hidden' as const,
      zIndex,
      borderWidth,
      // Very short blocks: full width for better visibility
      left: isVeryShort ? 0 : 4,
      right: isVeryShort ? 0 : 4,
      // Add shadow for very short blocks to create depth when overlapping
      ...(isVeryShort && willOverlap && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5, // Android shadow
      }),
    },
    variant === 'planned' && styles.plannedBlock,
    variant === 'friend-set' && styles.friendBlock,
    variant === 'conflict-set' && styles.conflictBlock,
    variant === 'maybe-set' && styles.maybeBlock,
    variant === 'default' && styles.defaultBlock,
  ];

  // Text color based on variant
  const textColor = variant === 'default' ? styles.defaultText : styles.coloredText;

  const accessibilityLabel = `${artist} from ${timeRange}${attendees.length > 0 ? ` with ${attendees.join(', ')}` : ''}`;

  return (
    <TouchableOpacity
      style={blockStyle}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.content}>
        {/* Very short blocks (32-40px): show artist name OR time, whichever fits better */}
        {isVeryShort ? (
          <Text
            style={[styles.artistNameVeryShort, textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {artist.toUpperCase()}
          </Text>
        ) : (
          <>
            {/* Artist name for all other blocks */}
            <Text
              style={[
                styles.artistName,
                textColor,
                isShort && styles.artistNameShort,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {artist.toUpperCase()}
            </Text>
            {/* Time text for blocks with enough space (short and larger) */}
            {isShort && (
              <Text
                style={[styles.timeTextCompact, textColor]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {compactTimeRange}
              </Text>
            )}
            {/* Time text for ideal-sized blocks */}
            {isIdealHeight && (
              <Text
                style={[styles.timeText, textColor]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {compactTimeRange}
              </Text>
            )}
            {/* Attendees for large blocks */}
            {attendees.length > 0 && finalHeight > 70 && (
              <View style={styles.attendeesContainer}>
                <Text
                  style={[styles.attendeesText, textColor]}
                  numberOfLines={1}
                >
                  {attendees.join(' ')}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default SetBlock;

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },
  artistName: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  artistNameSmall: {
    fontSize: 9,
    lineHeight: 12,
    marginBottom: 1,
    letterSpacing: -0.3,
  },
  artistNameShort: {
    fontSize: 9,
    lineHeight: 11,
    marginBottom: 1,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  artistNameVeryShort: {
    fontSize: 8,
    lineHeight: 10,
    marginBottom: 0,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 8,
    lineHeight: 10,
    opacity: 0.85,
    marginTop: 1,
    letterSpacing: -0.3,
  },
  timeTextCompact: {
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: -0.2,
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
    color: colors.textPrimary,
  },
});
