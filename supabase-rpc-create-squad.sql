-- Run this in Supabase SQL Editor to create the RPC function
-- This function creates a squad and adds the creator as a member atomically

CREATE OR REPLACE FUNCTION create_squad_with_member(
  squad_name TEXT,
  invite_code_param TEXT,
  creator_id UUID
)
RETURNS TABLE (
  squad_id UUID,
  squad_name TEXT,
  squad_invite_code TEXT,
  squad_created_by UUID,
  squad_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_squad_id UUID;
BEGIN
  -- Insert the squad
  INSERT INTO squads (name, invite_code, created_by)
  VALUES (squad_name, invite_code_param, creator_id)
  RETURNING id INTO new_squad_id;

  -- Add creator as owner
  INSERT INTO squad_members (squad_id, profile_id, role)
  VALUES (new_squad_id, creator_id, 'owner');

  -- Return the created squad
  RETURN QUERY
  SELECT id, name, invite_code, created_by, created_at
  FROM squads
  WHERE id = new_squad_id;
END;
$$;
