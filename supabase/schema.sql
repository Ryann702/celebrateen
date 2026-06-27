create extension if not exists "pgcrypto";

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  name text,
  question text not null,
  created_at timestamptz not null default now(),
  selected boolean not null default false,
  position integer
);

create index if not exists questions_created_at_idx
  on public.questions (created_at desc);

create index if not exists questions_selected_position_idx
  on public.questions (selected, position);

alter table public.questions enable row level security;

grant usage on schema public to service_role;
grant all privileges on table public.questions to service_role;

drop policy if exists "service role manages questions" on public.questions;

create policy "service role manages questions"
  on public.questions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
