-- Update RLS Policies for Plans Table
-- This allows users to create and read personal plans (squad_id = null)
-- as well as squad plans (when they are members)

-- Drop old policies
DROP POLICY IF EXISTS "plans squad read" ON plans;
DROP POLICY IF EXISTS "plans create by member" ON plans;
DROP POLICY IF EXISTS "plans update own or owner" ON plans;

-- Drop new policies if they already exist (for re-running this script)
DROP POLICY IF EXISTS "plans create by member or personal" ON plans;
DROP POLICY IF EXISTS "plans read squad or personal" ON plans;
DROP POLICY IF EXISTS "plans update own or squad owner" ON plans;
DROP POLICY IF EXISTS "plans delete own or squad owner" ON plans;

-- Create new INSERT policy that allows both personal and squad plans
CREATE POLICY "plans create by member or personal" ON plans
FOR INSERT WITH CHECK (
  -- Personal plan: squad_id is null AND user is the creator
  (squad_id IS NULL AND created_by = auth.uid())
  OR
  -- Squad plan: user is a member of the squad (squad_id is NOT null)
  (squad_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM squad_members m
    WHERE m.squad_id = squad_id 
    AND m.profile_id = auth.uid()
  ))
);

-- Create new SELECT policy that allows reading personal and squad plans
CREATE POLICY "plans read squad or personal" ON plans
FOR SELECT USING (
  -- Personal plan: allow reading ALL individual plans (squad_id IS NULL)
  (squad_id IS NULL)
  OR
  -- Squad plan: user is a member
  (squad_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM squad_members m
    WHERE m.squad_id = plans.squad_id 
    AND m.profile_id = auth.uid()
  ))
);

-- Create UPDATE policy that allows updating own personal plans or squad plans (if owner)
CREATE POLICY "plans update own or squad owner" ON plans
FOR UPDATE USING (
  -- Personal plan: user is the creator
  (squad_id IS NULL AND created_by = auth.uid())
  OR
  -- Squad plan: user is the creator OR squad owner
  (squad_id IS NOT NULL AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM squad_members m
      WHERE m.squad_id = plans.squad_id
      AND m.profile_id = auth.uid()
      AND m.role = 'owner'
    )
  ))
)
WITH CHECK (
  -- Same conditions for the new values
  (squad_id IS NULL AND created_by = auth.uid())
  OR
  (squad_id IS NOT NULL AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM squad_members m
      WHERE m.squad_id = plans.squad_id
      AND m.profile_id = auth.uid()
      AND m.role = 'owner'
    )
  ))
);

-- Create DELETE policy that allows deleting own personal plans or squad plans (if owner)
CREATE POLICY "plans delete own or squad owner" ON plans
FOR DELETE USING (
  -- Personal plan: user is the creator
  (squad_id IS NULL AND created_by = auth.uid())
  OR
  -- Squad plan: user is the creator OR squad owner
  (squad_id IS NOT NULL AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM squad_members m
      WHERE m.squad_id = plans.squad_id
      AND m.profile_id = auth.uid()
      AND m.role = 'owner'
    )
  ))
);

-- Ensure RLS is enabled on the plans table
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Verification: List all policies (for debugging)
-- Uncomment to see all policies after running:
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'plans';

