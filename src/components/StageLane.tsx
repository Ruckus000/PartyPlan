import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ArtistPill from './ArtistPill';

const colors = {
  bgCard: '#141414',
  textMuted: '#606060',
};

type StageLaneProps = {
  stage: string;
  sets: { artist: string, variant?: 'friend' | 'conflict' | 'maybe' }[];
};

export default function StageLane({ stage, sets }: StageLaneProps) {
  return (
    <View style={styles.lane}>
      <Text style={styles.stageLabel}>{stage}</Text>
      {sets.length > 0 ? (
        sets.map((set, index) => (
          <ArtistPill key={index} artist={set.artist} variant={set.variant} />
        ))
      ) : (
        <Text style={styles.emptyText}>Empty</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    flex: 1,
    minHeight: 60,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
  },
  stageLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
    padding: 8,
  },
});