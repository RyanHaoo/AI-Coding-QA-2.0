import type {
  ProjectMembership,
  ProjectType,
  Role,
} from "@/lib/identity/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  TicketActivity,
  TicketActivityType,
  TicketAssigneeCandidate,
  TicketDetailData,
  TicketDetailResult,
  TicketPerson,
  TicketSeverity,
  TicketSort,
  TicketSpecialty,
  TicketStatus,
  TicketStatusFilter,
  TicketSummary,
} from "@/lib/tickets/types";

type RelatedValue<T> = T | T[] | null;

type ProfileRow = {
  avatar_url: string | null;
  department: string;
  email: string;
  employee_number: string;
  full_name: string;
  id: string;
};

type ProjectRow = {
  city: string;
  client_name: string;
  id: string;
  name: string;
  project_type: string;
};

type MembershipRow = {
  id: string;
  profile: RelatedValue<ProfileRow>;
  role: string;
};

type TicketRow = {
  assignee: RelatedValue<MembershipRow>;
  created_at: string;
  creator: RelatedValue<MembershipRow>;
  description?: string | null;
  id: string;
  image_urls: string[] | null;
  location_detail: string;
  preventive_action?: string | null;
  project: RelatedValue<ProjectRow>;
  root_cause?: string | null;
  severity: string;
  specialty: string;
  status: string;
  summary: string;
  ticket_number: string;
  updated_at: string;
};

type ActivityRow = {
  actor: RelatedValue<MembershipRow>;
  activity_type: string;
  content: string;
  created_at: string;
  id: string;
  reason: string | null;
};

const ticketSelect = `
  id,
  ticket_number,
  status,
  severity,
  specialty,
  summary,
  location_detail,
  description,
  image_urls,
  root_cause,
  preventive_action,
  created_at,
  updated_at,
  project:projects(
    id,
    name,
    city,
    client_name,
    project_type
  ),
  creator:project_memberships!tickets_creator_membership_id_fkey(
    id,
    role,
    profile:app_users(
      id,
      email,
      employee_number,
      full_name,
      department,
      avatar_url
    )
  ),
  assignee:project_memberships!tickets_assignee_membership_id_fkey(
    id,
    role,
    profile:app_users(
      id,
      email,
      employee_number,
      full_name,
      department,
      avatar_url
    )
  )
`;

const ticketDetailSelect = `
  ${ticketSelect},
  activities:ticket_activity_logs(
    id,
    activity_type,
    reason,
    content,
    created_at,
    actor:project_memberships!ticket_activity_logs_actor_membership_id_fkey(
      id,
      role,
      profile:app_users(
        id,
        email,
        employee_number,
        full_name,
        department,
        avatar_url
      )
    )
  )
`;

function firstRelated<T>(value: RelatedValue<T>) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function isRole(value: string): value is Role {
  return value === "inspector" || value === "builder" || value === "admin";
}

function isProjectType(value: string): value is ProjectType {
  return (
    value === "commercial" ||
    value === "industrial" ||
    value === "residential" ||
    value === "government"
  );
}

function isTicketStatus(value: string): value is TicketStatus {
  return value === "pending" || value === "completed" || value === "rejected";
}

function isTicketSeverity(value: string): value is TicketSeverity {
  return (
    value === "minor" ||
    value === "normal" ||
    value === "serious" ||
    value === "urgent"
  );
}

function isTicketSpecialty(value: string): value is TicketSpecialty {
  return (
    value === "architecture" || value === "structure" || value === "plumbing"
  );
}

function isTicketActivityType(value: string): value is TicketActivityType {
  return (
    value === "created" ||
    value === "edited" ||
    value === "resolved" ||
    value === "rejected" ||
    value === "reassigned" ||
    value === "reopened"
  );
}

function mapPerson(value: RelatedValue<MembershipRow>): TicketPerson | null {
  const membership = firstRelated(value);
  const profile = firstRelated(membership?.profile ?? null);

  if (!membership || !profile || !isRole(membership.role)) {
    return null;
  }

  return {
    membershipId: membership.id,
    profile: {
      avatarUrl: profile.avatar_url,
      department: profile.department,
      email: profile.email,
      employeeNumber: profile.employee_number,
      fullName: profile.full_name,
      id: profile.id,
    },
    role: membership.role,
  };
}

function mapTicketSummary(row: TicketRow): TicketSummary | null {
  const project = firstRelated(row.project);
  const creator = mapPerson(row.creator);
  const assignee = mapPerson(row.assignee);

  if (
    !project ||
    !creator ||
    !assignee ||
    !isTicketStatus(row.status) ||
    !isTicketSeverity(row.severity) ||
    !isTicketSpecialty(row.specialty)
  ) {
    return null;
  }

  return {
    assignee,
    createdAt: row.created_at,
    creator,
    id: row.id,
    imageUrls: row.image_urls ?? [],
    locationDetail: row.location_detail,
    project: {
      city: project.city,
      clientName: project.client_name,
      id: project.id,
      name: project.name,
      projectType: isProjectType(project.project_type)
        ? project.project_type
        : "commercial",
    },
    severity: row.severity,
    specialty: row.specialty,
    status: row.status,
    summary: row.summary,
    ticketNumber: row.ticket_number,
    updatedAt: row.updated_at,
  };
}

function mapActivity(row: ActivityRow): TicketActivity | null {
  const actor = mapPerson(row.actor);

  if (!actor || !isTicketActivityType(row.activity_type)) {
    return null;
  }

  return {
    actor,
    activityType: row.activity_type,
    content: row.content,
    createdAt: row.created_at,
    id: row.id,
    reason: row.reason,
  };
}

function sortTickets(tickets: TicketSummary[], sort: TicketSort) {
  return [...tickets].sort((left, right) => {
    const severityDelta =
      Number(right.severity === "urgent") - Number(left.severity === "urgent");

    if (severityDelta !== 0) {
      return severityDelta;
    }

    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    return sort === "newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}

export async function getMemberTickets(
  currentIdentity: ProjectMembership,
  status: TicketStatusFilter,
  sort: TicketSort,
) {
  const supabase = await createClient();
  let query = supabase
    .from("tickets")
    .select(ticketSelect)
    .eq("project_id", currentIdentity.project.id);

  if (currentIdentity.role === "inspector") {
    query = query.eq("creator_membership_id", currentIdentity.id);
  } else if (currentIdentity.role === "builder") {
    query = query.eq("assignee_membership_id", currentIdentity.id);
  }

  if (status === "pending") {
    query = query.eq("status", "pending");
  } else if (status === "closed") {
    query = query.in("status", ["completed", "rejected"]);
  }

  const { data, error } = await query;

  if (error) {
    return {
      error: error.message,
      tickets: [],
    };
  }

  return {
    error: null,
    tickets: sortTickets(
      ((data ?? []) as unknown as TicketRow[]).flatMap((row) => {
        const ticket = mapTicketSummary(row);
        return ticket ? [ticket] : [];
      }),
      sort,
    ),
  };
}

export async function getAdminTickets(currentIdentity: ProjectMembership) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(ticketSelect)
    .eq("project_id", currentIdentity.project.id);

  if (error) {
    return {
      error: error.message,
      tickets: [],
    };
  }

  return {
    error: null,
    tickets: sortTickets(
      ((data ?? []) as unknown as TicketRow[]).flatMap((row) => {
        const ticket = mapTicketSummary(row);
        return ticket ? [ticket] : [];
      }),
      "newest",
    ),
  };
}

async function ticketExists(ticketId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function getTicketDetail(
  ticketId: string,
): Promise<TicketDetailResult> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      ticketId,
    )
  ) {
    return { kind: "not-found" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(ticketDetailSelect)
    .eq("id", ticketId)
    .maybeSingle();

  if (error) {
    return { kind: "not-found" };
  }

  if (!data) {
    return (await ticketExists(ticketId))
      ? { kind: "forbidden" }
      : { kind: "not-found" };
  }

  const summary = mapTicketSummary(data as unknown as TicketRow);
  if (!summary) {
    return { kind: "not-found" };
  }

  const activities = (
    ((data as { activities?: ActivityRow[] }).activities ?? []) as ActivityRow[]
  )
    .flatMap((row) => {
      const activity = mapActivity(row);
      return activity ? [activity] : [];
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

  return {
    kind: "found",
    ticket: {
      ...summary,
      activities,
      description: (data as TicketRow).description ?? null,
      preventiveAction: (data as TicketRow).preventive_action ?? null,
      rootCause: (data as TicketRow).root_cause ?? null,
    } satisfies TicketDetailData,
  };
}

export async function getReassignCandidates(
  currentIdentity: ProjectMembership,
  currentAssigneeMembershipId: string,
): Promise<TicketAssigneeCandidate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_memberships")
    .select(`
      id,
      profile:app_users(
        id,
        email,
        employee_number,
        full_name,
        department,
        avatar_url
      )
    `)
    .eq("project_id", currentIdentity.project.id)
    .eq("role", "builder")
    .neq("id", currentAssigneeMembershipId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (
    (data ?? []) as unknown as Array<{
      id: string;
      profile: RelatedValue<ProfileRow>;
    }>
  ).flatMap((row) => {
    const profile = firstRelated(row.profile);

    if (!profile) {
      return [];
    }

    return [
      {
        membershipId: row.id,
        profile: {
          avatarUrl: profile.avatar_url,
          department: profile.department,
          email: profile.email,
          employeeNumber: profile.employee_number,
          fullName: profile.full_name,
          id: profile.id,
        },
      },
    ];
  });
}
