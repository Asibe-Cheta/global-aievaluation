-- Audit log for the checkout consent checkboxes required by
-- legal-source/DEVELOPER_COMPLIANCE.MD §6/§14/§31 (Terms acceptance,
-- immediate-digital-access consent, early-service-start consent for
-- coaching). One row per checkbox per checkout, recording the exact
-- wording shown so we have proof of what the user actually agreed to,
-- not just that "a" consent existed.
create table public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms',
    'immediate_digital_access',
    'early_service_start'
  )),
  version text not null,
  wording text not null,
  accepted boolean not null,
  order_reference text,
  created_at timestamptz not null default now()
);

create index legal_consents_user_id_created_at_idx
  on public.legal_consents (user_id, created_at desc);

alter table public.legal_consents enable row level security;

create policy "legal_consents_select_own" on public.legal_consents
  for select using (user_id = auth.uid() or is_admin());
-- No insert/update policy for authenticated users — only service_role
-- (the checkout server action) writes rows here.
