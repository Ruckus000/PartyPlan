-- Run this in Supabase SQL Editor to verify schema migrations
-- Expected results show both columns as 'text' type

SELECT
  column_name,
  data_type,
  udt_name,
  CASE
    WHEN data_type = 'text' THEN '✅ CORRECT'
    WHEN data_type = 'uuid' AND column_name = 'set_id' THEN '❌ WRONG - Should be text'
    WHEN data_type = 'timestamp with time zone' AND column_name = 'meet_time' THEN '❌ WRONG - Should be text'
    ELSE '⚠️  CHECK'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'plans'
  AND column_name IN ('set_id', 'meet_time')
ORDER BY column_name;

-- If both show status '✅ CORRECT', your migrations were successful!
