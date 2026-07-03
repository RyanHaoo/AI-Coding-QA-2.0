import type { ProjectMembership } from "@/lib/identity/types";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildEditedActivityContent,
  buildReassignedActivityContent,
  buildRejectedActivityContent,
  buildReopenedActivityContent,
  buildResolvedActivityContent,
  getTicketOperationPermission,
  validateEditInput,
  validateReassignInput,
  validateRejectInput,
  validateReopenInput,
  validateResolveInput,
} from "@/lib/tickets/operations";
import type {
  EditTicketInput,
  ReassignTicketInput,
  RejectTicketInput,
  ReopenTicketInput,
  ResolveTicketInput,
  TicketActivityType,
  TicketDetailData,
  TicketOperationState,
  TicketSeverity,
  TicketSpecialty,
  TicketStatus,
} from "@/lib/tickets/types";

type RelatedValue<T> = T | T[] | null;
type WriteSupabaseClient = {
  from(table: string): {
    insert(values: Record<string, unknown>): Promise<{ error: Error | null }>;
    update(values: Record<string, unknown>): {
      eq(column: string, value: string): Promise<{ error: Error | null }>;
    };
  };
};

type MutationTicketRow = {
  assignee: RelatedValue<MutationMembershipRow>;
  assignee_membership_id: string;
  creator: RelatedValue<MutationMembershipRow>;
  creator_membership_id: string;
  description: string | null;
  id: string;
  image_urls: string[] | null;
  location_detail: string;
  preventive_action: string | null;
  project_id: string;
  root_cause: string | null;
  severity: string;
  specialty: string;
  status: string;
  summary: string;
  ticket_number: string;
};

type MutationMembershipRow = {
  id: string;
  profile: RelatedValue<{
    avatar_url: string | null;
    department: string;
    email: string;
    employee_number: string;
    full_name: string;
    id: string;
  }>;
  project_id: string;
  role: string;
};

type MutationResult = TicketOperationState;

const ticketMutationSelect = `
  id,
  ticket_number,
  project_id,
  creator_membership_id,
  assignee_membership_id,
  status,
  severity,
  specialty,
  summary,
  location_detail,
  description,
  image_urls,
  root_cause,
  preventive_action,
  creator:project_memberships!tickets_creator_membership_id_fkey(
    id,
    role,
    project_id,
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
    project_id,
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

function firstRelated<T>(value: RelatedValue<T>) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function ok(message = "操作已完成。"): MutationResult {
  return { message, ok: true };
}

function fail(message: string): MutationResult {
  return { message, ok: false };
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

function mapMutationTicket(row: MutationTicketRow): TicketDetailData | null {
  const creator = firstRelated(row.creator);
  const creatorProfile = firstRelated(creator?.profile ?? null);
  const assignee = firstRelated(row.assignee);
  const assigneeProfile = firstRelated(assignee?.profile ?? null);

  if (
    !creator ||
    !creatorProfile ||
    !assignee ||
    !assigneeProfile ||
    !isTicketStatus(row.status) ||
    !isTicketSeverity(row.severity) ||
    !isTicketSpecialty(row.specialty)
  ) {
    return null;
  }

  return {
    activities: [],
    assignee: {
      membershipId: assignee.id,
      profile: {
        avatarUrl: assigneeProfile.avatar_url,
        department: assigneeProfile.department,
        email: assigneeProfile.email,
        employeeNumber: assigneeProfile.employee_number,
        fullName: assigneeProfile.full_name,
        id: assigneeProfile.id,
      },
      role: assignee.role === "admin" ? "admin" : "builder",
    },
    createdAt: "",
    creator: {
      membershipId: creator.id,
      profile: {
        avatarUrl: creatorProfile.avatar_url,
        department: creatorProfile.department,
        email: creatorProfile.email,
        employeeNumber: creatorProfile.employee_number,
        fullName: creatorProfile.full_name,
        id: creatorProfile.id,
      },
      role: creator.role === "admin" ? "admin" : "inspector",
    },
    description: row.description,
    id: row.id,
    imageUrls: row.image_urls ?? [],
    locationDetail: row.location_detail,
    preventiveAction: row.preventive_action,
    project: {
      city: "",
      clientName: "",
      id: row.project_id,
      name: "",
      projectType: "commercial",
    },
    rootCause: row.root_cause,
    severity: row.severity,
    specialty: row.specialty,
    status: row.status,
    summary: row.summary,
    ticketNumber: row.ticket_number,
    updatedAt: "",
  };
}

async function getMutationTicket(ticketId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(ticketMutationSelect)
    .eq("id", ticketId)
    .maybeSingle();

  if (error) {
    return { error: error.message, ticket: null };
  }

  if (!data) {
    return { error: "工单不存在或已不可访问。", ticket: null };
  }

  const ticket = mapMutationTicket(data as unknown as MutationTicketRow);

  if (!ticket) {
    return { error: "工单数据不完整，无法执行操作。", ticket: null };
  }

  return { error: null, ticket };
}

async function insertActivity(input: {
  actorMembershipId: string;
  content: string;
  reason?: string | null;
  ticketId: string;
  type: TicketActivityType;
}) {
  const supabase = createAdminClient() as unknown as WriteSupabaseClient;
  const { error } = await supabase.from("ticket_activity_logs").insert({
    actor_membership_id: input.actorMembershipId,
    activity_type: input.type,
    content: input.content,
    reason: input.reason ?? null,
    ticket_id: input.ticketId,
  });

  return error;
}

function rejectProjectMismatch(
  ticket: TicketDetailData,
  currentIdentity: ProjectMembership,
) {
  return ticket.project.id !== currentIdentity.project.id
    ? fail("当前身份无权访问该项目工单。")
    : null;
}

export async function resolveTicket(
  input: ResolveTicketInput,
  currentIdentity: ProjectMembership,
): Promise<MutationResult> {
  if (!validateResolveInput(input)) {
    return fail("请填写问题归因。");
  }

  const { error, ticket } = await getMutationTicket(input.ticketId);
  if (error || !ticket) {
    return fail(error ?? "工单读取失败。");
  }

  const mismatch = rejectProjectMismatch(ticket, currentIdentity);
  if (mismatch) {
    return mismatch;
  }

  if (!getTicketOperationPermission(ticket, currentIdentity).canResolve) {
    return fail("当前身份无权解决该工单，或工单状态已变化。");
  }

  const supabase = createAdminClient() as unknown as WriteSupabaseClient;
  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      preventive_action: input.preventiveAction.trim() || null,
      root_cause: input.rootCause.trim(),
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId);

  if (updateError) {
    return fail(`解决工单失败：${updateError.message}`);
  }

  const activityError = await insertActivity({
    actorMembershipId: currentIdentity.id,
    content: buildResolvedActivityContent(),
    reason: input.rootCause.trim(),
    ticketId: input.ticketId,
    type: "resolved",
  });

  if (activityError) {
    return fail(`处理记录写入失败：${activityError.message}`);
  }

  return ok("工单已解决。");
}

export async function rejectTicket(
  input: RejectTicketInput,
  currentIdentity: ProjectMembership,
): Promise<MutationResult> {
  if (!validateRejectInput(input)) {
    return fail("请填写拒绝原因。");
  }

  const { error, ticket } = await getMutationTicket(input.ticketId);
  if (error || !ticket) {
    return fail(error ?? "工单读取失败。");
  }

  const mismatch = rejectProjectMismatch(ticket, currentIdentity);
  if (mismatch) {
    return mismatch;
  }

  if (!getTicketOperationPermission(ticket, currentIdentity).canReject) {
    return fail("当前身份无权拒绝该工单，或工单状态已变化。");
  }

  const supabase = createAdminClient() as unknown as WriteSupabaseClient;
  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId);

  if (updateError) {
    return fail(`拒绝工单失败：${updateError.message}`);
  }

  const activityError = await insertActivity({
    actorMembershipId: currentIdentity.id,
    content: buildRejectedActivityContent(),
    reason: input.reason.trim(),
    ticketId: input.ticketId,
    type: "rejected",
  });

  if (activityError) {
    return fail(`处理记录写入失败：${activityError.message}`);
  }

  return ok("工单已拒绝。");
}

export async function editTicket(
  input: EditTicketInput,
  currentIdentity: ProjectMembership,
): Promise<MutationResult> {
  if (!validateEditInput(input)) {
    return fail("请补全严重程度、专业类型、问题描述和详细位置。");
  }

  const { error, ticket } = await getMutationTicket(input.ticketId);
  if (error || !ticket) {
    return fail(error ?? "工单读取失败。");
  }

  const mismatch = rejectProjectMismatch(ticket, currentIdentity);
  if (mismatch) {
    return mismatch;
  }

  if (!getTicketOperationPermission(ticket, currentIdentity).canEdit) {
    return fail("当前身份无权编辑该工单，或工单状态已变化。");
  }

  const content = buildEditedActivityContent(ticket, input);
  const supabase = createAdminClient() as unknown as WriteSupabaseClient;
  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      description: input.description.trim() || null,
      image_urls: input.imageUrls,
      location_detail: input.locationDetail.trim(),
      severity: input.severity,
      specialty: input.specialty,
      summary: input.summary.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId);

  if (updateError) {
    return fail(`编辑工单失败：${updateError.message}`);
  }

  const activityError = await insertActivity({
    actorMembershipId: currentIdentity.id,
    content,
    ticketId: input.ticketId,
    type: "edited",
  });

  if (activityError) {
    return fail(`处理记录写入失败：${activityError.message}`);
  }

  return ok("工单信息已保存。");
}

export async function reassignTicket(
  input: ReassignTicketInput,
  currentIdentity: ProjectMembership,
): Promise<MutationResult> {
  if (!validateReassignInput(input)) {
    return fail("请选择新责任人并填写指派原因。");
  }

  const { error, ticket } = await getMutationTicket(input.ticketId);
  if (error || !ticket) {
    return fail(error ?? "工单读取失败。");
  }

  const mismatch = rejectProjectMismatch(ticket, currentIdentity);
  if (mismatch) {
    return mismatch;
  }

  if (!getTicketOperationPermission(ticket, currentIdentity).canReassign) {
    return fail("当前身份无权指派该工单，或工单状态已变化。");
  }

  if (input.assigneeMembershipId === ticket.assignee.membershipId) {
    return fail("新责任人不能与当前责任人相同。");
  }

  const supabase = createAdminClient();
  const { data: assignee, error: assigneeError } = await supabase
    .from("project_memberships")
    .select(`
      id,
      role,
      project_id,
      profile:app_users(
        id,
        email,
        employee_number,
        full_name,
        department,
        avatar_url
      )
    `)
    .eq("id", input.assigneeMembershipId)
    .eq("project_id", currentIdentity.project.id)
    .eq("role", "builder")
    .maybeSingle();

  if (assigneeError || !assignee) {
    return fail("新责任人必须是当前项目内另一名施工方。");
  }

  const profile = firstRelated(
    (assignee as unknown as MutationMembershipRow).profile,
  );

  if (!profile) {
    return fail("新责任人资料不完整。");
  }

  const writeSupabase = createAdminClient() as unknown as WriteSupabaseClient;
  const { error: updateError } = await writeSupabase
    .from("tickets")
    .update({
      assignee_membership_id: input.assigneeMembershipId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId);

  if (updateError) {
    return fail(`指派工单失败：${updateError.message}`);
  }

  const activityError = await insertActivity({
    actorMembershipId: currentIdentity.id,
    content: buildReassignedActivityContent(
      ticket.assignee.profile.fullName,
      profile.full_name,
    ),
    reason: input.reason.trim(),
    ticketId: input.ticketId,
    type: "reassigned",
  });

  if (activityError) {
    return fail(`处理记录写入失败：${activityError.message}`);
  }

  return ok("工单已指派给新责任人。");
}

export async function reopenTicket(
  input: ReopenTicketInput,
  currentIdentity: ProjectMembership,
): Promise<MutationResult> {
  if (!validateReopenInput(input)) {
    return fail("请填写重新打开原因。");
  }

  const { error, ticket } = await getMutationTicket(input.ticketId);
  if (error || !ticket) {
    return fail(error ?? "工单读取失败。");
  }

  const mismatch = rejectProjectMismatch(ticket, currentIdentity);
  if (mismatch) {
    return mismatch;
  }

  if (!getTicketOperationPermission(ticket, currentIdentity).canReopen) {
    return fail("当前身份无权重新打开该工单，或工单状态已变化。");
  }

  const previousStatus = ticket.status;
  const supabase = createAdminClient() as unknown as WriteSupabaseClient;
  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId);

  if (updateError) {
    return fail(`重新打开工单失败：${updateError.message}`);
  }

  const activityError = await insertActivity({
    actorMembershipId: currentIdentity.id,
    content: buildReopenedActivityContent(previousStatus),
    reason: input.reason.trim(),
    ticketId: input.ticketId,
    type: "reopened",
  });

  if (activityError) {
    return fail(`处理记录写入失败：${activityError.message}`);
  }

  return ok("工单已重新打开。");
}
