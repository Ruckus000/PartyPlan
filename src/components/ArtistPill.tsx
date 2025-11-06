import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  accentBlue: '#3b82f6',
  accentGreen: '#10b981',
  accentRed: '#ef4444',
  accentYellow: '#f59e0b',
  white: '#ffffff',
};

type ArtistPillProps = {
  artist: string;
  variant?: 'friend' | 'conflict' | 'maybe' | 'planned';
};

export default function ArtistPill({ artist, variant }: ArtistPillProps) {
  const pillStyle = [
    styles.pill,
    variant === 'friend' && styles.friend,
    variant === 'conflict' && styles.conflict,
    variant === 'maybe' && styles.maybe,
    variant === 'planned' && styles.planned,
  ];

  return (
    <View style={pillStyle}>
      <Text style={styles.pillText}>{artist}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.accentBlue,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    margin: 2,
  },
  friend: {
    backgroundColor: colors.accentGreen,
  },
  conflict: {
    backgroundColor: colors.accentRed,
  },
  maybe: {
    backgroundColor: colors.accentYellow,
  },
  planned: {
    backgroundColor: colors.accentGreen,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  pillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
});