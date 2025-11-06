import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { seedSets } from '../data/seedLineup';
import TimeBlock from '../components/TimeBlock';
import StageLane from '../components/StageLane';

const colors = {
  bgSecondary: '#0a0a0a',
};

// Group sets by time
const setsByTime = seedSets.reduce((acc, set) => {
  const time = new Date(set.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (!acc[time]) {
    acc[time] = [];
  }
  acc[time].push(set);
  return acc;
}, {} as Record<string, typeof seedSets>);

const stages = ['Kinetic Field', 'Circuit Grounds', 'Neon Garden', 'Quantum Valley'];

export default function TimelineScreen() {
  return (
    <ScrollView style={styles.container}>
      {Object.entries(setsByTime).map(([time, sets]) => {
        const setsByStage = stages.map(stage => ({
          stage,
          sets: sets.filter(set => set.stage === stage).map(s => ({ artist: s.artist })),
        }));

        return (
          <TimeBlock key={time} time={time} meta="">
            {setsByStage.map(stageData => (
              <StageLane key={stageData.stage} stage={stageData.stage} sets={stageData.sets} />
            ))}
          </TimeBlock>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    padding: 16,
  },
});