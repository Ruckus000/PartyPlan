# Fix RLS Policies for Individual Plans

## Diagnostic Results

✅ **Data exists:**
- 10 test users created
- 10 profiles created  
- 347 individual plans created (squad_id: null)
- Plans are queryable with admin key

❌ **Issue:** RLS policies are blocking regular users from reading their individual plans

## Root Cause

The current RLS policy `"plans squad read"` only allows reading plans where:
- `squad_id` is NOT null
- User is a member of that squad

It does NOT allow reading individual plans where `squad_id IS NULL`.

## Solution

Run the SQL in `supabase-rpc-update-plans-rls.sql` in your Supabase SQL Editor.

### Steps:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-rpc-update-plans-rls.sql`
4. Click "Run"

This will:
- Drop the old restrictive policies
- Create new policies that allow:
  - Reading personal plans: `squad_id IS NULL AND created_by = auth.uid()`
  - Reading squad plans: User is a member of the squad

## After Running SQL

1. Log in to the app as a test user (e.g., `test-user-1@example.com` / `TestPassword1!`)
2. You should now see their individual plans displayed
3. Each user should see 30-40 plans (at least 5 per day)

## Test Users

- test-user-1@example.com / TestPassword1!
- test-user-2@example.com / TestPassword2!
- ... (up to test-user-10@example.com)

Each user has their own emoji and unique set selections.


