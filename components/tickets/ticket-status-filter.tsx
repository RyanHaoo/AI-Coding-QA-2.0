import Link from "next/link";

import { cn } from "@/lib/utils";
import { buildTicketHref } from "@/lib/tickets/query-params";
import {
  ticketStatusFilterLabels,
  type TicketSort,
  type TicketStatusFilter as TicketStatusFilterValue,
} from "@/lib/tickets/types";

type TicketStatusFilterProps = {
  current: TicketStatusFilterValue;
  sort: TicketSort;
};

const filters: TicketStatusFilterValue[] = ["pending", "closed", "all"];

export function TicketStatusFilter({ current, sort }: TicketStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded border border-slate-200 bg-white p-1">
      {filters.map((filter) => (
        <Link
          className={cn(
            "min-w-16 rounded px-3 py-1.5 text-center text-sm transition-colors",
            current === filter
              ? "bg-[#005ac2] font-medium text-white"
              : "text-slate-600 hover:bg-slate-100",
          )}
          href={buildTicketHref("tickets", {
            ticketSort: sort,
            ticketStatus: filter,
          })}
          key={filter}
        >
          {ticketStatusFilterLabels[filter]}
        </Link>
      ))}
    </div>
  );
}
