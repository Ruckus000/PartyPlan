import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  bgSecondary: '#0a0a0a',
  textPrimary: '#ffffff',
  textMuted: '#606060',
};

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
        <Text style={styles.meta}>{meta}</Text>
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
    marginRight: 12,
    minWidth: 80,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  timeline: {
    flexDirection: 'row',
  },
});