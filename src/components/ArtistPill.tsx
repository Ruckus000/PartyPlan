import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../constants/colors';

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
    borderColor: colors.white,
  },
  pillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
});