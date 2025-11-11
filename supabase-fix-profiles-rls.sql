-- Fix RLS Policy on Profiles Table
-- This allows reading profiles of users who have created plans
-- This enables showing attendees even when not logged in

-- Drop existing policy if it exists (for re-running this script)
DROP POLICY IF EXISTS "profiles readable for plan creators" ON profiles;

-- Create new policy that allows reading profiles of users who have created plans
-- This policy works alongside the existing "auth read own profile" policy
-- Users can read their own profile OR profiles of users who have created plans
CREATE POLICY "profiles readable for plan creators" ON profiles
FOR SELECT USING (
  -- Allow reading own profile (existing behavior)
  auth.uid() = id
  OR
  -- Allow reading profiles of users who have created plans (for displaying attendees)
  EXISTS (
    SELECT 1 FROM plans
    WHERE plans.created_by = profiles.id
  )
);

-- Verification: This policy allows:
-- 1. Users to read their own profile (when logged in)
-- 2. Anyone (including unauthenticated users) to read profiles of users who have created plans
-- 3. This enables the join in plans queries to return profile data for displaying attendees

