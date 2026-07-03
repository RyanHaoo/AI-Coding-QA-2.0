import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AdminTicketFilters,
  hasActiveAdminFilters,
} from "@/components/tickets/admin-ticket-filters";
import {
  formatTicketDate,
  formatTicketSeverity,
  formatTicketSpecialty,
  formatTicketStatus,
  truncateText,
} from "@/lib/tickets/formatters";
import {
  buildAdminTicketClearFiltersHref,
  buildAdminTicketDetailHref,
} from "@/lib/tickets/query-params";
import type { AdminTicketCollection } from "@/lib/tickets/types";
import {
  adminTicketSeverityFilterLabels,
  adminTicketSpecialtyFilterLabels,
  adminTicketStatusFilterLabels,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type AdminTicketTableProps = {
  collection: AdminTicketCollection;
};

export function AdminTicketTable({ collection }: AdminTicketTableProps) {
  const activeFilters = hasActiveAdminFilters(collection.filters);

  return (
    <section className="grid gap-4">
      <AdminTicketFilters filters={collection.filters} />

      <div className="flex flex-col gap-3 border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">当前项目工单</h2>
          <p className="mt-1 text-slate-500 text-sm">
            共 {collection.totalBeforeFilter} 张，当前显示{" "}
            {collection.tickets.length} 张。
          </p>
        </div>
        {activeFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            <ActiveFilterBadges collection={collection} />
            <Button asChild size="sm" variant="outline">
              <Link href={buildAdminTicketClearFiltersHref()}>清空筛选</Link>
            </Button>
          </div>
        ) : (
          <Badge variant="secondary" className="rounded-md">
            全部范围
          </Badge>
        )}
      </div>

      {collection.error ? (
        <AdminEmptyState description={collection.error} title="工单读取失败" />
      ) : collection.totalBeforeFilter === 0 ? (
        <AdminEmptyState description="当前项目暂无工单。" title="暂无工单" />
      ) : collection.tickets.length === 0 ? (
        <AdminEmptyState
          actionHref={buildAdminTicketClearFiltersHref()}
          actionLabel="清空筛选"
          description="当前筛选无匹配工单。"
          title="无匹配结果"
        />
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead className="border-slate-200 border-b bg-slate-50 text-slate-500">
              <tr>
                <TableHead>工单编号</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>严重程度</TableHead>
                <TableHead>专业类型</TableHead>
                <TableHead>问题摘要</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>当前责任人</TableHead>
                <TableHead>发起人</TableHead>
                <TableHead>详情</TableHead>
              </tr>
            </thead>
            <tbody>
              {collection.tickets.map((ticket) => {
                const detailHref = buildAdminTicketDetailHref(
                  ticket.id,
                  collection.filters,
                );

                return (
                  <tr
                    className={cn(
                      "border-slate-100 border-b transition-colors hover:bg-slate-50",
                      ticket.severity === "urgent" && "bg-red-50/70",
                    )}
                    key={ticket.id}
                  >
                    <TableCell>
                      <Link
                        className="font-semibold text-[#005ac2] hover:underline"
                        href={detailHref}
                      >
                        #{ticket.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          ticket.severity === "urgent"
                            ? "text-red-700"
                            : "text-slate-700",
                        )}
                      >
                        {ticket.severity === "urgent" ? (
                          <AlertTriangle className="size-3.5" />
                        ) : null}
                        {formatTicketSeverity(ticket.severity)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatTicketSpecialty(ticket.specialty)}
                    </TableCell>
                    <TableCell>
                      <span title={ticket.summary}>
                        {truncateText(ticket.summary, 34)}
                      </span>
                    </TableCell>
                    <TableCell>{formatTicketDate(ticket.createdAt)}</TableCell>
                    <TableCell>{ticket.assignee.profile.fullName}</TableCell>
                    <TableCell>{ticket.creator.profile.fullName}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={detailHref}>
                          查看
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ActiveFilterBadges({
  collection,
}: {
  collection: AdminTicketCollection;
}) {
  const { filters } = collection;
  const items = [
    filters.status !== "all"
      ? adminTicketStatusFilterLabels[filters.status]
      : null,
    filters.severity !== "all"
      ? adminTicketSeverityFilterLabels[filters.severity]
      : null,
    filters.specialty !== "all"
      ? adminTicketSpecialtyFilterLabels[filters.specialty]
      : null,
    filters.keyword ? `关键词：${filters.keyword}` : null,
    filters.ticketNumber ? `编号：${filters.ticketNumber}` : null,
  ].filter((item): item is string => Boolean(item));

  return items.map((item) => (
    <Badge key={item} variant="secondary" className="rounded-md">
      {item}
    </Badge>
  ));
}

function StatusBadge({
  status,
}: {
  status: AdminTicketCollection["tickets"][number]["status"];
}) {
  return (
    <Badge
      className={cn(
        "rounded",
        status === "pending" && "bg-blue-100 text-blue-700",
        status === "completed" && "bg-emerald-100 text-emerald-700",
        status === "rejected" && "bg-slate-100 text-slate-600",
      )}
      variant="secondary"
    >
      {formatTicketStatus(status)}
    </Badge>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="max-w-64 px-4 py-3 text-slate-700">{children}</td>;
}

function AdminEmptyState({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center border border-slate-200 bg-white p-8 text-center">
      <div>
        <h3 className="font-medium text-slate-950">{title}</h3>
        <p className="mt-2 text-slate-500 text-sm">{description}</p>
        {actionHref && actionLabel ? (
          <Button asChild className="mt-4" variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
