# Reminder: Individual Plans Support

## Changes Made (for testing branch)

The app has been updated to support individual plans (plans with `squad_id: null`). Users can now see their own personal set selections even when they're not in a squad.

## Changes to Apply to Main Branch

### 1. App.tsx
- Added logic to fetch individual plans when user has no squads or when squads array is empty
- Fetches plans where `squad_id IS NULL AND created_by = auth.uid()`

### 2. useSyncManager.ts
- Updated `syncPlans` function to handle both squad plans and individual plans
- When `activeSquadId` is null, fetches individual plans for the current user
- Updated useEffect hooks to sync regardless of whether there's an active squad

### 3. TimelineScreen.tsx
- No changes needed - already displays plans from the store, which now includes individual plans

## Why This Matters

- Users should be able to see their own individual plans even without a squad
- This allows users to have personal set selections that may differ from their squad
- Sometimes people will see sets that the rest of their squad will not

## Testing

After applying these changes, test that:
1. Users without squads can see their individual plans
2. Users with squads still see squad plans when a squad is active
3. Switching between squads and individual mode works correctly
4. Plans sync correctly in both modes

