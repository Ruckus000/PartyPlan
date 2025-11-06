import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

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
  setId?: string; // For planned pills, to enable delete
  onDelete?: (setId: string) => void; // Delete handler
};

export default function ArtistPill({ artist, variant, setId, onDelete }: ArtistPillProps) {
  const pillStyle = [
    styles.pill,
    variant === 'friend' && styles.friend,
    variant === 'conflict' && styles.conflict,
    variant === 'maybe' && styles.maybe,
    variant === 'planned' && styles.planned,
  ];

  const handleLongPress = () => {
    if (variant === 'planned' && setId && onDelete) {
      Alert.alert(
        'Remove from schedule?',
        `Remove ${artist} from your schedule?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(setId),
          },
        ]
      );
    }
  };

  // If it's a planned pill, make it interactive
  if (variant === 'planned' && setId && onDelete) {
    return (
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={pillStyle}>
          <Text style={styles.pillText}>{artist}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Otherwise, just a static pill
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