import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

type FabProps = {
  onPress: () => void;
};

export default function Fab({ onPress }: FabProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accentBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.accentBlue,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '400',
    includeFontPadding: false,
  },
});
