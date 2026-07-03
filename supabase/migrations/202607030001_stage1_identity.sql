create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  employee_number text not null unique,
  full_name text not null,
  department text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  client_name text not null,
  project_type text not null check (
    project_type in ('commercial', 'industrial', 'residential', 'government')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.project_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('inspector', 'builder', 'admin')),
  created_at timestamptz not null default now(),
  unique (user_id, project_id, role)
);

create index if not exists project_memberships_user_id_idx
  on public.project_memberships(user_id);

create index if not exists project_memberships_project_id_idx
  on public.project_memberships(project_id);

alter table public.app_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;

drop policy if exists "Users can read own profile" on public.app_users;
create policy "Users can read own profile"
  on public.app_users
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can read own memberships" on public.project_memberships;
create policy "Users can read own memberships"
  on public.project_memberships
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read projects they belong to" on public.projects;
create policy "Users can read projects they belong to"
  on public.projects
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.project_memberships pm
      where pm.project_id = projects.id
        and pm.user_id = (select auth.uid())
    )
  );

grant usage on schema public to authenticated;
grant select on public.app_users to authenticated;
grant select on public.projects to authenticated;
grant select on public.project_memberships to authenticated;

grant all on public.app_users to service_role;
grant all on public.projects to service_role;
grant all on public.project_memberships to service_role;
