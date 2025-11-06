import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import * as Battery from 'expo-battery';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

const SYNC_INTERVAL_NORMAL = 30 * 60 * 1000; // 30 minutes
const SYNC_INTERVAL_LOW_POWER = 60 * 60 * 1000; // 60 minutes
const LOW_BATTERY_THRESHOLD = 0.20; // 20%

export function useSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const { activeSquadId, setPlans, pendingOperations, removePendingOperation, updatePendingOperation, addPlan, getPendingDeleteIds } = useStore();

  // Battery check for low power mode detection using expo-battery
  const checkBatteryLevel = useCallback(async () => {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      setIsLowPowerMode(batteryLevel < LOW_BATTERY_THRESHOLD);
    } catch (error) {
      // If battery check fails (e.g., unsupported device), assume normal mode
      console.warn('Battery check failed, assuming normal mode:', error);
      setIsLowPowerMode(false);
    }
  }, []);

  // Process pending operations with retry and exponential backoff
  const processPendingOperations = useCallback(async () => {
    const ops = pendingOperations;

    for (const op of ops) {
      try {
        if (op.type === 'delete') {
          await supabase.from('plans').delete().eq('id', op.planId);
          removePendingOperation(op.id);
        }
        // TODO: Handle 'add' and 'update' types when optimistic add/edit is implemented
      } catch (error) {
        // Exponential backoff: give up after 5 retries
        if (op.retryCount >= 5) {
          // Give up, restore the plan
          if (op.planData) {
            addPlan(op.planData as any);
          }
          removePendingOperation(op.id);
          Alert.alert('Sync Failed', 'Some changes could not be saved');
        } else {
          // Increment retry count for next attempt
          updatePendingOperation(op.id, {
            retryCount: op.retryCount + 1
          });
        }
      }
    }
  }, [pendingOperations, removePendingOperation, updatePendingOperation, addPlan]);

  // Sync plans from Supabase
  const syncPlans = useCallback(async (showLoading = true) => {
    if (!activeSquadId) return;

    if (showLoading) setIsSyncing(true);

    try {
      // Process pending operations first
      await processPendingOperations();

      // Fetch from server
      const { data: plansData, error } = await supabase
        .from('plans')
        .select('*')
        .eq('squad_id', activeSquadId);

      if (error) throw error;

      if (plansData) {
        // Filter out plans that are pending deletion
        const pendingDeleteIds = getPendingDeleteIds();
        const filteredPlans = plansData.filter(p => !pendingDeleteIds.has(p.id));

        setPlans(filteredPlans);
        setLastSyncedAt(new Date());
      }
    } catch (error) {
      console.error('Sync error:', error);
      // Fail silently - don't disrupt user experience
    } finally {
      if (showLoading) setIsSyncing(false);
    }
  }, [activeSquadId, processPendingOperations, getPendingDeleteIds, setPlans]);

  // Manual sync (for pull-to-refresh)
  const syncNow = useCallback(async () => {
    await syncPlans(true);
  }, [syncPlans]);

  // Start periodic sync
  const startSyncInterval = useCallback(() => {
    // Clear any existing timer
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
    }

    // Determine interval based on power mode
    const interval = isLowPowerMode ? SYNC_INTERVAL_LOW_POWER : SYNC_INTERVAL_NORMAL;

    // Set up periodic sync
    syncTimerRef.current = setInterval(() => {
      syncPlans(false); // Don't show loading for background syncs
    }, interval);
  }, [isLowPowerMode, syncPlans]);

  // Stop periodic sync
  const stopSyncInterval = useCallback(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasBackground = appStateRef.current === 'background';
      const isActive = nextAppState === 'active';

      if (wasBackground && isActive) {
        // App came to foreground - sync immediately and restart interval
        syncPlans(false);
        startSyncInterval();
      } else if (nextAppState === 'background') {
        // App went to background - stop syncing to save battery
        stopSyncInterval();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      stopSyncInterval();
    };
  }, [syncPlans, startSyncInterval, stopSyncInterval]);

  // Initial sync on mount and when active squad changes
  useEffect(() => {
    if (activeSquadId) {
      syncPlans(false);
      startSyncInterval();
    }

    return () => {
      stopSyncInterval();
    };
  }, [activeSquadId, syncPlans, startSyncInterval, stopSyncInterval]);

  // Restart interval when power mode changes (without syncing)
  useEffect(() => {
    if (activeSquadId) {
      startSyncInterval();
    }

    return () => {
      stopSyncInterval();
    };
  }, [isLowPowerMode, activeSquadId, startSyncInterval, stopSyncInterval]);

  // Check battery level periodically
  useEffect(() => {
    checkBatteryLevel();

    // Re-check battery every 10 minutes
    const batteryCheckInterval = setInterval(checkBatteryLevel, 10 * 60 * 1000);

    return () => {
      clearInterval(batteryCheckInterval);
    };
  }, [checkBatteryLevel]);

  return {
    isSyncing,
    lastSyncedAt,
    isLowPowerMode,
    syncNow,
  };
}
