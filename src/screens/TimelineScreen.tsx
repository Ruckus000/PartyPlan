import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { seedSets } from '../data/seedLineup';
import TimeBlock from '../components/TimeBlock';
import StageLane from '../components/StageLane';
import { useStore } from '../lib/store';
import { useSyncContext } from '../contexts/SyncContext';
import { supabase } from '../lib/supabase';
import { Plan } from '../types';

const colors = {
  bgSecondary: '#0a0a0a',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accentBlue: '#3b82f6',
};

const stages = ['Kinetic Field', 'Circuit Grounds', 'Neon Garden', 'Quantum Valley'];

export default function TimelineScreen() {
  const { plans, squads, activeSquadId, removePlan, addPendingOperation, removePendingOperation, setEditingPlan, setModalVisible } = useStore();
  const { isSyncing, lastSyncedAt, syncNow } = useSyncContext();

  const activeSquad = squads.find(s => s.id === activeSquadId);

  // Delete handler for artist plans
  const handleDeleteSet = async (setId: string) => {
    const plan = plans.find(p => p.set_id === setId);
    if (!plan) return;

    const opId = `delete-${Date.now()}`;

    // Optimistic UI update - remove immediately
    removePlan(plan.id);

    // Queue operation for retry
    addPendingOperation({
      id: opId,
      type: 'delete',
      planId: plan.id,
      planData: plan,
      timestamp: Date.now(),
      retryCount: 0,
    });

    try {
      await supabase.from('plans').delete().eq('id', plan.id);
      removePendingOperation(opId); // Success!
    } catch (error) {
      // Will retry in background sync
      console.error('Delete queued for retry:', error);
    }
  };

  // Delete handler for meetup plans
  const handleDeleteMeetup = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const opId = `delete-${Date.now()}`;

    // Optimistic UI update - remove immediately
    removePlan(planId);

    // Queue operation for retry
    addPendingOperation({
      id: opId,
      type: 'delete',
      planId: plan.id,
      planData: plan,
      timestamp: Date.now(),
      retryCount: 0,
    });

    try {
      await supabase.from('plans').delete().eq('id', planId);
      removePendingOperation(opId); // Success!
    } catch (error) {
      // Will retry in background sync
      console.error('Delete queued for retry:', error);
    }
  };

  // Long-press handler for meetup cards
  const handleMeetupLongPress = (meetup: Plan) => {
    Alert.alert(
      'Manage Meetup',
      `${meetup.meet_location}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => {
            setEditingPlan(meetup);
            setModalVisible(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteMeetup(meetup.id),
        },
      ]
    );
  };

  // Create a Set of planned set IDs for quick lookup
  const plannedSetIds = useMemo(() => {
    return new Set(
      plans
        .filter(plan => plan.type === 'set' && plan.set_id)
        .map(plan => plan.set_id!)
    );
  }, [plans]);

  // Get meetup plans with explicit type guard
  const meetupPlans = useMemo(() => {
    return plans.filter((plan): plan is Plan => plan.type === 'meetup');
  }, [plans]);

  // Group meetups by time for efficient lookup
  const meetupsByTime = useMemo(() => {
    return meetupPlans.reduce((acc, plan) => {
      if (!plan.meet_time) return acc;
      if (!acc[plan.meet_time]) {
        acc[plan.meet_time] = [];
      }
      acc[plan.meet_time].push(plan);
      return acc;
    }, {} as Record<string, typeof meetupPlans>);
  }, [meetupPlans]);

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

  // Helper to format last synced time
  const getLastSyncedText = () => {
    if (!lastSyncedAt) return '';

    const now = new Date();
    const diffMs = now.getTime() - lastSyncedAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isSyncing}
          onRefresh={syncNow}
          tintColor={colors.textSecondary}
          colors={[colors.accentBlue]}
        />
      }
    >
      {/* Active Squad Indicator with Last Synced */}
      {activeSquad && (
        <View style={styles.squadIndicator}>
          <View style={styles.squadInfo}>
            <Text style={styles.squadLabel}>Squad:</Text>
            <Text style={styles.squadName}>{activeSquad.name}</Text>
          </View>
          {lastSyncedAt && (
            <Text style={styles.lastSynced}>{getLastSyncedText()}</Text>
          )}
        </View>
      )}

      {plans.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No plans yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap + to add artists or meetups</Text>
        </View>
      )}

      {Object.entries(setsByTime).map(([time, sets]) => {
        // Get meetups for this time slot (pre-grouped for performance)
        const meetupsAtThisTime = meetupsByTime[time] || [];

        const setsByStage = stages.map(stage => ({
          stage,
          sets: sets
            .filter(set => set.stage === stage)
            .map(s => ({
              artist: s.artist,
              variant: plannedSetIds.has(s.id) ? ('planned' as const) : undefined,
              setId: s.id,
            })),
        }));

        return (
          <View key={time}>
            <TimeBlock time={time} meta="">
              {setsByStage.map(stageData => (
                <StageLane
                  key={stageData.stage}
                  stage={stageData.stage}
                  sets={stageData.sets}
                  onDeleteSet={handleDeleteSet}
                />
              ))}
            </TimeBlock>

            {/* Display meetup plans */}
            {meetupsAtThisTime.map(meetup => (
              <TouchableOpacity
                key={meetup.id}
                onLongPress={() => handleMeetupLongPress(meetup)}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                <View style={styles.meetupCard}>
                  <Text style={styles.meetupIcon}>📍</Text>
                  <View style={styles.meetupInfo}>
                    <Text style={styles.meetupLocation}>{meetup.meet_location}</Text>
                    {meetup.note && <Text style={styles.meetupNote}>{meetup.note}</Text>}
                  </View>
                </View>
              </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 16,
  },
  squadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  lastSynced: {
    color: colors.textSecondary,
    fontSize: 12,
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