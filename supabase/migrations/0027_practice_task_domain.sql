-- Real World Practice is now organized primarily by domain (Generalist,
-- Coding & Engineering, STEM, Cybersecurity, Finance & Accounting, Law &
-- Legal, Nursing, Medicine, Data Science & Analytics, Writing &
-- Humanities), with difficulty chosen per-domain. Existing tasks default to
-- 'generalist' so nothing already-built disappears.
alter table public.practice_tasks
  add column domain text not null default 'generalist'
    check (domain in (
      'generalist',
      'coding_engineering',
      'stem',
      'cybersecurity',
      'finance_accounting',
      'law_legal',
      'nursing',
      'medicine',
      'data_science',
      'writing_humanities'
    ));
