-- Run this in the Supabase Dashboard SQL Editor after 0001-0005.
--
-- Testimonials shown in the "What Others Have To Say" / Reviews section
-- of the public marketing site.

create table public.testimonials (
  id text primary key,
  name text not null,
  role text,
  quote text not null,
  avatar_url text,
  rating integer check (rating between 1 and 5),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "testimonials_select_active" on public.testimonials
  for select using (is_active or is_admin());
create policy "testimonials_admin_write" on public.testimonials
  for all using (is_admin()) with check (is_admin());
