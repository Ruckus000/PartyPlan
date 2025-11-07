import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

type Stage = {
  id: string;
  name: string;
  host?: string;
};

type StageHeadersProps = {
  stages: Stage[];
};

export default function StageHeaders({ stages }: StageHeadersProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timeColumnHeader}>
        <Text style={styles.timeColumnText}>TIME</Text>
      </View>
      {stages.map((stage) => (
        <View key={stage.id} style={styles.stageHeader}>
          <Text style={styles.stageName} numberOfLines={1}>
            {stage.name}
          </Text>
          {stage.host && (
            <Text style={styles.stageHost} numberOfLines={1}>
              {stage.host}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  timeColumnHeader: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  timeColumnText: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stageHeader: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 0,
  },
  stageName: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  stageHost: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
