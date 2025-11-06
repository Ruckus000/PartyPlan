# Plan Management Architecture Review

**Review Date:** 2025-11-06 (Revised)
**Reviewer Role:** System Architect
**Focus:** Lightweight, efficient, battery-conscious design without compromising UX/UI

---

## Executive Summary

The current plan management architecture demonstrates **good fundamentals** with Zustand state management, battery-aware sync, and optimistic UI updates. This review identifies **8 architectural issues** (4 critical, 4 polish) that impact reliability and user experience in festival environments.

**Overall Assessment:** 8.5/10 - Solid foundation, needs production hardening for offline scenarios.

**Key Focus:** Festival environment = spotty connectivity, battery conservation, real-time collaboration

---

## Critical Issues & Recommendations

### P0 - State Inconsistency

**Issue 1: Inconsistent Store Update Patterns**

**Location:** `src/components/AddModal.tsx:126`

**Problem:**
```typescript
// Pattern 1: Using store hook
addPlan(plan);

// Pattern 2: Direct store access
useStore.getState().setPlans(updatedPlans);

// Pattern 3: Manual map update
const updatedPlans = plans.map(p => p.id === plan.id ? plan : p);
```

**Impact:**
- Code is harder to maintain
- Pattern 3 is O(n) operation for every update
- Missing a proper `updatePlan` action

**Solution:**
```typescript
// Add to store.ts
type Store = {
  // ... existing
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
}

updatePlan: (planId, updates) => set((state) => ({
  plans: state.plans.map(p => p.id === planId ? { ...p, ...updates } : p)
})),

// In AddModal.tsx - consistent pattern
updatePlan(plan.id, plan);
```

**Effort:** 1 hour
**Priority:** P0 - Foundation for other fixes

---

### P0 - Data Loss Risk

**Issue 2: No Rollback on Failed Operations with Race Conditions**

**Location:** `src/screens/TimelineScreen.tsx:28-43`, `46-57`

**Problem:**
```typescript
removePlan(plan.id);  // Optimistic - immediately removes from UI

try {
  await supabase.from('plans').delete().eq('id', plan.id);
} catch (error) {
  console.error('Failed to delete plan:', error);
  // ⚠️ NO ROLLBACK + Race condition with sync
}
```

**Critical Issues:**
1. Network failure → no rollback → plan reappears on next sync
2. Race condition: sync can restore deleted plan before delete completes
3. No persistence across app restarts (offline delete lost)

**Solution - Operation Queue with Retry:**

```typescript
// Add to types.ts
export type PendingOperation = {
  id: string;
  type: 'delete' | 'add' | 'update';
  planId: string;
  planData?: Partial<Plan>;
  timestamp: number;
  retryCount: number;
};

// Add to store.ts
type Store = {
  // ... existing
  pendingOperations: PendingOperation[];
  addPendingOperation: (op: PendingOperation) => void;
  removePendingOperation: (id: string) => void;
  getPendingDeleteIds: () => Set<string>;
};

pendingOperations: [],
addPendingOperation: (op) => set((state) => ({
  pendingOperations: [...state.pendingOperations, op]
})),
removePendingOperation: (id) => set((state) => ({
  pendingOperations: state.pendingOperations.filter(o => o.id !== id)
})),
getPendingDeleteIds: () => {
  const state = useStore.getState();
  return new Set(
    state.pendingOperations
      .filter(op => op.type === 'delete')
      .map(op => op.planId)
  );
},

// In TimelineScreen.tsx
const handleDeleteSet = async (setId: string) => {
  const plan = plans.find(p => p.set_id === setId);
  if (!plan) return;

  const opId = `delete-${Date.now()}`;

  // Optimistically update UI
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
    removePendingOperation(opId);
  } catch (error) {
    // Will retry in background sync
    console.error('Delete queued for retry:', error);
  }
};

// In useSyncManager.ts - process queue before syncing
const processPendingOperations = async () => {
  const ops = useStore.getState().pendingOperations;

  for (const op of ops) {
    try {
      if (op.type === 'delete') {
        await supabase.from('plans').delete().eq('id', op.planId);
        useStore.getState().removePendingOperation(op.id);
      }
      // ... handle add/update
    } catch (error) {
      // Exponential backoff
      if (op.retryCount > 5) {
        // Give up, restore plan
        if (op.planData) {
          useStore.getState().addPlan(op.planData as Plan);
        }
        useStore.getState().removePendingOperation(op.id);
        Alert.alert('Sync Failed', 'Some changes could not be saved');
      } else {
        // Increment retry count
        useStore.getState().updatePendingOperation(op.id, {
          retryCount: op.retryCount + 1
        });
      }
    }
  }
};

const syncPlans = async (showLoading = true) => {
  // Process pending operations first
  await processPendingOperations();

  // Then fetch from server
  const { data: plansData } = await supabase
    .from('plans')
    .select('*')
    .eq('squad_id', activeSquadId);

  // Filter out pending deletes
  const pendingDeleteIds = useStore.getState().getPendingDeleteIds();
  const filteredPlans = plansData.filter(p => !pendingDeleteIds.has(p.id));

  setPlans(filteredPlans);
};

// Persist queue to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  AsyncStorage.setItem('pendingOps', JSON.stringify(pendingOperations));
}, [pendingOperations]);
```

**Effort:** 4 hours
**Priority:** P0 - Prevents data loss in offline scenarios

---

### P1 - Offline Mode & Persistence

**Issue 3: No Offline Awareness (NEW)**

**Location:** Missing from entire app

**Problem:**
Festivals have spotty connectivity:
- Crowded areas: network congestion
- Remote stages: weak signal
- Underground venues: no signal

Current behavior:
- App assumes network available
- Operations fail silently
- No user feedback about offline state
- No local persistence (data lost on restart)

**Solution:**

```typescript
// Install dependency
npm install @react-native-community/netinfo

// In App.tsx or dedicated hook
import NetInfo from '@react-native-community/netinfo';

const [isOffline, setIsOffline] = useState(false);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOffline(!state.isConnected);
  });
  return unsubscribe;
}, []);

// Add to store
type Store = {
  // ... existing
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
};

// In TimelineScreen.tsx - offline banner
{isOffline && (
  <View style={styles.offlineBanner}>
    <Text style={styles.offlineText}>
      📵 Offline - Changes will sync when connected
    </Text>
  </View>
)}

// Persist plans to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// In store.ts
setPlans: (plans) => {
  set({ plans });
  AsyncStorage.setItem('plans', JSON.stringify(plans));
},

// On app launch (App.tsx)
useEffect(() => {
  const loadCachedData = async () => {
    const [cachedPlans, cachedPendingOps] = await Promise.all([
      AsyncStorage.getItem('plans'),
      AsyncStorage.getItem('pendingOps'),
    ]);

    if (cachedPlans) {
      useStore.getState().setPlans(JSON.parse(cachedPlans));
    }
    if (cachedPendingOps) {
      useStore.getState().setPendingOperations(JSON.parse(cachedPendingOps));
    }
  };

  loadCachedData();
}, []);
```

**Effort:** 3 hours
**Priority:** P1 - Critical for festival environment

---

### P1 - UX Consistency

**Issue 4: No Optimistic Add/Edit**

**Location:** `src/components/AddModal.tsx:50-88`, `90-150`

**Problem:**
```typescript
setLoading(true); // User sees spinner
const { data: plan } = await supabase.from('plans').insert(...); // Wait 200-2000ms
addPlan(plan); // Only then update UI
```

**Impact:**
- Slow: user waits for network (200-2000ms)
- Inconsistent: delete is instant, add/edit is slow
- Modal stays open during network call

**Solution:**
```typescript
const handleAddArtist = async (setId: string) => {
  // ... validation

  const tempPlan: Plan = {
    id: `temp-${Date.now()}`,
    squad_id: activeSquadId,
    created_by: profile.id,
    type: 'set',
    set_id: setId,
    created_at: new Date().toISOString(),
  };

  // Optimistic: instant UI update
  addPlan(tempPlan);
  onClose(); // Close modal immediately!

  try {
    const { data: plan, error } = await supabase
      .from('plans')
      .insert({ ... })
      .select()
      .single();

    if (error) throw error;

    // Replace temp with real plan
    removePlan(tempPlan.id);
    addPlan(plan);
  } catch (error) {
    // Rollback on failure
    removePlan(tempPlan.id);
    Alert.alert('Failed to add', 'Please try again');
  }
};
```

**UX Improvement:** Instant (5ms) vs 500ms average

**Effort:** 3 hours
**Priority:** P1 - Major UX improvement

---

### P2 - Memory & Performance

**Issue 5: useEffect Dependency Issues**

**Location:** `src/hooks/useSyncManager.ts:89-112`, `114-124`

**Problem:**
```typescript
useEffect(() => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // ... uses syncPlans and startSyncInterval
  };
  // ...
}, [isLowPowerMode, activeSquadId]); // Missing: syncPlans, startSyncInterval
```

**Impact:**
- Stale closures referencing old values
- Potential memory leaks
- React warnings about missing deps

**Solution:**
```typescript
// Wrap in useCallback to stabilize references
const syncPlans = useCallback(async (showLoading = true) => {
  if (!activeSquadId) return;
  // ... implementation
}, [activeSquadId, setPlans]);

const startSyncInterval = useCallback(() => {
  // ... implementation
}, [isLowPowerMode, syncPlans]);

useEffect(() => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // ... implementation
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
    stopSyncInterval();
  };
}, [isLowPowerMode, activeSquadId, syncPlans, startSyncInterval]); // ✅ Complete
```

**Effort:** 2 hours
**Priority:** P2 - Prevents bugs

---

### ~~P1 - Multi-User Conflicts (Meetups Only)~~ **[REMOVED - See Phase 2]**

**Issue 6: No Conflict Resolution for Meetup Plans** - **OBSOLETE**

> **Design Decision:** This entire issue has been removed. Meetups are now personal (like artist plans), eliminating the need for conflict resolution. See Phase 2 for detailed rationale.

**Location:** `src/components/AddModal.tsx` (edit operations)

**Problem:** *(Obsolete - based on old shared meetup design)*
- User A edits meetup: "Meet at Main Stage"
- User B edits same meetup: "Meet at Ferris Wheel"
- Last write wins - no warning

**~~Important:~~ Only meetups need this. Artist plans are personal (each user adds their own).**

**New Approach:** Make meetups personal too. Simpler, more consistent, no conflicts.

**Solution:**

```typescript
// Add to Plan type (meetups only)
export type Plan = {
  // ... existing
  version?: number;      // Only for type='meetup'
  updated_by?: string;   // Only for type='meetup'
};

// Database migration
ALTER TABLE plans ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE plans ADD COLUMN updated_by UUID REFERENCES profiles(id);

CREATE OR REPLACE FUNCTION increment_plan_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'meetup' THEN
    NEW.version = COALESCE(OLD.version, 0) + 1;
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_version_trigger
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION increment_plan_version();

// In AddModal.tsx - only for meetups
if (editingPlan && editingPlan.type === 'meetup') {
  const { data: plan, error } = await supabase
    .from('plans')
    .update({
      meet_time: meetupTime,
      meet_location: meetupLocation,
      note: meetupNote || null,
      updated_by: profile.id,
    })
    .eq('id', editingPlan.id)
    .eq('version', editingPlan.version) // ✅ Optimistic lock
    .select()
    .single();

  if (!plan) {
    // Conflict!
    Alert.alert(
      'Someone Else Edited This',
      'This meetup was changed by another squad member. Refresh to see latest.',
      [
        { text: 'Refresh', onPress: () => syncNow() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    return;
  }

  updatePlan(plan.id, plan);
}

// Artist plans: no conflict checking (they're personal)
if (editingPlan && editingPlan.type === 'set') {
  // Just update, no version check needed
}
```

**Effort:** 2 hours
**Priority:** P1 - Multi-user reliability for meetups

---

## Polish & Quality Improvements

### P2 - Request Deduplication

**Issue 7: No Double-Click Protection (NEW)**

**Problem:**
```
User rapidly clicks "Add Artist" 5 times
→ 5 duplicate plans created
→ Confusing UX
```

**Solution:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleAddArtist = async (setId: string) => {
  if (isSubmitting) return; // Guard

  setIsSubmitting(true);
  try {
    // ... add logic
  } finally {
    setIsSubmitting(false);
  }
};

// Disable button
<TouchableOpacity
  disabled={isSubmitting || loading}
  style={[styles.button, (isSubmitting || loading) && styles.buttonDisabled]}
>
```

**Effort:** 30 minutes
**Priority:** P2 - Quality of life

---

### P2 - Data Staleness Awareness

**Issue 8: No Staleness Warning (NEW)**

**Problem:** User opens app after 3 hours - no indication data may be stale

**Solution:**
```typescript
// In TimelineScreen.tsx
const getDataFreshnessIndicator = () => {
  if (!lastSyncedAt) return null;

  const hoursSinceSync = (Date.now() - lastSyncedAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceSync > 2) {
    return (
      <View style={styles.staleWarning}>
        <Text style={styles.staleWarningText}>
          ⚠️ Data may be outdated. Pull to refresh.
        </Text>
      </View>
    );
  }
  return null;
};

// Render above timeline
{getDataFreshnessIndicator()}
```

**Effort:** 1 hour
**Priority:** P2 - User trust

---

### P2 - Error Boundaries

**Issue 9: No Error Recovery (NEW)**

**Problem:** Uncaught error in plan management → entire app crashes

**Solution:**
```typescript
// ErrorBoundary.tsx
class PlanErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Plan management error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            Plan management encountered an error
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// In App.tsx
<PlanErrorBoundary>
  <AddModal ... />
  <TimelineScreen ... />
</PlanErrorBoundary>
```

**Effort:** 1 hour
**Priority:** P2 - Production safety

---

### P3 - Minor Optimizations

**Issue 10: Sync on Power Mode Change**

**Location:** `src/hooks/useSyncManager.ts:115-124`

**Problem:**
```typescript
useEffect(() => {
  syncPlans(false);    // Syncs on mount
  startSyncInterval();
}, [activeSquadId, isLowPowerMode]); // Syncs when power mode changes (unnecessary)
```

**Solution:**
```typescript
// Separate effects
useEffect(() => {
  if (activeSquadId) {
    syncPlans(false);
    startSyncInterval();
  }
  return () => stopSyncInterval();
}, [activeSquadId]); // Only sync on squad change

useEffect(() => {
  // Just restart interval, don't sync
  if (activeSquadId) {
    startSyncInterval();
  }
  return () => stopSyncInterval();
}, [isLowPowerMode]);
```

**Effort:** 30 minutes
**Priority:** P3 - Minor optimization

---

## NOT RECOMMENDED

### ❌ Incremental Sync - OVER-ENGINEERED

**Why Rejected:**

Festival app reality:
- Typical squad: 30-50 artist plans + 5-10 meetups = **~60 plans**
- 60 plans × 150 bytes = **9KB per sync**
- Festival weekend: 3 days × 48 syncs = **1.3MB total**

This is **negligible** compared to:
- App bundle (~5-10MB)
- Festival website images
- Music streaming (100MB+/day)

**Critical Bug:** Incremental sync with `WHERE updated_at > lastSync` doesn't return deleted records. Other squad members never see deletions. Requires complex soft-delete mechanism.

**Better Alternative:**
```typescript
// Simple time-based skip
const timeSinceSync = Date.now() - lastSyncedAt.getTime();
if (timeSinceSync < 15 * 60 * 1000) {
  return; // Skip sync if <15 min (data is fresh)
}
```

**Decision:** Skip incremental sync unless squads regularly exceed 200 plans.

---

## Performance Metrics

### Current Performance
| Operation | Time | Network | Renders |
|-----------|------|---------|---------|
| Delete Plan | ~5ms | 1 request | 1 |
| Add Plan | ~500ms (waits) | 1 request | 2 |
| Edit Plan | ~500ms (waits) | 1 request | 2 |
| Periodic Sync | ~800ms | 1 request (9KB) | 1 |

### After Optimizations
| Operation | Time | Network | Renders |
|-----------|------|---------|---------|
| Delete Plan | ~5ms | 1 request (queued) | 1 |
| Add Plan | ~5ms | 1 request (queued) | 1 |
| Edit Plan | ~5ms | 1 request (queued) | 1 |
| Periodic Sync | ~800ms | 1 request (9KB) | 0-1 |

**Improvement:** 100x faster perceived performance (5ms vs 500ms)

---

## Recommended Implementation Order

### Phase 1: Production Hardening (13 hours)
1. **P0 - Add updatePlan action** (1h) - Foundation
2. **P0 - Operation queue with retry** (4h) - Prevents data loss
3. **P1 - Offline mode & persistence** (3h) - Festival environment
4. **P1 - Optimistic add/edit** (3h) - Better UX
5. **P2 - Fix useEffect deps** (2h) - Prevents bugs

**Total:** 13 hours

### Phase 2: Polish & Quality of Life (3 hours)
6. ~~**P1 - Conflict resolution (meetups)** (2h)~~ - **REMOVED** (see decision below)
7. **P2 - Request deduplication** (30min) - Quality of life
8. **P2 - Staleness warnings** (1h) - User trust
9. **P2 - Error boundaries** (1h) - Production safety
10. **P3 - Optimize sync triggers** (30min) - Minor gains

**Total:** 3 hours

#### Decision: Meetups Should Be Personal (Not Shared)

**Removed Issue 6 (Conflict Resolution)** based on design simplification:

**Old Design:** Shared meetups that any squad member can edit → requires conflict resolution
**New Design:** Personal meetups (like artist plans) → no conflicts possible

**Rationale:**
- ✅ **Consistent Pattern** - Artist plans and meetups work the same way
- ✅ **Simpler Code** - No version tracking, triggers, or conflict alerts needed
- ✅ **No Complexity** - Removes entire 2-hour task
- ✅ **Still Coordinated** - Squad members see each other's meetups and can spot mismatches
- ✅ **Lightweight** - Aligns with core design principle

**Example:**
```
9:00 PM - Meetup
  📍 You: Main Stage
  📍 Sarah: Main Stage
  📍 Mike: Main Stage
  ✅ Coordinated!
```

If plans don't match, users communicate and each updates their own. The visibility is what matters for coordination, not shared editing.

### Phase 3: Scale (If Needed)
- **P3 - Incremental sync** - Only if >200 plans/squad (skip for now)
- **P3 - Pagination** - Only if >500 plans (skip for now)

---

## Conclusion

The current architecture is **functionally sound but needs production hardening for offline scenarios**. The use of Zustand, battery-aware sync, and optimistic deletes demonstrates good judgment.

**Critical Additions:**
- **Operation queue** - Handles offline operations and retries
- **Offline mode** - Festival environments demand this
- **Optimistic add/edit** - Instant UX for all operations

**Removed:**
- **Incremental sync** - Over-engineered for ~60 plans (9KB)
- **Conflict resolution** - Meetups should be personal (like artist plans), removing need for conflict handling

**Design Decision:**
- **Personal meetups** - Each user creates their own meetups, squad visibility provides coordination. Simpler and more consistent than shared meetups.

**Recommended Action:** Implement Phase 1 (13 hours) before production. Phase 2 (3 hours) can be done post-launch based on user feedback.

### Final Score: 8.5/10
- **Correctness:** 9/10 (with operation queue)
- **Efficiency:** 8/10 (appropriate for scale)
- **Maintainability:** 9/10 (clean patterns)
- **UX:** 9/10 (optimistic, offline-aware)
- **Scalability:** 8/10 (good to 200 plans)

**Overall:** Production-ready architecture focused on festival environment needs.
