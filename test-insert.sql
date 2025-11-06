-- Test insertion script to verify schema migrations work
-- This tests that the columns accept the exact data types our app uses

-- First, check if you have any test user/squad setup
-- You'll need to replace these UUIDs with real ones from your database

DO $$
DECLARE
  test_user_id uuid;
  test_squad_id uuid;
BEGIN
  -- Get a real user ID (you can replace this with your actual user ID)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  -- Get a real squad ID (or create a test one)
  SELECT id INTO test_squad_id FROM squads LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE '⚠️  No users found in profiles table. Please create a user first.';
    RETURN;
  END IF;

  IF test_squad_id IS NULL THEN
    RAISE NOTICE '⚠️  No squads found. Creating a test squad...';
    INSERT INTO squads (name, created_by)
    VALUES ('Test Squad', test_user_id)
    RETURNING id INTO test_squad_id;
  END IF;

  -- Test 1: Insert a plan with TEXT set_id (like 'cl-2100')
  RAISE NOTICE 'Test 1: Inserting plan with TEXT set_id...';

  BEGIN
    INSERT INTO plans (squad_id, created_by, type, set_id)
    VALUES (test_squad_id, test_user_id, 'set', 'cl-2100');

    RAISE NOTICE '✅ SUCCESS: set_id accepts text values like "cl-2100"';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ FAILED: set_id does not accept text - Error: %', SQLERRM;
    RAISE NOTICE '   You need to run: ALTER TABLE plans ALTER COLUMN set_id TYPE text;';
  END;

  -- Test 2: Insert a plan with TEXT meet_time (like '9:00 PM')
  RAISE NOTICE 'Test 2: Inserting plan with TEXT meet_time...';

  BEGIN
    INSERT INTO plans (squad_id, created_by, type, meet_time, meet_location)
    VALUES (test_squad_id, test_user_id, 'meetup', '9:00 PM', 'Main entrance');

    RAISE NOTICE '✅ SUCCESS: meet_time accepts text values like "9:00 PM"';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ FAILED: meet_time does not accept text - Error: %', SQLERRM;
    RAISE NOTICE '   You need to run: ALTER TABLE plans ALTER COLUMN meet_time TYPE text;';
  END;

  -- Clean up test data
  DELETE FROM plans WHERE created_by = test_user_id AND (set_id = 'cl-2100' OR meet_time = '9:00 PM');
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Test complete! Check results above.';
  RAISE NOTICE '════════════════════════════════════════';
END $$;
