# Battery-Friendly Sync Architecture Plan

## 🎯 Goals
- Conserve battery at festivals (critical!)
- Minimize data usage
- Keep squads synchronized without real-time overhead
- Adaptive to device state (low power mode, background, etc.)

---

## 📋 Sync Strategy

### **Polling Intervals**
| Device State | Interval | Rationale |
|--------------|----------|-----------|
| **Normal Mode** | 30 minutes | Balance between freshness and battery |
| **Low Power Mode** | 60 minutes | Double interval to save battery |
| **App Backgrounded** | Paused | Zero battery drain when not in use |
| **Manual Refresh** | Immediate | User-triggered, pull-to-refresh |

### **When to Sync**
1. ✅ **App Launch** - Get latest data immediately
2. ✅ **App Resume** - Sync when returning from background
3. ✅ **Interval Timer** - Every 30/60 mins when in foreground
4. ✅ **Manual Pull** - User swipes down to refresh
5. ✅ **After Creating Plan** - Already done (optimistic UI)
6. ❌ **Real-time** - NO websockets, too power-hungry

---

## 🏗️ Architecture

### **Components**

```
useSyncManager Hook
├── Detects low power mode (iOS/Android)
├── Manages polling interval
├── Pauses when backgrounded
├── Resumes when foregrounded
└── Provides manual refresh function

TimelineScreen / SquadScreen
├── Pull-to-refresh gesture
├── Visual "last synced" indicator
└── Syncing spinner when active
```

### **Sync Process**

```typescript
function syncPlans(squadId: string) {
  1. Fetch plans from Supabase for active squad
  2. Compare with local state (by updated_at timestamps)
  3. Update Zustand store if changes detected
  4. Show subtle UI feedback
  5. Update "last synced" timestamp
}
```

---

## 🔋 Power Optimization Techniques

### 1. **Adaptive Intervals**
```typescript
const getSyncInterval = () => {
  if (isLowPowerMode) return 60 * 60 * 1000; // 60 min
  return 30 * 60 * 1000; // 30 min
};
```

### 2. **Background Pause**
```typescript
AppState.addEventListener('change', (state) => {
  if (state === 'background') {
    clearInterval(syncTimer); // Stop syncing
  } else if (state === 'active') {
    syncNow(); // Sync on resume
    startSyncInterval(); // Restart timer
  }
});
```

### 3. **Smart Diffing**
- Only update UI if data actually changed
- Use `updated_at` timestamps to detect changes
- Avoid unnecessary re-renders

### 4. **Network Awareness** (Optional)
- Skip sync if offline (saves wasted requests)
- Queue changes when offline, sync when reconnected

---

## 📱 Low Power Mode Detection

### **iOS**
```typescript
// Via expo-battery or react-native-device-info
import * as Battery from 'expo-battery';

const isLowPowerMode = await Battery.getPowerStateAsync().lowPowerMode;
```

### **Android**
```typescript
// Via react-native-device-info
import DeviceInfo from 'react-native-device-info';

const isLowPowerMode = await DeviceInfo.isPowerSaveMode();
```

### **Fallback**
```typescript
// Simple battery level check
const batteryLevel = await Battery.getBatteryLevelAsync();
const isLowPowerMode = batteryLevel < 0.20; // <20% = low power
```

---

## 🎨 UX Indicators

### **Visual Feedback**
1. **Last Synced** - "Updated 5 mins ago"
2. **Syncing Spinner** - Subtle indicator during sync
3. **Pull to Refresh** - Standard gesture for manual sync
4. **Offline Indicator** - "Offline - changes will sync later"

### **User Control**
- Settings toggle: "Sync Frequency" (30min / 60min / Manual only)
- Manual refresh button (or pull-to-refresh)
- "Sync Now" action in squad screen

---

## 🚀 Implementation Plan

### **Phase 1: Core Sync Logic** (15 min)
- Create `useSyncManager` hook
- Implement polling with intervals
- Add app state awareness

### **Phase 2: Power Awareness** (10 min)
- Add battery/low power detection
- Adjust intervals based on power state
- Test interval switching

### **Phase 3: UX Enhancements** (15 min)
- Add pull-to-refresh to TimelineScreen
- Show "last synced" timestamp
- Add syncing indicator

### **Phase 4: Polish** (10 min)
- Network status awareness
- Error handling for failed syncs
- Testing in various states

**Total Time: ~50 minutes**

---

## 🧪 Testing Scenarios

1. ✅ Normal mode sync (every 30 min)
2. ✅ Low power mode sync (every 60 min)
3. ✅ App backgrounded (sync paused)
4. ✅ App resumed (sync immediately)
5. ✅ Manual pull-to-refresh
6. ✅ Offline handling
7. ✅ Multiple squad switching
8. ✅ Battery level changes

---

## 📊 Expected Impact

### **Battery Savings**
- **Websocket (real-time)**: Persistent connection, ~5-10% battery/hour
- **Our approach**: Periodic fetch, ~0.5-1% battery/hour
- **Savings**: 80-90% less battery usage vs real-time

### **Data Usage**
- **30 min intervals**: 48 requests/day = ~2-5 MB/day (minimal)
- **60 min intervals**: 24 requests/day = ~1-2 MB/day (ultra-low)

### **User Experience**
- Still feels "live enough" for festival coordination
- Friends' plans appear within 30 mins (acceptable latency)
- Manual refresh for urgent updates
- No battery anxiety!

---

## 🎯 Future Enhancements (Optional)

1. **Intelligent Sync** - Sync more frequently during peak hours (8PM-2AM)
2. **Presence Awareness** - Show when squad members were last active
3. **Push Notifications** - Alert when friend adds a conflicting plan
4. **Offline Queue** - Queue plan changes when offline, sync when reconnected
5. **Conflict Resolution** - Handle simultaneous edits gracefully

---

## 💡 Why This Approach?

1. **Battery-First** - Festival-goers prioritize battery life
2. **Good Enough Sync** - 30 mins is fine for plan coordination
3. **Simple & Reliable** - No complex websocket/reconnection logic
4. **User Control** - Manual refresh when needed
5. **Adaptive** - Automatically adjusts to device state

This is **perfect for a festival app** where battery conservation matters more than instant updates! 🎉
