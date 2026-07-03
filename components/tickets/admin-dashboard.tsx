import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleSlash,
  ClipboardList,
  Clock3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectTypeLabels } from "@/lib/identity/navigation";
import type { ProjectMembership } from "@/lib/identity/types";
import {
  formatTicketDate,
  formatTicketSeverity,
  formatTicketStatus,
  truncateText,
} from "@/lib/tickets/formatters";
import {
  buildAdminTicketDetailHref,
  buildAdminTicketsHref,
} from "@/lib/tickets/query-params";
import type {
  AdminDashboardMetrics,
  TicketSeverity,
  TicketStatus,
} from "@/lib/tickets/types";
import { ticketSeverityLabels, ticketStatusLabels } from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  currentIdentity: ProjectMembership;
  error: string | null;
  metrics: AdminDashboardMetrics;
};

const metricCards = [
  {
    accent: "text-slate-700",
    getHref: () => buildAdminTicketsHref(),
    icon: ClipboardList,
    key: "totalTickets",
    label: "工单总数",
  },
  {
    accent: "text-blue-700",
    getHref: () => buildAdminTicketsHref({ status: "pending" }),
    icon: Clock3,
    key: "pendingTickets",
    label: "待处理",
  },
  {
    accent: "text-emerald-700",
    getHref: () => buildAdminTicketsHref({ status: "completed" }),
    icon: CheckCircle2,
    key: "completedTickets",
    label: "已完成",
  },
  {
    accent: "text-slate-600",
    getHref: () => buildAdminTicketsHref({ status: "rejected" }),
    icon: CircleSlash,
    key: "rejectedTickets",
    label: "已拒绝",
  },
  {
    accent: "text-red-700",
    getHref: () => buildAdminTicketsHref({ severity: "urgent" }),
    icon: AlertTriangle,
    key: "urgentTickets",
    label: "紧急",
  },
] as const;

const statusOrder: TicketStatus[] = ["pending", "completed", "rejected"];
const severityOrder: TicketSeverity[] = [
  "minor",
  "normal",
  "serious",
  "urgent",
];

export function AdminDashboard({
  currentIdentity,
  error,
  metrics,
}: AdminDashboardProps) {
  const { project } = currentIdentity;

  return (
    <section className="grid gap-5">
      {error ? (
        <div className="border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          统计读取失败：{error}
        </div>
      ) : null}

      <div className="border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950 text-xl">
              {project.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-slate-500 text-sm">
              <Badge variant="secondary" className="rounded-md">
                {project.city}
              </Badge>
              <Badge variant="secondary" className="rounded-md">
                {projectTypeLabels[project.projectType]}
              </Badge>
              <span>客户：{project.clientName}</span>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={buildAdminTicketsHref()}>
              <ClipboardList className="size-4" />
              查看全部工单
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((item) => {
          const Icon = item.icon;
          const value = metrics[item.key];

          return (
            <Link
              className="group grid min-h-32 gap-4 border border-slate-200 bg-white p-4 transition-colors hover:border-[#005ac2]"
              href={item.getHref()}
              key={item.key}
            >
              <div className="flex items-center justify-between">
                <Icon className={cn("size-5", item.accent)} />
                <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#005ac2]" />
              </div>
              <div>
                <div className={cn("font-semibold text-3xl", item.accent)}>
                  {value}
                </div>
                <div className="mt-1 text-slate-500 text-sm">{item.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DistributionPanel
          items={statusOrder.map((status) => ({
            href: buildAdminTicketsHref({ status }),
            label: ticketStatusLabels[status],
            value: metrics.statusCounts[status],
          }))}
          title="状态概览"
          total={metrics.totalTickets}
        />
        <DistributionPanel
          items={severityOrder.map((severity) => ({
            href: buildAdminTicketsHref({ severity }),
            label: ticketSeverityLabels[severity],
            value: metrics.severityCounts[severity],
          }))}
          title="严重程度分布"
          total={metrics.totalTickets}
        />
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">重点关注</h2>
            <p className="mt-1 text-slate-500 text-sm">
              优先显示紧急和待处理工单。
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={buildAdminTicketsHref({ severity: "urgent" })}>
              <AlertTriangle className="size-4" />
              查看紧急
            </Link>
          </Button>
        </div>

        {metrics.urgentTickets === 0 ? (
          <div className="mt-5 border border-slate-100 bg-slate-50 p-5 text-slate-500 text-sm">
            当前无紧急工单。
          </div>
        ) : null}

        {metrics.focusTickets.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {metrics.focusTickets.map((ticket) => (
              <Link
                className={cn(
                  "grid gap-2 border p-4 transition-colors hover:border-[#005ac2]",
                  ticket.severity === "urgent"
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
                href={buildAdminTicketDetailHref(ticket.id)}
                key={ticket.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-950 text-sm">
                    #{ticket.ticketNumber}
                  </span>
                  <Badge variant="secondary" className="rounded-md">
                    {formatTicketStatus(ticket.status)}
                  </Badge>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      ticket.severity === "urgent"
                        ? "text-red-700"
                        : "text-slate-600",
                    )}
                  >
                    {formatTicketSeverity(ticket.severity)}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatTicketDate(ticket.createdAt)}
                  </span>
                </div>
                <p className="text-slate-700 text-sm">
                  {truncateText(ticket.summary, 64)}
                </p>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DistributionPanel({
  items,
  title,
  total,
}: {
  items: Array<{ href: string; label: string; value: number }>;
  title: string;
  total: number;
}) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const percent =
            total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <Link className="grid gap-2" href={item.href} key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium text-slate-950">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden bg-slate-100">
                <div
                  className="h-full bg-[#005ac2]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
