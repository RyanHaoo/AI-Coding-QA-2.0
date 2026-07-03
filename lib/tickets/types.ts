import type {
  Project,
  ProjectMembership,
  UserProfile,
} from "@/lib/identity/types";

export type TicketStatus = "pending" | "completed" | "rejected";

export type TicketSeverity = "minor" | "normal" | "serious" | "urgent";

export type TicketSpecialty = "architecture" | "structure" | "plumbing";

export type TicketActivityType =
  | "created"
  | "edited"
  | "resolved"
  | "rejected"
  | "reassigned"
  | "reopened";

export type TicketStatusFilter = "pending" | "closed" | "all";

export type TicketSort = "newest" | "oldest";

export type TicketOperationState = {
  message: string;
  ok: boolean;
};

export type TicketOperationPermission = {
  canEdit: boolean;
  canReassign: boolean;
  canReject: boolean;
  canReopen: boolean;
  canResolve: boolean;
};

export type TicketPerson = {
  membershipId: string;
  profile: UserProfile;
  role: ProjectMembership["role"];
};

export type TicketSummary = {
  assignee: TicketPerson;
  createdAt: string;
  creator: TicketPerson;
  id: string;
  imageUrls: string[];
  locationDetail: string;
  project: Project;
  severity: TicketSeverity;
  specialty: TicketSpecialty;
  status: TicketStatus;
  summary: string;
  ticketNumber: string;
  updatedAt: string;
};

export type TicketActivity = {
  actor: TicketPerson;
  activityType: TicketActivityType;
  content: string;
  createdAt: string;
  id: string;
  reason: string | null;
};

export type TicketDetailData = TicketSummary & {
  activities: TicketActivity[];
  description: string | null;
  preventiveAction: string | null;
  rootCause: string | null;
};

export type TicketDetailResult =
  | { kind: "found"; ticket: TicketDetailData }
  | { kind: "forbidden" }
  | { kind: "not-found" };

export type ResolveTicketInput = {
  preventiveAction: string;
  rootCause: string;
  ticketId: string;
};

export type RejectTicketInput = {
  reason: string;
  ticketId: string;
};

export type EditTicketInput = {
  description: string;
  existingImageUrls: string[];
  imageUrls: string[];
  locationDetail: string;
  severity: TicketSeverity;
  specialty: TicketSpecialty;
  summary: string;
  ticketId: string;
};

export type ReassignTicketInput = {
  assigneeMembershipId: string;
  reason: string;
  ticketId: string;
};

export type ReopenTicketInput = {
  reason: string;
  ticketId: string;
};

export type TicketAssigneeCandidate = {
  membershipId: string;
  profile: UserProfile;
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  completed: "已完成",
  pending: "待处理",
  rejected: "已拒绝",
};

export const ticketSeverityLabels: Record<TicketSeverity, string> = {
  minor: "轻微",
  normal: "一般",
  serious: "严重",
  urgent: "紧急",
};

export const ticketSpecialtyLabels: Record<TicketSpecialty, string> = {
  architecture: "建筑设计专业",
  plumbing: "给排水专业",
  structure: "结构专业",
};

export const ticketActivityTypeLabels: Record<TicketActivityType, string> = {
  created: "创建",
  edited: "编辑",
  reassigned: "指派他人",
  rejected: "拒绝",
  reopened: "重新打开",
  resolved: "解决",
};

export const ticketStatusFilterLabels: Record<TicketStatusFilter, string> = {
  all: "全部",
  closed: "已结束",
  pending: "待处理",
};

export const ticketSortLabels: Record<TicketSort, string> = {
  newest: "最新优先",
  oldest: "最旧优先",
};
