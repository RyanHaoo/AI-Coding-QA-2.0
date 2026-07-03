import { ClipboardList } from "lucide-react";

import { TicketListItem } from "@/components/tickets/ticket-list-item";
import { TicketSortControl } from "@/components/tickets/ticket-sort-control";
import { TicketStatusFilter } from "@/components/tickets/ticket-status-filter";
import {
  ticketSortLabels,
  ticketStatusFilterLabels,
  type TicketSort,
  type TicketStatusFilter as TicketStatusFilterValue,
  type TicketSummary,
} from "@/lib/tickets/types";

type TicketListProps = {
  error: string | null;
  sort: TicketSort;
  status: TicketStatusFilterValue;
  tickets: TicketSummary[];
};

export function TicketList({ error, sort, status, tickets }: TicketListProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-slate-500 text-sm">
            当前筛选：{ticketStatusFilterLabels[status]} /{" "}
            {ticketSortLabels[sort]}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <TicketStatusFilter current={status} sort={sort} />
          <TicketSortControl current={sort} status={status} />
        </div>
      </div>

      {error ? (
        <EmptyTickets description={error} title="工单读取失败" />
      ) : tickets.length === 0 ? (
        <EmptyTickets
          description="当前身份和筛选条件下暂无工单。"
          title="暂无工单"
        />
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              sort={sort}
              status={status}
              ticket={ticket}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyTickets({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center border border-slate-200 bg-white p-8 text-center">
      <div>
        <div className="mx-auto mb-4 flex size-11 items-center justify-center bg-[#eff6ff] text-[#005ac2]">
          <ClipboardList className="size-5" />
        </div>
        <h3 className="font-medium text-slate-950">{title}</h3>
        <p className="mt-2 text-slate-500 text-sm">{description}</p>
      </div>
    </div>
  );
}
