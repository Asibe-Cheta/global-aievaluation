-- Run this in the Supabase Dashboard SQL Editor after 0001-0006.
--
-- The 6 seeded modules were originally titled "Lesson 1: ...", "Lesson 2:
-- ..." etc (a leftover from when the whole curriculum was flat, pre-modules).
-- Modules should read "Module N: ..." instead — this only renames the
-- module-level title; individual lesson titles inside each module are
-- untouched.

update public.modules
set title = regexp_replace(title, '^Lesson (\d+):', 'Module \1:')
where title ~ '^Lesson \d+:';
