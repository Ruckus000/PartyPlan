import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { seedSets } from '../data/seedLineup';
import TimeBlock from '../components/TimeBlock';
import StageLane from '../components/StageLane';
import TimelineGantt from '../components/gantt/TimelineGantt';
import SetDetailModal from '../components/SetDetailModal';
import { useStore } from '../lib/store';
import { useSyncContext } from '../contexts/SyncContext';
import { supabase } from '../lib/supabase';
import { Plan } from '../types';
import { colors } from '../constants/colors';
import { formatTimeRange } from '../utils/timeCalculations';

const stages = ['Kinetic Field', 'Circuit Grounds', 'Neon Garden', 'Quantum Valley'];

// Stages for Gantt view
const ganttStages = [
  { id: 'Kinetic Field', name: 'kineticFIELD', host: 'Main Stage' },
  { id: 'Circuit Grounds', name: 'circuitGROUNDS', host: 'Bassrush' },
  { id: 'Neon Garden', name: 'neonGARDEN', host: 'Factory 93' },
  { id: 'Quantum Valley', name: 'stereoBLOOM', host: 'Insomniac' },
];

export default function TimelineScreen() {
  const { plans, squads, activeSquadId, removePlan, addPendingOperation, removePendingOperation, setEditingPlan, setModalVisible, isOffline, addPlan } = useStore();
  const { isSyncing, lastSyncedAt, syncNow } = useSyncContext();
  const [useGanttView, setUseGanttView] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const activeSquad = squads.find(s => s.id === activeSquadId);

  // Centralized delete handler for all plan types
  const handleDeletePlan = async (planId: string) => {
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

  // Wrapper for artist plans (finds plan by set_id)
  const handleDeleteSet = async (setId: string) => {
    const plan = plans.find(p => p.set_id === setId);
    if (!plan) return;
    await handleDeletePlan(plan.id);
  };

  // Wrapper for meetup plans (already has plan id)
  const handleDeleteMeetup = async (planId: string) => {
    await handleDeletePlan(planId);
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
    }, {} as Record<string, Plan[]>);
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

  // Check if data is stale (>2 hours old)
  const isDataStale = (): boolean => {
    if (!lastSyncedAt) return false;

    const hoursSinceSync = (Date.now() - lastSyncedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 2;
  };

  // Prepare sets for Gantt view
  const ganttSets = useMemo(() => {
    return seedSets.map(set => ({
      id: set.id,
      artist: set.artist,
      start: set.start,
      end: set.end,
      stage: set.stage,
    }));
  }, []);

  // Prepare meetups for Gantt view
  const ganttMeetups = useMemo(() => {
    return meetupPlans.map(plan => ({
      id: plan.id,
      time: plan.meet_time!,
      location: plan.meet_location!,
      note: plan.note || undefined,
    }));
  }, [meetupPlans]);

  // Handle set press in Gantt view - open modal
  const handleGanttSetPress = (setId: string) => {
    setSelectedSetId(setId);
  };

  // Handle set long press in Gantt view (for delete)
  const handleGanttSetLongPress = (setId: string) => {
    const plan = plans.find(p => p.set_id === setId);
    if (plan) {
      Alert.alert(
        'Remove from Schedule',
        `Remove ${seedSets.find(s => s.id === setId)?.artist}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => handleDeletePlan(plan.id),
          },
        ]
      );
    }
  };

  // Prepare set detail for modal
  const selectedSetDetail = useMemo(() => {
    if (!selectedSetId) return null;
    const set = seedSets.find(s => s.id === selectedSetId);
    if (!set) return null;

    return {
      artist: set.artist,
      stage: set.stage,
      timeRange: formatTimeRange(set.start, set.end),
      setId: set.id,
      isPlanned: plannedSetIds.has(set.id),
    };
  }, [selectedSetId, plannedSetIds]);

  // Handle adding set to schedule from modal
  const handleAddSetToSchedule = async (setId: string) => {
    const set = seedSets.find(s => s.id === setId);
    if (!set || !activeSquad) return;

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      squad_id: activeSquad.id,
      created_by: activeSquad.created_by,
      type: 'set',
      set_id: setId,
      meet_time: null,
      meet_location: null,
      note: null,
      created_at: new Date().toISOString(),
    };

    addPlan(newPlan);
    addPendingOperation({
      id: `add-${Date.now()}`,
      type: 'add',
      planId: newPlan.id,
      planData: newPlan,
      timestamp: Date.now(),
      retryCount: 0,
    });

    try {
      await supabase.from('plans').insert(newPlan);
      removePendingOperation(`add-${Date.now()}`);
    } catch (error) {
      console.error('Add queued for retry:', error);
    }
  };

  // Handle removing set from schedule from modal
  const handleRemoveSetFromSchedule = async (setId: string) => {
    const plan = plans.find(p => p.set_id === setId);
    if (plan) {
      await handleDeletePlan(plan.id);
    }
  };

  // Render Gantt view
  if (useGanttView) {
    return (
      <View style={styles.container}>
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setUseGanttView(false)}
          >
            <Text style={styles.toggleText}>Switch to Classic View</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              📵 Offline - Changes will sync when connected
            </Text>
          </View>
        )}

        {/* Gantt Chart */}
        <TimelineGantt
          stages={ganttStages}
          sets={ganttSets}
          meetups={ganttMeetups}
          plannedSetIds={plannedSetIds}
          onSetPress={handleGanttSetPress}
          onSetLongPress={handleGanttSetLongPress}
          onMeetupPress={(meetupId) => {
            const meetup = plans.find(p => p.id === meetupId);
            if (meetup) {
              console.log('Pressed meetup:', meetup.meet_location);
              // TODO: Open meetup detail modal
            }
          }}
          onMeetupLongPress={(meetupId) => handleMeetupLongPress(plans.find(p => p.id === meetupId)!)}
        />

        {/* Set Detail Modal */}
        <SetDetailModal
          visible={selectedSetId !== null}
          setDetail={selectedSetDetail}
          onClose={() => setSelectedSetId(null)}
          onAddToSchedule={handleAddSetToSchedule}
          onRemoveFromSchedule={handleRemoveSetFromSchedule}
        />
      </View>
    );
  }

  // Original horizontal scrolling view
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
      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setUseGanttView(true)}
        >
          <Text style={styles.toggleText}>Switch to Gantt View</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            📵 Offline - Changes will sync when connected
          </Text>
        </View>
      )}

      {/* Staleness Warning */}
      {!isOffline && isDataStale() && (
        <View style={styles.staleWarning}>
          <Text style={styles.staleWarningText}>
            ⚠️ Data may be outdated. Pull to refresh.
          </Text>
        </View>
      )}

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
                  <View style={styles.meetupInfo}>
                    <Text style={styles.meetupIcon}>📍</Text>
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
  },
  viewToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleButton: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
  },
  toggleText: {
    color: colors.accentBlue,
    fontSize: 13,
    fontWeight: '500',
  },
  offlineBanner: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  staleWarning: {
    backgroundColor: '#854d0e',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  staleWarningText: {
    color: '#fef3c7',
    fontSize: 14,
    fontWeight: '600',
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
    marginHorizontal: 16,
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
    paddingHorizontal: 16,
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: 16,
    marginTop: 8,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  meetupIcon: {
    fontSize: 18,
    marginBottom: 8,
  },
  meetupInfo: {
    alignItems: 'center',
  },
  meetupLocation: {
    color: colors.accentBlue,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  meetupNote: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});