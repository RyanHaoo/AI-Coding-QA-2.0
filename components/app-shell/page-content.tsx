import {
  BotMessageSquare,
  ClipboardList,
  LayoutDashboard,
  SearchCheck,
} from "lucide-react";
import type { UIMessage } from "ai";

import { AssistantPage } from "@/components/assistant/assistant-page";
import { Badge } from "@/components/ui/badge";
import { AdminDashboard } from "@/components/tickets/admin-dashboard";
import { AdminTicketTable } from "@/components/tickets/admin-ticket-table";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { TicketDetailState } from "@/components/tickets/ticket-detail-state";
import { TicketList } from "@/components/tickets/ticket-list";
import type { AppView, ProjectMembership } from "@/lib/identity/types";
import type { TicketQueryParams } from "@/lib/tickets/query-params";
import type {
  AdminDashboardMetrics,
  AdminTicketCollection,
  TicketAssigneeCandidate,
  TicketDetailResult,
  TicketSummary,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type PageContentProps = {
  adminDashboard?: {
    error: string | null;
    metrics: AdminDashboardMetrics;
  };
  adminTickets?: AdminTicketCollection;
  assistantBuilders: AssistantBuilderCandidate[];
  assistantMessages: UIMessage[];
  assistantSessionId: string | null;
  currentIdentity: ProjectMembership;
  memberTickets?: TicketCollection;
  reassignCandidates: TicketAssigneeCandidate[];
  ticketDetail?: TicketDetailResult | null;
  ticketQuery: TicketQueryParams;
  view: AppView;
};

type TicketCollection = {
  error: string | null;
  tickets: TicketSummary[];
};

type AssistantBuilderCandidate = {
  department: string;
  fullName: string;
  membershipId: string;
};

const contentByView = {
  "admin-tickets": {
    description: "查看当前项目全部工单、筛选并打开详情。",
    icon: SearchCheck,
    label: "管理员工单中心",
    title: "工单中心",
  },
  assistant: {
    description: "对话查单、整理建单草稿并创建当前项目待处理工单。",
    icon: BotMessageSquare,
    label: "默认入口",
    title: "智能助手",
  },
  dashboard: {
    description: "查看当前项目态势指标和紧急工单概览。",
    icon: LayoutDashboard,
    label: "管理员视图",
    title: "数据大盘",
  },
  tickets: {
    description: "查看当前身份相关工单和只读详情。",
    icon: ClipboardList,
    label: "工单视图",
    title: "工单列表",
  },
} as const;

export function PageContent({
  adminDashboard,
  adminTickets,
  assistantBuilders,
  assistantMessages,
  assistantSessionId,
  currentIdentity,
  memberTickets,
  reassignCandidates,
  ticketDetail,
  ticketQuery,
  view,
}: PageContentProps) {
  const content = contentByView[view];
  const Icon = content.icon;
  const ticketBaseView = view === "admin-tickets" ? "admin-tickets" : "tickets";

  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-x-hidden",
        view === "assistant" ? "min-h-0 flex-1" : "",
      )}
    >
      <header className="flex shrink-0 flex-col gap-3 border-slate-200 border-b pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {content.label}
          </Badge>
          <span className="text-slate-400 text-xs">
            {currentIdentity.project.name}
          </span>
        </div>
        <h1 className="font-semibold text-2xl text-slate-950">
          {content.title}
        </h1>
      </header>

      {view === "assistant" && assistantSessionId ? (
        <AssistantPage
          builders={assistantBuilders}
          initialMessages={assistantMessages}
          sessionId={assistantSessionId}
        />
      ) : ticketDetail?.kind === "found" ? (
        <TicketDetail
          adminFilters={ticketQuery.adminFilters}
          baseView={ticketBaseView}
          currentIdentity={currentIdentity}
          reassignCandidates={reassignCandidates}
          sort={ticketQuery.ticketSort}
          status={ticketQuery.ticketStatus}
          ticket={ticketDetail.ticket}
        />
      ) : ticketDetail?.kind === "forbidden" ||
        ticketDetail?.kind === "not-found" ? (
        <TicketDetailState
          adminFilters={ticketQuery.adminFilters}
          baseView={ticketBaseView}
          kind={ticketDetail.kind}
        />
      ) : view === "tickets" ? (
        <TicketList
          error={memberTickets?.error ?? null}
          sort={ticketQuery.ticketSort}
          status={ticketQuery.ticketStatus}
          tickets={memberTickets?.tickets ?? []}
        />
      ) : view === "admin-tickets" ? (
        <AdminTicketTable
          collection={
            adminTickets ?? {
              error: null,
              filters: ticketQuery.adminFilters,
              tickets: [],
              totalBeforeFilter: 0,
            }
          }
        />
      ) : view === "dashboard" && adminDashboard ? (
        <AdminDashboard
          currentIdentity={currentIdentity}
          error={adminDashboard.error}
          metrics={adminDashboard.metrics}
        />
      ) : (
        <section className="grid min-h-[360px] place-items-center border border-slate-100 bg-white p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex size-12 items-center justify-center bg-[#eff6ff] text-[#005ac2]">
              <Icon className="size-6" />
            </div>
            <h2 className="font-medium text-lg text-slate-900">
              {content.title}
            </h2>
            <p className="mt-2 text-slate-500 text-sm leading-6">
              {content.description}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
