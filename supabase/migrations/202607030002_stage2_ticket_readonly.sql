create schema if not exists private;

create or replace function private.is_project_member(check_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.project_memberships pm
    where pm.project_id = check_project_id
      and pm.user_id = (select auth.uid())
  );
$$;

create or replace function private.shares_project_with_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.project_memberships current_pm
    join public.project_memberships target_pm
      on target_pm.project_id = current_pm.project_id
    where current_pm.user_id = (select auth.uid())
      and target_pm.user_id = target_user_id
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_project_member(uuid) to authenticated;
grant execute on function private.shares_project_with_user(uuid) to authenticated;

drop policy if exists "Users can read own profile" on public.app_users;
create policy "Users can read same project profiles"
  on public.app_users
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.shares_project_with_user(id)
  );

drop policy if exists "Users can read own memberships" on public.project_memberships;
create policy "Users can read same project memberships"
  on public.project_memberships
  for select
  to authenticated
  using (private.is_project_member(project_id));

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  project_id uuid not null references public.projects(id) on delete cascade,
  creator_membership_id uuid not null references public.project_memberships(id),
  assignee_membership_id uuid not null references public.project_memberships(id),
  status text not null check (status in ('pending', 'completed', 'rejected')),
  severity text not null check (severity in ('minor', 'normal', 'serious', 'urgent')),
  specialty text not null check (specialty in ('architecture', 'structure', 'plumbing')),
  summary text not null,
  location_detail text not null,
  description text,
  image_urls text[] not null default array[]::text[],
  root_cause text,
  preventive_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_activity_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  actor_membership_id uuid not null references public.project_memberships(id),
  activity_type text not null check (
    activity_type in (
      'created',
      'edited',
      'resolved',
      'rejected',
      'reassigned',
      'reopened'
    )
  ),
  reason text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists tickets_project_id_idx
  on public.tickets(project_id);

create index if not exists tickets_creator_membership_id_idx
  on public.tickets(creator_membership_id);

create index if not exists tickets_assignee_membership_id_idx
  on public.tickets(assignee_membership_id);

create index if not exists tickets_status_idx
  on public.tickets(status);

create index if not exists tickets_severity_created_at_idx
  on public.tickets(severity, created_at);

create index if not exists ticket_activity_logs_ticket_id_created_at_idx
  on public.ticket_activity_logs(ticket_id, created_at desc);

alter table public.tickets enable row level security;
alter table public.ticket_activity_logs enable row level security;

drop policy if exists "Members can read tickets in role scope" on public.tickets;
create policy "Members can read tickets in role scope"
  on public.tickets
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.project_memberships pm
      where pm.id = tickets.creator_membership_id
        and pm.user_id = (select auth.uid())
        and pm.role in ('inspector', 'admin')
    )
    or exists (
      select 1
      from public.project_memberships pm
      where pm.id = tickets.assignee_membership_id
        and pm.user_id = (select auth.uid())
        and pm.role = 'builder'
    )
    or exists (
      select 1
      from public.project_memberships pm
      where pm.project_id = tickets.project_id
        and pm.user_id = (select auth.uid())
        and pm.role = 'admin'
    )
  );

drop policy if exists "Members can read logs for visible tickets" on public.ticket_activity_logs;
create policy "Members can read logs for visible tickets"
  on public.ticket_activity_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tickets t
      where t.id = ticket_activity_logs.ticket_id
    )
  );

grant select on public.tickets to authenticated;
grant select on public.ticket_activity_logs to authenticated;

grant all on public.tickets to service_role;
grant all on public.ticket_activity_logs to service_role;
