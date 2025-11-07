import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

type MeetupBlockProps = {
  location: string;
  note?: string;
  topPosition: number;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function MeetupBlock({
  location,
  note,
  topPosition,
  onPress,
  onLongPress,
}: MeetupBlockProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { top: topPosition }]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <View style={styles.textContainer}>
          <Text style={styles.location} numberOfLines={2}>
            {location}
          </Text>
          {note && (
            <Text style={styles.note} numberOfLines={1}>
              {note}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 8,
    right: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  location: {
    color: colors.accentBlue,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
