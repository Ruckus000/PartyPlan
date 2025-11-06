
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SquadScreen() {
  return (
    <View style={styles.container}>
      <Text>Squad Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
