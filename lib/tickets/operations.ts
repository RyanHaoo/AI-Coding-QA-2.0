import type { ProjectMembership } from "@/lib/identity/types";
import {
  formatFieldChange,
  formatImageChange,
  formatTicketSeverity,
  formatTicketSpecialty,
  formatTicketStatus,
} from "@/lib/tickets/formatters";
import type {
  EditTicketInput,
  ReassignTicketInput,
  RejectTicketInput,
  ReopenTicketInput,
  ResolveTicketInput,
  TicketDetailData,
  TicketOperationPermission,
  TicketSeverity,
  TicketSpecialty,
} from "@/lib/tickets/types";

const ticketSeverities: TicketSeverity[] = [
  "minor",
  "normal",
  "serious",
  "urgent",
];

const ticketSpecialties: TicketSpecialty[] = [
  "architecture",
  "structure",
  "plumbing",
];

export function getTicketOperationPermission(
  ticket: Pick<TicketDetailData, "assignee" | "creator" | "project" | "status">,
  currentIdentity: ProjectMembership,
): TicketOperationPermission {
  const sameProject = ticket.project.id === currentIdentity.project.id;
  const isAdmin = currentIdentity.role === "admin" && sameProject;
  const isCreator = ticket.creator.membershipId === currentIdentity.id;
  const isAssignee = ticket.assignee.membershipId === currentIdentity.id;
  const isPending = ticket.status === "pending";
  const isClosed =
    ticket.status === "completed" || ticket.status === "rejected";

  return {
    canEdit: sameProject && isPending && (isCreator || isAssignee || isAdmin),
    canReassign: sameProject && isPending && (isAssignee || isAdmin),
    canReject: sameProject && isPending && (isAssignee || isAdmin),
    canReopen: sameProject && isClosed && (isCreator || isAdmin),
    canResolve: sameProject && isPending && (isAssignee || isAdmin),
  };
}

export function isTicketSeverity(value: string): value is TicketSeverity {
  return ticketSeverities.includes(value as TicketSeverity);
}

export function isTicketSpecialty(value: string): value is TicketSpecialty {
  return ticketSpecialties.includes(value as TicketSpecialty);
}

export function validateResolveInput(input: ResolveTicketInput) {
  return Boolean(input.ticketId && input.rootCause.trim());
}

export function validateRejectInput(input: RejectTicketInput) {
  return Boolean(input.ticketId && input.reason.trim());
}

export function validateEditInput(input: EditTicketInput) {
  return Boolean(
    input.ticketId &&
      input.summary.trim() &&
      input.locationDetail.trim() &&
      isTicketSeverity(input.severity) &&
      isTicketSpecialty(input.specialty),
  );
}

export function validateReassignInput(input: ReassignTicketInput) {
  return Boolean(
    input.ticketId && input.assigneeMembershipId && input.reason.trim(),
  );
}

export function validateReopenInput(input: ReopenTicketInput) {
  return Boolean(input.ticketId && input.reason.trim());
}

export function buildResolvedActivityContent() {
  return "状态由“待处理”变为“已完成”。";
}

export function buildRejectedActivityContent() {
  return "状态由“待处理”变为“已拒绝”。";
}

export function buildReopenedActivityContent(previousStatus: string) {
  return `状态由“${formatTicketStatus(
    previousStatus === "completed" ? "completed" : "rejected",
  )}”恢复为“待处理”，当前责任人保持不变。`;
}

export function buildReassignedActivityContent(
  previousAssigneeName: string,
  nextAssigneeName: string,
) {
  return `当前责任人由“${previousAssigneeName}”变为“${nextAssigneeName}”。`;
}

export function buildEditedActivityContent(
  previousTicket: Pick<
    TicketDetailData,
    | "description"
    | "imageUrls"
    | "locationDetail"
    | "severity"
    | "specialty"
    | "summary"
  >,
  input: EditTicketInput,
) {
  const changes = [
    formatFieldChange(
      "严重程度",
      formatTicketSeverity(previousTicket.severity),
      formatTicketSeverity(input.severity),
    ),
    formatFieldChange(
      "专业类型",
      formatTicketSpecialty(previousTicket.specialty),
      formatTicketSpecialty(input.specialty),
    ),
    formatFieldChange("问题描述", previousTicket.summary, input.summary),
    formatFieldChange(
      "详细位置",
      previousTicket.locationDetail,
      input.locationDetail,
    ),
    formatFieldChange(
      "问题详情",
      previousTicket.description ?? "",
      input.description,
    ),
    formatImageChange(previousTicket.imageUrls.length, input.imageUrls.length),
  ].filter((change): change is string => Boolean(change));

  return changes.length > 0
    ? changes.join("；")
    : "保存了问题信息，内容无变化。";
}
