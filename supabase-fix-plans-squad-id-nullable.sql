-- Allow squad_id to be NULL for personal plans
-- This fixes the constraint violation when creating individual plans

-- Problem: The plans table has a NOT NULL constraint on squad_id,
-- but the application is designed to support personal plans where squad_id is NULL.
--
-- Error: "null value in column "squad_id" of relation "plans" violates not-null constraint"
--
-- Solution: Remove the NOT NULL constraint to allow both:
-- - Personal plans: squad_id = NULL
-- - Squad plans: squad_id = valid UUID

ALTER TABLE plans
ALTER COLUMN squad_id DROP NOT NULL;

-- The column can now be:
-- - NULL for personal/individual plans (created_by tracks ownership)
-- - A valid squad UUID for squad plans (RLS policies enforce membership)
