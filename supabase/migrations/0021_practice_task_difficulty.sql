-- Real World Practice is now organized by skill level (Beginner / Intermediate
-- / Expert) instead of by timed vs. untimed. Timing stays a per-task property
-- orthogonal to difficulty.
alter table public.practice_tasks
  add column difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'expert'));

-- Reasonable default backfill: previously-timed "Exam Practice" tasks become
-- Expert; everything else stays Beginner until an admin reassigns it.
update public.practice_tasks set difficulty = 'expert' where timed = true;
