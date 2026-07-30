-- Run this in the Supabase Dashboard SQL Editor after 0001-0010.
--
-- The admin can now rename a module's slug/ID after creation. Without ON
-- UPDATE CASCADE, renaming a module that already has lessons/simulation
-- tasks/exam questions/annotation tasks under it would fail with a foreign
-- key violation, since those tables reference modules(id) with the default
-- NO ACTION behavior on update. This makes the rename cascade down to every
-- child row's module_id automatically.

alter table public.lessons
  drop constraint lessons_module_id_fkey,
  add constraint lessons_module_id_fkey
    foreign key (module_id) references public.modules(id)
    on delete cascade on update cascade;

alter table public.simulation_tasks
  drop constraint simulation_tasks_module_id_fkey,
  add constraint simulation_tasks_module_id_fkey
    foreign key (module_id) references public.modules(id)
    on delete cascade on update cascade;

alter table public.exam_questions
  drop constraint exam_questions_module_id_fkey,
  add constraint exam_questions_module_id_fkey
    foreign key (module_id) references public.modules(id)
    on delete cascade on update cascade;

alter table public.annotation_tasks
  drop constraint annotation_tasks_module_id_fkey,
  add constraint annotation_tasks_module_id_fkey
    foreign key (module_id) references public.modules(id)
    on delete cascade on update cascade;
