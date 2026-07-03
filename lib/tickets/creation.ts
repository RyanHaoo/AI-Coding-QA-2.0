import { randomUUID } from "node:crypto";

import type { ProjectMembership } from "@/lib/identity/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTicketSeverity, isTicketSpecialty } from "@/lib/tickets/operations";
import type {
  TicketSeverity,
  TicketSpecialty,
  TicketSummary,
} from "@/lib/tickets/types";

export type CreateAssistantTicketInput = {
  assigneeMembershipId: string;
  description: string;
  imageUrls: string[];
  locationDetail: string;
  severity: TicketSeverity;
  specialty: TicketSpecialty;
  summary: string;
};

type RelatedValue<T> = T | T[] | null;

type BuilderRow = {
  id: string;
  profile: RelatedValue<{
    full_name: string;
    id: string;
  }>;
  project_id: string;
  role: string;
};

type CreatedTicketRow = {
  id: string;
  image_urls: string[] | null;
  location_detail: string;
  severity: string;
  specialty: string;
  status: string;
  summary: string;
  ticket_number: string;
};

type TicketCreationWriteClient = {
  from(table: "tickets"): {
    insert(values: Record<string, unknown>): {
      select(columns: string): {
        single(): Promise<{ data: unknown; error: Error | null }>;
      };
    };
  };
} & {
  from(table: "ticket_activity_logs"): {
    insert(values: Record<string, unknown>): Promise<{ error: Error | null }>;
  };
};

function firstRelated<T>(value: RelatedValue<T>) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function buildTicketNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
  return `QA-${stamp}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

function isTrustedImageUrl(url: string) {
  return /^https?:\/\/.+\/storage\/v1\/object\/public\/ticket-images\//.test(
    url,
  );
}

function normalizeCreatedSeverity(value: string): TicketSeverity {
  return isTicketSeverity(value) ? value : "normal";
}

function normalizeCreatedSpecialty(value: string): TicketSpecialty {
  return isTicketSpecialty(value) ? value : "architecture";
}

export async function createTicketFromAssistantDraft(
  input: CreateAssistantTicketInput,
  currentIdentity: ProjectMembership,
) {
  if (currentIdentity.role === "builder") {
    return {
      error: "施工方不能发起工单。请联系质检员或管理员创建。",
      ticket: null,
    };
  }

  if (
    !input.summary.trim() ||
    !input.locationDetail.trim() ||
    !input.assigneeMembershipId ||
    !isTicketSeverity(input.severity) ||
    !isTicketSpecialty(input.specialty)
  ) {
    return {
      error: "请补全问题描述、详细位置、严重程度、专业类型和责任人。",
      ticket: null,
    };
  }

  const imageUrls = input.imageUrls.filter(isTrustedImageUrl);
  if (imageUrls.length !== input.imageUrls.length) {
    return {
      error: "图片 URL 必须来自当前项目的工单图片上传结果。",
      ticket: null,
    };
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
        full_name
      )
    `)
    .eq("id", input.assigneeMembershipId)
    .eq("project_id", currentIdentity.project.id)
    .eq("role", "builder")
    .maybeSingle();

  if (assigneeError || !assignee) {
    return {
      error: "责任人必须是当前项目施工方。",
      ticket: null,
    };
  }

  const writeSupabase = supabase as unknown as TicketCreationWriteClient;
  const { data: inserted, error: insertError } = await writeSupabase
    .from("tickets")
    .insert({
      assignee_membership_id: input.assigneeMembershipId,
      creator_membership_id: currentIdentity.id,
      description: input.description.trim() || null,
      image_urls: imageUrls,
      location_detail: input.locationDetail.trim(),
      project_id: currentIdentity.project.id,
      root_cause: null,
      preventive_action: null,
      severity: input.severity,
      specialty: input.specialty,
      status: "pending",
      summary: input.summary.trim(),
      ticket_number: buildTicketNumber(),
    })
    .select(
      "id, ticket_number, status, severity, specialty, summary, location_detail, image_urls",
    )
    .single();

  if (insertError || !inserted) {
    return {
      error: `创建工单失败：${insertError?.message ?? "无返回数据"}`,
      ticket: null,
    };
  }

  const ticket = inserted as unknown as CreatedTicketRow;
  const assigneeRow = assignee as unknown as BuilderRow;
  const assigneeProfile = firstRelated(assigneeRow.profile);

  const { error: activityError } = await writeSupabase
    .from("ticket_activity_logs")
    .insert({
      actor_membership_id: currentIdentity.id,
      activity_type: "created",
      content: `通过智能助手创建工单，责任人为“${assigneeProfile?.full_name ?? "施工方"}”。`,
      reason: null,
      ticket_id: ticket.id,
    });

  if (activityError) {
    return {
      error: `工单已创建，但处理记录写入失败：${activityError.message}`,
      ticket: null,
    };
  }

  return {
    error: null,
    ticket: {
      assignee: {
        membershipId: input.assigneeMembershipId,
        profile: {
          avatarUrl: null,
          department: "",
          email: "",
          employeeNumber: "",
          fullName: assigneeProfile?.full_name ?? "施工方",
          id: assigneeProfile?.id ?? "",
        },
        role: "builder",
      },
      createdAt: new Date().toISOString(),
      creator: {
        membershipId: currentIdentity.id,
        profile: currentIdentity.profile,
        role: currentIdentity.role,
      },
      description: input.description.trim() || null,
      id: ticket.id,
      imageUrls: ticket.image_urls ?? [],
      locationDetail: ticket.location_detail,
      project: currentIdentity.project,
      severity: normalizeCreatedSeverity(ticket.severity),
      specialty: normalizeCreatedSpecialty(ticket.specialty),
      status: "pending",
      summary: ticket.summary,
      ticketNumber: ticket.ticket_number,
      updatedAt: new Date().toISOString(),
    } satisfies TicketSummary,
  };
}
