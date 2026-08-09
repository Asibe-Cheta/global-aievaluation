-- Lets a candidate's parsed CV profile (from the AI Interview Simulator's
-- resume upload) persist across sessions instead of being lost once the
-- component unmounts, so they don't have to re-upload/re-parse every time.
alter table public.profiles add column saved_cv_profile jsonb;
