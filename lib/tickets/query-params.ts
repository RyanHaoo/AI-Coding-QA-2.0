import type {
  AdminTicketFilters,
  AdminTicketSeverityFilter,
  AdminTicketSpecialtyFilter,
  AdminTicketStatusFilter,
  TicketSort,
  TicketStatusFilter,
} from "@/lib/tickets/types";

export type TicketQueryParams = {
  adminFilters: AdminTicketFilters;
  ticketId: string | null;
  ticketSort: TicketSort;
  ticketStatus: TicketStatusFilter;
};

export const defaultAdminTicketFilters: AdminTicketFilters = {
  keyword: "",
  severity: "all",
  specialty: "all",
  status: "all",
  ticketNumber: "",
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

export function normalizeAdminStatusFilter(
  value: string | string[] | undefined,
): AdminTicketStatusFilter {
  const rawValue = firstParam(value);

  if (
    rawValue === "pending" ||
    rawValue === "completed" ||
    rawValue === "rejected"
  ) {
    return rawValue;
  }

  return "all";
}

export function normalizeAdminSeverityFilter(
  value: string | string[] | undefined,
): AdminTicketSeverityFilter {
  const rawValue = firstParam(value);

  if (
    rawValue === "minor" ||
    rawValue === "normal" ||
    rawValue === "serious" ||
    rawValue === "urgent"
  ) {
    return rawValue;
  }

  return "all";
}

export function normalizeAdminSpecialtyFilter(
  value: string | string[] | undefined,
): AdminTicketSpecialtyFilter {
  const rawValue = firstParam(value);

  if (
    rawValue === "architecture" ||
    rawValue === "structure" ||
    rawValue === "plumbing"
  ) {
    return rawValue;
  }

  return "all";
}

function normalizeTextFilter(value: string | string[] | undefined) {
  return firstParam(value)?.trim() ?? "";
}

export function parseAdminTicketFilters(params?: {
  adminKeyword?: string | string[];
  adminSeverity?: string | string[];
  adminSpecialty?: string | string[];
  adminStatus?: string | string[];
  adminTicketNumber?: string | string[];
}): AdminTicketFilters {
  return {
    keyword: normalizeTextFilter(params?.adminKeyword),
    severity: normalizeAdminSeverityFilter(params?.adminSeverity),
    specialty: normalizeAdminSpecialtyFilter(params?.adminSpecialty),
    status: normalizeAdminStatusFilter(params?.adminStatus),
    ticketNumber: normalizeTextFilter(params?.adminTicketNumber),
  };
}

export function parseTicketQueryParams(params?: {
  adminKeyword?: string | string[];
  adminSeverity?: string | string[];
  adminSpecialty?: string | string[];
  adminStatus?: string | string[];
  adminTicketNumber?: string | string[];
  ticketId?: string | string[];
  ticketSort?: string | string[];
  ticketStatus?: string | string[];
}): TicketQueryParams {
  return {
    adminFilters: parseAdminTicketFilters(params),
    ticketId: normalizeTicketId(params?.ticketId),
    ticketSort: normalizeTicketSort(params?.ticketSort),
    ticketStatus: normalizeTicketStatusFilter(params?.ticketStatus),
  };
}

function appendAdminFilters(
  params: URLSearchParams,
  filters?: Partial<AdminTicketFilters>,
) {
  const merged = { ...defaultAdminTicketFilters, ...filters };

  if (merged.status !== "all") {
    params.set("adminStatus", merged.status);
  }

  if (merged.severity !== "all") {
    params.set("adminSeverity", merged.severity);
  }

  if (merged.specialty !== "all") {
    params.set("adminSpecialty", merged.specialty);
  }

  if (merged.keyword.trim()) {
    params.set("adminKeyword", merged.keyword.trim());
  }

  if (merged.ticketNumber.trim()) {
    params.set("adminTicketNumber", merged.ticketNumber.trim());
  }
}

export function buildTicketHref(
  baseView: "tickets" | "admin-tickets",
  options: Partial<Omit<TicketQueryParams, "adminFilters">> & {
    adminFilters?: Partial<AdminTicketFilters>;
  } = {},
) {
  const params = new URLSearchParams({ view: baseView });

  if (baseView === "tickets") {
    params.set("ticketStatus", options.ticketStatus ?? "pending");
    params.set("ticketSort", options.ticketSort ?? "newest");
  }

  if (baseView === "admin-tickets") {
    appendAdminFilters(params, options.adminFilters);
  }

  if (options.ticketId) {
    params.set("ticketId", options.ticketId);
  }

  return `/?${params.toString()}`;
}

export function buildAdminTicketsHref(
  filters: Partial<AdminTicketFilters> = {},
) {
  return buildTicketHref("admin-tickets", { adminFilters: filters });
}

export function buildAdminTicketDetailHref(
  ticketId: string,
  filters: Partial<AdminTicketFilters> = {},
) {
  return buildTicketHref("admin-tickets", { adminFilters: filters, ticketId });
}

export function buildAdminTicketClearFiltersHref() {
  return buildTicketHref("admin-tickets");
}
