import {
  ticketActivityTypeLabels,
  ticketSeverityLabels,
  ticketSpecialtyLabels,
  ticketStatusLabels,
  type TicketActivityType,
  type TicketSeverity,
  type TicketSpecialty,
  type TicketStatus,
} from "@/lib/tickets/types";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatTicketDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTicketDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatTicketStatus(value: TicketStatus) {
  return ticketStatusLabels[value];
}

export function formatTicketSeverity(value: TicketSeverity) {
  return ticketSeverityLabels[value];
}

export function formatTicketSpecialty(value: TicketSpecialty) {
  return ticketSpecialtyLabels[value];
}

export function formatTicketActivityType(value: TicketActivityType) {
  return ticketActivityTypeLabels[value];
}

export function truncateText(value: string, maxLength = 48) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function formatFieldChange(
  label: string,
  before: string,
  after: string,
) {
  if (before === after) {
    return null;
  }

  return `${label}由“${before || "未填写"}”改为“${after || "未填写"}”`;
}

export function formatImageChange(beforeCount: number, afterCount: number) {
  if (beforeCount === afterCount) {
    return null;
  }

  return `现场图片由 ${beforeCount} 张调整为 ${afterCount} 张`;
}

export function formatOperationError(
  kind: "expired" | "forbidden" | "missing",
) {
  if (kind === "expired") {
    return "工单状态或责任人已变化，请刷新或返回详情查看最新状态。";
  }

  if (kind === "forbidden") {
    return "当前身份无权执行该操作。";
  }

  return "请补全必填信息后再提交。";
}
