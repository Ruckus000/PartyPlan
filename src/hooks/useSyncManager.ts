import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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

  const { activeSquadId, setPlans } = useStore();

  // Battery check for low power mode detection using expo-battery
  const checkBatteryLevel = async () => {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      setIsLowPowerMode(batteryLevel < LOW_BATTERY_THRESHOLD);
    } catch (error) {
      // If battery check fails (e.g., unsupported device), assume normal mode
      console.warn('Battery check failed, assuming normal mode:', error);
      setIsLowPowerMode(false);
    }
  };

  // Sync plans from Supabase
  const syncPlans = async (showLoading = true) => {
    if (!activeSquadId) return;

    if (showLoading) setIsSyncing(true);

    try {
      const { data: plansData, error } = await supabase
        .from('plans')
        .select('*')
        .eq('squad_id', activeSquadId);

      if (error) throw error;

      if (plansData) {
        setPlans(plansData);
        setLastSyncedAt(new Date());
      }
    } catch (error) {
      console.error('Sync error:', error);
      // Fail silently - don't disrupt user experience
    } finally {
      if (showLoading) setIsSyncing(false);
    }
  };

  // Manual sync (for pull-to-refresh)
  const syncNow = async () => {
    await syncPlans(true);
  };

  // Start periodic sync
  const startSyncInterval = () => {
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
  };

  // Stop periodic sync
  const stopSyncInterval = () => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

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
  }, [isLowPowerMode, activeSquadId]);

  // Initial sync on mount and when active squad changes
  useEffect(() => {
    if (activeSquadId) {
      syncPlans(false);
      startSyncInterval();
    }

    return () => {
      stopSyncInterval();
    };
  }, [activeSquadId, isLowPowerMode]);

  // Check battery level periodically
  useEffect(() => {
    checkBatteryLevel();

    // Re-check battery every 10 minutes
    const batteryCheckInterval = setInterval(checkBatteryLevel, 10 * 60 * 1000);

    return () => {
      clearInterval(batteryCheckInterval);
    };
  }, []);

  return {
    isSyncing,
    lastSyncedAt,
    isLowPowerMode,
    syncNow,
  };
}
