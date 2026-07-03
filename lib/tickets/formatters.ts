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
