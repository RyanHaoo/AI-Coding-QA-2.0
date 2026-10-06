import {
  formatTicketSeverity,
  formatTicketStatus,
} from "@/lib/tickets/formatters";
import type { TicketSummary } from "@/lib/tickets/types";

type ShareSummaryTicket = Pick<
  TicketSummary,
  | "ticketNumber"
  | "project"
  | "locationDetail"
  | "summary"
  | "severity"
  | "status"
  | "assignee"
>;

export function formatTicketShareSummary(ticket: ShareSummaryTicket) {
  return [
    `【施工质检工单】#${ticket.ticketNumber}`,
    `项目：${ticket.project.name}`,
    `位置：${ticket.locationDetail}`,
    `问题：${ticket.summary}`,
    `严重程度：${formatTicketSeverity(ticket.severity)}｜状态：${formatTicketStatus(ticket.status)}`,
    `责任人：${ticket.assignee.profile.fullName}`,
  ].join("\n");
}
