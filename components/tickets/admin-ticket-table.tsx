import { TicketListItem } from "@/components/tickets/ticket-list-item";
import type { TicketSummary } from "@/lib/tickets/types";

type AdminTicketTableProps = {
  error: string | null;
  tickets: TicketSummary[];
};

export function AdminTicketTable({ error, tickets }: AdminTicketTableProps) {
  if (error) {
    return <AdminEmptyState description={error} title="工单读取失败" />;
  }

  if (tickets.length === 0) {
    return (
      <AdminEmptyState description="当前项目暂无工单。" title="暂无工单" />
    );
  }

  return (
    <section className="grid gap-3">
      {tickets.map((ticket) => (
        <TicketListItem
          baseView="admin-tickets"
          key={ticket.id}
          showCreator
          ticket={ticket}
        />
      ))}
    </section>
  );
}

function AdminEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center border border-slate-200 bg-white p-8 text-center">
      <div>
        <h3 className="font-medium text-slate-950">{title}</h3>
        <p className="mt-2 text-slate-500 text-sm">{description}</p>
      </div>
    </div>
  );
}
