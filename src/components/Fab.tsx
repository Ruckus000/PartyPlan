
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const colors = {
  accentBlue: '#3b82f6',
  white: '#ffffff',
};

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
    right: 20, // Changed from left to right for better placement
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 28, // Adjust for vertical centering
  },
});
