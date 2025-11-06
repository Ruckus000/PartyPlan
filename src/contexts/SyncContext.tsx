import React, { createContext, useContext } from 'react';

type SyncContextType = {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  isLowPowerMode: boolean;
  syncNow: () => Promise<void>;
};

const SyncContext = createContext<SyncContextType | null>(null);

export const SyncProvider = SyncContext.Provider;

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    // Return a no-op context if not within provider (e.g., during auth)
    return {
      isSyncing: false,
      lastSyncedAt: null,
      isLowPowerMode: false,
      syncNow: async () => {},
    };
  }
  return context;
}
