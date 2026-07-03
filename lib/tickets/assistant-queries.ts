import type { ProjectMembership } from "@/lib/identity/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildTicketHref } from "@/lib/tickets/query-params";
import { getAdminTickets, getMemberTickets } from "@/lib/tickets/queries";
import type { TicketStatusFilter, TicketSummary } from "@/lib/tickets/types";

type BuilderCandidateRow = {
  id: string;
  profile:
    | {
        department: string;
        full_name: string;
        id: string;
      }
    | Array<{
        department: string;
        full_name: string;
        id: string;
      }>
    | null;
};

function parseStatus(
  query: string,
  explicitStatus?: string,
): TicketStatusFilter {
  const value = `${query} ${explicitStatus ?? ""}`;

  if (/(全部|所有|all)/i.test(value)) {
    return "all";
  }

  if (
    /(已完成|完成|已拒绝|拒绝|关闭|结束|closed|completed|rejected)/i.test(value)
  ) {
    return "closed";
  }

  return "pending";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function scoreTicket(ticket: TicketSummary, query: string) {
  const normalizedQuery = normalize(query);
  if (
    !normalizedQuery ||
    /(我的|工单|待处理|查询|查一下|查找)/.test(normalizedQuery)
  ) {
    return 1;
  }

  const haystack = [
    ticket.ticketNumber,
    ticket.summary,
    ticket.locationDetail,
    ticket.assignee.profile.fullName,
    ticket.creator.profile.fullName,
  ]
    .join(" ")
    .toLowerCase();

  const compactTicketNumber = ticket.ticketNumber.replace(/\D/g, "");
  const compactQuery = normalizedQuery.replace(/\D/g, "");

  let score = 0;
  if (compactQuery && compactTicketNumber.includes(compactQuery)) {
    score += 8;
  }
  if (haystack.includes(normalizedQuery)) {
    score += 6;
  }
  for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
    if (haystack.includes(token)) {
      score += 2;
    }
  }

  return score;
}

export async function searchVisibleTickets(input: {
  currentIdentity: ProjectMembership;
  query: string;
  status?: string;
}) {
  const status = parseStatus(input.query, input.status);
  const collection =
    input.currentIdentity.role === "admin"
      ? await getAdminTickets(input.currentIdentity)
      : await getMemberTickets(input.currentIdentity, status, "newest");

  if (collection.error) {
    return { error: collection.error, tickets: [] };
  }

  const tickets = collection.tickets
    .filter(
      (ticket) => status === "all" || scoreTicket(ticket, input.query) > 0,
    )
    .map((ticket) => ({
      score: scoreTicket(ticket, input.query),
      ticket,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (
        new Date(right.ticket.createdAt).getTime() -
        new Date(left.ticket.createdAt).getTime()
      );
    })
    .slice(0, 8)
    .map(({ ticket }) => ({
      assigneeName: ticket.assignee.profile.fullName,
      detailHref: buildTicketHref(
        input.currentIdentity.role === "admin" ? "admin-tickets" : "tickets",
        {
          ticketId: ticket.id,
          ticketSort: "newest",
          ticketStatus: status,
        },
      ),
      locationDetail: ticket.locationDetail,
      severity: ticket.severity,
      status: ticket.status,
      summary: ticket.summary,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
    }));

  return { error: null, tickets };
}

export async function listProjectBuilders(currentIdentity: ProjectMembership) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("project_memberships")
    .select(`
      id,
      profile:app_users(
        id,
        full_name,
        department
      )
    `)
    .eq("project_id", currentIdentity.project.id)
    .eq("role", "builder")
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return ((data ?? []) as unknown as BuilderCandidateRow[]).flatMap((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;

    if (!profile) {
      return [];
    }

    return [
      {
        department: profile.department,
        fullName: profile.full_name,
        membershipId: row.id,
      },
    ];
  });
}
