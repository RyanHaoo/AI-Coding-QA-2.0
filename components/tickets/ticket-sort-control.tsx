import Link from "next/link";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";

import { cn } from "@/lib/utils";
import { buildTicketHref } from "@/lib/tickets/query-params";
import {
  ticketSortLabels,
  type TicketSort,
  type TicketStatusFilter,
} from "@/lib/tickets/types";

type TicketSortControlProps = {
  current: TicketSort;
  status: TicketStatusFilter;
};

const sorts: Array<{ icon: typeof ArrowDownWideNarrow; value: TicketSort }> = [
  { icon: ArrowDownWideNarrow, value: "newest" },
  { icon: ArrowUpWideNarrow, value: "oldest" },
];

export function TicketSortControl({ current, status }: TicketSortControlProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded border border-slate-200 bg-white p-1">
      {sorts.map(({ icon: Icon, value }) => (
        <Link
          className={cn(
            "inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors",
            current === value
              ? "bg-slate-900 font-medium text-white"
              : "text-slate-600 hover:bg-slate-100",
          )}
          href={buildTicketHref("tickets", {
            ticketSort: value,
            ticketStatus: status,
          })}
          key={value}
        >
          <Icon className="size-4" />
          {ticketSortLabels[value]}
        </Link>
      ))}
    </div>
  );
}
