import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatTicketSeverity,
  formatTicketStatus,
} from "@/lib/tickets/formatters";
import type { AssistantTicketResult } from "@/lib/assistant/types";

export function TicketResultList({
  message,
  tickets,
}: {
  message?: string;
  tickets: AssistantTicketResult[];
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600 text-sm">
        {message ?? "没有找到当前身份可访问的工单。"}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {message ? <p className="text-slate-500 text-sm">{message}</p> : null}
      {tickets.map((ticket) => (
        <article
          className="rounded-lg border border-slate-200 bg-white p-4"
          key={ticket.ticketId}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-950">
              #{ticket.ticketNumber}
            </span>
            <Badge className="rounded" variant="secondary">
              {formatTicketStatus(ticket.status)}
            </Badge>
            <span className="font-medium text-[#005ac2] text-xs">
              {formatTicketSeverity(ticket.severity)}
            </span>
          </div>
          <p className="mt-2 text-slate-900 text-sm">{ticket.summary}</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500 text-xs">位置</dt>
              <dd className="mt-1 text-slate-700">{ticket.locationDetail}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs">责任人</dt>
              <dd className="mt-1 text-slate-700">{ticket.assigneeName}</dd>
            </div>
          </dl>
          <Link
            className="mt-3 inline-flex items-center gap-1 font-medium text-[#005ac2] text-sm hover:underline"
            href={ticket.detailHref}
          >
            查看详情
            <ExternalLink className="size-3.5" />
          </Link>
        </article>
      ))}
    </div>
  );
}
