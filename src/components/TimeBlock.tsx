import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

type TimeBlockProps = {
  time: string;
  meta: string;
  children: React.ReactNode;
};

export default function TimeBlock({ time, meta, children }: TimeBlockProps) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Text style={styles.label}>{time}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <View style={styles.timeline}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 8,
  },
  label: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 16,
    width: 120,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  timeline: {
    flexDirection: 'row',
    gap: 4,
  },
});