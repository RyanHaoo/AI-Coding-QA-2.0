import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketActivityList } from "@/components/tickets/ticket-activity-list";
import { TicketOperationPanel } from "@/components/tickets/ticket-operation-panel";
import type { ProjectMembership } from "@/lib/identity/types";
import {
  formatTicketDateTime,
  formatTicketSeverity,
  formatTicketSpecialty,
  formatTicketStatus,
} from "@/lib/tickets/formatters";
import { buildTicketHref } from "@/lib/tickets/query-params";
import type {
  TicketDetailData,
  TicketAssigneeCandidate,
  TicketSort,
  TicketStatusFilter,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type TicketDetailProps = {
  baseView: "tickets" | "admin-tickets";
  currentIdentity: ProjectMembership;
  reassignCandidates: TicketAssigneeCandidate[];
  sort?: TicketSort;
  status?: TicketStatusFilter;
  ticket: TicketDetailData;
};

export function TicketDetail({
  baseView,
  currentIdentity,
  reassignCandidates,
  sort = "newest",
  status = "pending",
  ticket,
}: TicketDetailProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-5">
        <div className="border border-slate-200 bg-white p-5">
          <Button asChild size="sm" variant="ghost">
            <Link
              href={buildTicketHref(baseView, {
                ticketSort: sort,
                ticketStatus: status,
              })}
            >
              <ArrowLeft className="size-4" />
              返回列表
            </Link>
          </Button>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-950 text-xl">
                  #{ticket.ticketNumber}
                </h2>
                <Badge
                  className={cn(
                    "rounded",
                    ticket.status === "pending" && "bg-blue-100 text-blue-700",
                    ticket.status === "completed" &&
                      "bg-emerald-100 text-emerald-700",
                    ticket.status === "rejected" &&
                      "bg-slate-100 text-slate-600",
                  )}
                  variant="secondary"
                >
                  {formatTicketStatus(ticket.status)}
                </Badge>
                <span
                  className={cn(
                    "text-sm font-medium",
                    ticket.severity === "urgent"
                      ? "text-red-700"
                      : "text-slate-600",
                  )}
                >
                  {formatTicketSeverity(ticket.severity)}
                </span>
              </div>
              <p className="mt-2 text-slate-500 text-sm">{ticket.summary}</p>
            </div>
          </div>
        </div>

        <InfoSection title="基础信息">
          <InfoGrid
            items={[
              ["创建时间", formatTicketDateTime(ticket.createdAt)],
              ["发起人", ticket.creator.profile.fullName],
              ["所属项目", ticket.project.name],
              ["当前责任人", ticket.assignee.profile.fullName],
            ]}
          />
        </InfoSection>

        <InfoSection title="问题信息">
          <InfoGrid
            items={[
              ["专业类型", formatTicketSpecialty(ticket.specialty)],
              ["详细位置", ticket.locationDetail],
              ["问题描述", ticket.summary],
              ["问题详情", ticket.description ?? "未填写"],
            ]}
          />

          <div className="mt-5">
            <h4 className="mb-3 font-medium text-slate-700 text-sm">
              现场图片
            </h4>
            {ticket.imageUrls.length === 0 ? (
              <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 p-4 text-slate-500 text-sm">
                <ImageIcon className="size-4" />
                暂无图片
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {ticket.imageUrls.map((url) => (
                  <Image
                    alt={`${ticket.ticketNumber} 现场图片`}
                    className="aspect-video w-full border border-slate-200 object-cover"
                    height={360}
                    key={url}
                    src={url}
                    unoptimized={url.startsWith("http")}
                    width={640}
                  />
                ))}
              </div>
            )}
          </div>
        </InfoSection>

        <InfoSection title="处理信息">
          <InfoGrid
            items={[
              ["问题归因", ticket.rootCause ?? "未填写"],
              ["预防建议", ticket.preventiveAction ?? "未填写"],
            ]}
          />
        </InfoSection>

        <TicketOperationPanel
          candidates={reassignCandidates}
          currentIdentity={currentIdentity}
          ticket={ticket}
        />
      </div>

      <aside className="grid content-start gap-3">
        <h3 className="font-semibold text-slate-950">处理记录</h3>
        <TicketActivityList activities={ticket.activities} />
      </aside>
    </section>
  );
}

function InfoSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div className="grid gap-1" key={label}>
          <dt className="text-slate-500 text-xs">{label}</dt>
          <dd className="text-slate-900 text-sm leading-6">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
