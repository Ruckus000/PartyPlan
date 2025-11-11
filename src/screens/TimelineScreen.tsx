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

// Stages for Gantt view - EDC Orlando 2025
const ganttStages = [
  { id: 'kineticFIELD', name: 'kineticFIELD', host: 'Main Stage' },
  { id: 'circuitGROUNDS', name: 'circuitGROUNDS', host: 'Bassrush' },
  { id: 'neonGarden', name: 'neonGarden', host: 'Factory 93' },
  { id: 'stereoBLOOM', name: 'stereoBLOOM', host: 'Insomniac' },
  { id: 'casaBACARDÍ', name: 'casaBACARDÍ', host: 'Bacardí' },
];

export default function TimelineScreen() {
  const { plans, squads, activeSquadId, removePlan, addPendingOperation, removePendingOperation, setEditingPlan, setModalVisible, isOffline, addPlan, profile } = useStore();
  const { isSyncing, lastSyncedAt, syncNow } = useSyncContext();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const activeSquad = squads.find(s => s.id === activeSquadId);

  // Check if a set has already passed (end time is in the past)
  const isSetPassed = (setId: string): boolean => {
    const set = seedSets.find(s => s.id === setId);
    if (!set) return false;
    const endTime = new Date(set.end);
    return endTime < new Date();
  };

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
  // Only include plans created by the current user
  const plannedSetIds = useMemo(() => {
    if (!profile) return new Set(); // Empty when not logged in
    
    return new Set(
      plans
        .filter(plan => 
          plan.type === 'set' && 
          plan.set_id && 
          plan.created_by === profile.id // Only current user's plans
        )
        .map(plan => plan.set_id!)
    );
  }, [plans, profile]);

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

  // Map set_id to array of attendee emojis for Gantt chart
  const attendeesBySetId = useMemo(() => {
    const map = new Map<string, string[]>();
    plans.forEach(plan => {
      if (plan.set_id && plan.profile?.emoji) {
        const emojis = map.get(plan.set_id) || [];
        // Only add unique emojis (in case same user has multiple plans for same set)
        if (!emojis.includes(plan.profile.emoji)) {
          emojis.push(plan.profile.emoji);
        }
        map.set(plan.set_id, emojis);
      }
    });
    return map;
  }, [plans]);

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
    // DISABLED: Don't allow changes to sets that have already passed (disabled for testing)
    // if (isSetPassed(setId)) {
    //   Alert.alert(
    //     'Cannot Modify',
    //     'This set has already ended. You cannot modify past events.',
    //     [{ text: 'OK' }]
    //   );
    //   return;
    // }

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

  // Format day from ISO timestamp
  const formatDay = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const dayNum = date.getDate();

    return `${dayName}, ${monthName} ${dayNum}`;
  };

  // Prepare set detail for modal
  const selectedSetDetail = useMemo(() => {
    if (!selectedSetId) return null;
    const set = seedSets.find(s => s.id === selectedSetId);
    if (!set) return null;

    // Get all attendees for this set (all users who have this set planned)
    const setPlans = plans.filter(p => p.set_id === selectedSetId && p.profile);
    const attendees = setPlans
      .map(plan => ({
        emoji: plan.profile!.emoji,
        display_name: plan.profile!.display_name,
      }))
      // Remove duplicates (in case same user has multiple plans)
      .filter((attendee, index, self) =>
        index === self.findIndex(a => a.display_name === attendee.display_name)
      );

    return {
      artist: set.artist,
      stage: set.stage,
      timeRange: formatTimeRange(set.start, set.end),
      day: formatDay(set.start),
      setId: set.id,
      isPlanned: plannedSetIds.has(set.id),
      attendees,
    };
  }, [selectedSetId, plannedSetIds, plans]);

  // Handle adding set to schedule from modal
  const handleAddSetToSchedule = async (setId: string) => {
    // Require authentication
    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    // DISABLED: Don't allow adding sets that have already passed (disabled for testing)
    // if (isSetPassed(setId)) {
    //   Alert.alert(
    //     'Cannot Add',
    //     'This set has already ended. You cannot add past events to your schedule.',
    //     [{ text: 'OK' }]
    //   );
    //   return;
    // }

    const set = seedSets.find(s => s.id === setId);
    if (!set) return;

    // Use active squad if available, otherwise use null values (individual plan)
    // Always set created_by to profile.id (never null)
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      squad_id: activeSquad?.id || null,
      created_by: profile.id,
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
    // DISABLED: Don't allow removing sets that have already passed (disabled for testing)
    // if (isSetPassed(setId)) {
    //   Alert.alert(
    //     'Cannot Remove',
    //     'This set has already ended. You cannot modify past events.',
    //     [{ text: 'OK' }]
    //   );
    //   return;
    // }

    const plan = plans.find(p => p.set_id === setId);
    if (plan) {
      await handleDeletePlan(plan.id);
    }
  };

  // Render Gantt view (always enabled)
  return (
    <View style={styles.container}>
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
        attendeesBySetId={attendeesBySetId}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
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