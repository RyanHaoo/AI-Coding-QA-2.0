create table if not exists public.assistant_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  membership_id uuid not null references public.project_memberships(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  draft_state jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assistant_sessions_default_membership_unique unique (user_id, membership_id)
);

create index if not exists assistant_sessions_user_project_idx
  on public.assistant_sessions(user_id, project_id);

alter table public.assistant_sessions enable row level security;

drop policy if exists "Users can read own assistant sessions" on public.assistant_sessions;
create policy "Users can read own assistant sessions"
  on public.assistant_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own assistant sessions" on public.assistant_sessions;
create policy "Users can insert own assistant sessions"
  on public.assistant_sessions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.project_memberships pm
      where pm.id = assistant_sessions.membership_id
        and pm.project_id = assistant_sessions.project_id
        and pm.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update own assistant sessions" on public.assistant_sessions;
create policy "Users can update own assistant sessions"
  on public.assistant_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.assistant_sessions to authenticated;
grant all on public.assistant_sessions to service_role;

grant insert on public.tickets to service_role;
