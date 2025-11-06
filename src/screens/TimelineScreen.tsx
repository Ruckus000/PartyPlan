import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { seedSets } from '../data/seedLineup';
import TimeBlock from '../components/TimeBlock';
import StageLane from '../components/StageLane';
import { useStore } from '../lib/store';

const colors = {
  bgSecondary: '#0a0a0a',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
};

const stages = ['Kinetic Field', 'Circuit Grounds', 'Neon Garden', 'Quantum Valley'];

export default function TimelineScreen() {
  const { plans, squads, activeSquadId } = useStore();

  const activeSquad = squads.find(s => s.id === activeSquadId);

  // Create a Set of planned set IDs for quick lookup
  const plannedSetIds = useMemo(() => {
    return new Set(
      plans
        .filter(plan => plan.type === 'set' && plan.set_id)
        .map(plan => plan.set_id!)
    );
  }, [plans]);

  // Get meetup plans
  const meetupPlans = useMemo(() => {
    return plans.filter(plan => plan.type === 'meetup');
  }, [plans]);

  // Group sets by time
  const setsByTime = useMemo(() => {
    return seedSets.reduce((acc, set) => {
      const time = new Date(set.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(set);
      return acc;
    }, {} as Record<string, typeof seedSets>);
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Active Squad Indicator */}
      {activeSquad && (
        <View style={styles.squadIndicator}>
          <Text style={styles.squadLabel}>Squad:</Text>
          <Text style={styles.squadName}>{activeSquad.name}</Text>
        </View>
      )}

      {plans.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No plans yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap + to add artists or meetups</Text>
        </View>
      )}

      {Object.entries(setsByTime).map(([time, sets]) => {
        // Get meetups for this time slot
        const meetupsAtThisTime = meetupPlans.filter(plan => plan.meet_time === time);

        const setsByStage = stages.map(stage => ({
          stage,
          sets: sets
            .filter(set => set.stage === stage)
            .map(s => ({
              artist: s.artist,
              variant: plannedSetIds.has(s.id) ? ('planned' as const) : undefined,
            })),
        }));

        return (
          <View key={time}>
            <TimeBlock time={time} meta="">
              {setsByStage.map(stageData => (
                <StageLane key={stageData.stage} stage={stageData.stage} sets={stageData.sets} />
              ))}
            </TimeBlock>

            {/* Display meetup plans */}
            {meetupsAtThisTime.map(meetup => (
              <View key={meetup.id} style={styles.meetupCard}>
                <Text style={styles.meetupIcon}>📍</Text>
                <View style={styles.meetupInfo}>
                  <Text style={styles.meetupLocation}>{meetup.meet_location}</Text>
                  {meetup.note && <Text style={styles.meetupNote}>{meetup.note}</Text>}
                </View>
              </View>
            ))}
          </View>
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
  squadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 16,
  },
  squadLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  squadName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  meetupCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetupIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  meetupInfo: {
    flex: 1,
  },
  meetupLocation: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetupNote: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});