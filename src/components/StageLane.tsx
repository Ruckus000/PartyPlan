import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ArtistPill from './ArtistPill';
import { colors } from '../constants/colors';

type StageLaneProps = {
  stage: string;
  sets: { artist: string, variant?: 'friend' | 'conflict' | 'maybe' | 'planned', setId?: string }[];
  onDeleteSet?: (setId: string) => void;
};

export default function StageLane({ stage, sets, onDeleteSet }: StageLaneProps) {
  const isEmpty = sets.length === 0;

  return (
    <View style={[styles.lane, isEmpty && styles.emptyLane]}>
      <Text style={[styles.stageLabel, isEmpty && styles.emptyStageLabel]}>{stage}</Text>
      {sets.length > 0 ? (
        <View style={styles.pillContainer}>
          {sets.map((set, index) => (
            <ArtistPill
              key={index}
              artist={set.artist}
              variant={set.variant}
              setId={set.setId}
              onDelete={onDeleteSet}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Empty</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    flex: 1,
    minHeight: 70,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'flex-start',
  },
  emptyLane: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  stageLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: 6,
  },
  emptyStageLabel: {
    color: 'rgba(59, 130, 246, 0.7)',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  emptyText: {
    color: 'rgba(59, 130, 246, 0.6)',
    fontSize: 11,
    padding: 4,
  },
});