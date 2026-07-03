-- Stage 3 keeps write authorization in server actions that use the service role.
-- Authenticated clients retain read-only access through the stage 2 RLS policies.

create index if not exists project_memberships_project_role_idx
  on public.project_memberships(project_id, role);

create index if not exists tickets_project_status_idx
  on public.tickets(project_id, status);

grant update (
  status,
  severity,
  specialty,
  summary,
  location_detail,
  description,
  image_urls,
  root_cause,
  preventive_action,
  assignee_membership_id,
  updated_at
) on public.tickets to service_role;

grant insert on public.ticket_activity_logs to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ticket-images',
  'ticket-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
