-- Run this ONLY after:
--   1. Applying 0017_practice_tasks.sql
--   2. Running `npm run migrate-practice-tasks` (copies exam_questions and
--      annotation_tasks rows into practice_tasks) and verifying the result
--   3. Confirming the admin "Real World Practice" section and the public
--      app show the migrated content correctly
--
-- Simulation Tasks were never migrated (feature removed outright, not
-- folded into the new schema) — safe to drop immediately alongside the
-- other two once the app is redeployed without any code referencing it.
drop table if exists public.exam_questions;
drop table if exists public.annotation_tasks;
drop table if exists public.simulation_tasks;
