import Link from "next/link";
import { ImageIcon, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatTicketDate,
  formatTicketSeverity,
  formatTicketSpecialty,
  formatTicketStatus,
  truncateText,
} from "@/lib/tickets/formatters";
import { buildTicketHref } from "@/lib/tickets/query-params";
import type {
  TicketSort,
  TicketStatusFilter,
  TicketSummary,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type TicketListItemProps = {
  baseView?: "tickets" | "admin-tickets";
  showCreator?: boolean;
  sort?: TicketSort;
  status?: TicketStatusFilter;
  ticket: TicketSummary;
};

export function TicketListItem({
  baseView = "tickets",
  showCreator = false,
  sort = "newest",
  status = "pending",
  ticket,
}: TicketListItemProps) {
  const urgent = ticket.severity === "urgent";

  return (
    <Link
      className={cn(
        "grid gap-3 border bg-white p-4 transition-colors hover:border-[#005ac2]",
        urgent ? "border-red-200 bg-red-50/70" : "border-slate-200",
      )}
      href={buildTicketHref(baseView, {
        ticketId: ticket.id,
        ticketSort: sort,
        ticketStatus: status,
      })}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-950 text-sm">
          #{ticket.ticketNumber}
        </span>
        <Badge
          className={cn(
            "rounded",
            ticket.status === "pending" && "bg-blue-100 text-blue-700",
            ticket.status === "completed" && "bg-emerald-100 text-emerald-700",
            ticket.status === "rejected" && "bg-slate-100 text-slate-600",
          )}
          variant="secondary"
        >
          {formatTicketStatus(ticket.status)}
        </Badge>
        <span
          className={cn(
            "text-xs font-medium",
            urgent ? "text-red-700" : "text-slate-600",
          )}
        >
          {formatTicketSeverity(ticket.severity)}
        </span>
      </div>

      <div className="grid gap-1">
        <h3 className="font-medium text-slate-950 text-sm leading-6">
          {ticket.summary}
        </h3>
        <p className="flex items-center gap-1 text-slate-500 text-xs">
          <MapPin className="size-3.5" />
          {ticket.locationDetail}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-500 text-xs">
        <span>{formatTicketDate(ticket.createdAt)}</span>
        <span>{formatTicketSpecialty(ticket.specialty)}</span>
        <span>责任人：{ticket.assignee.profile.fullName}</span>
        {showCreator ? (
          <span>发起人：{ticket.creator.profile.fullName}</span>
        ) : null}
        {ticket.imageUrls.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[#005ac2]">
            <ImageIcon className="size-3.5" />
            现场图片 {ticket.imageUrls.length}
          </span>
        ) : null}
      </div>

      <p className="text-slate-500 text-xs">
        {truncateText(ticket.summary, 36)}
      </p>
    </Link>
  );
}
