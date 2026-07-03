import type { TicketSort, TicketStatusFilter } from "@/lib/tickets/types";

export type TicketQueryParams = {
  ticketId: string | null;
  ticketSort: TicketSort;
  ticketStatus: TicketStatusFilter;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeTicketStatusFilter(
  value: string | string[] | undefined,
): TicketStatusFilter {
  const rawValue = firstParam(value);

  if (rawValue === "closed" || rawValue === "all") {
    return rawValue;
  }

  return "pending";
}

export function normalizeTicketSort(
  value: string | string[] | undefined,
): TicketSort {
  return firstParam(value) === "oldest" ? "oldest" : "newest";
}

export function normalizeTicketId(value: string | string[] | undefined) {
  const rawValue = firstParam(value)?.trim();
  return rawValue ? rawValue : null;
}

export function parseTicketQueryParams(params?: {
  ticketId?: string | string[];
  ticketSort?: string | string[];
  ticketStatus?: string | string[];
}): TicketQueryParams {
  return {
    ticketId: normalizeTicketId(params?.ticketId),
    ticketSort: normalizeTicketSort(params?.ticketSort),
    ticketStatus: normalizeTicketStatusFilter(params?.ticketStatus),
  };
}

export function buildTicketHref(
  baseView: "tickets" | "admin-tickets",
  options: Partial<TicketQueryParams> = {},
) {
  const params = new URLSearchParams({ view: baseView });

  if (baseView === "tickets") {
    params.set("ticketStatus", options.ticketStatus ?? "pending");
    params.set("ticketSort", options.ticketSort ?? "newest");
  }

  if (options.ticketId) {
    params.set("ticketId", options.ticketId);
  }

  return `/?${params.toString()}`;
}
