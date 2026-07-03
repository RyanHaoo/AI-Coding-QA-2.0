"use client";

import { useState } from "react";
import { Edit3, RotateCcw, Send, ShieldX, UserRoundCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TicketEditForm } from "@/components/tickets/ticket-edit-form";
import { TicketReassignForm } from "@/components/tickets/ticket-reassign-form";
import { TicketRejectForm } from "@/components/tickets/ticket-reject-form";
import { TicketReopenForm } from "@/components/tickets/ticket-reopen-form";
import { TicketResolveForm } from "@/components/tickets/ticket-resolve-form";
import type { ProjectMembership } from "@/lib/identity/types";
import { getTicketOperationPermission } from "@/lib/tickets/operations";
import type {
  TicketAssigneeCandidate,
  TicketDetailData,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

type OperationKind = "edit" | "reassign" | "reject" | "reopen" | "resolve";

type TicketOperationPanelProps = {
  candidates: TicketAssigneeCandidate[];
  currentIdentity: ProjectMembership;
  ticket: TicketDetailData;
};

const operationMeta: Record<
  OperationKind,
  { icon: typeof Edit3; label: string }
> = {
  edit: { icon: Edit3, label: "编辑" },
  reassign: { icon: UserRoundCog, label: "指派他人" },
  reject: { icon: ShieldX, label: "拒绝" },
  reopen: { icon: RotateCcw, label: "重新打开" },
  resolve: { icon: Send, label: "解决" },
};

export function TicketOperationPanel({
  candidates,
  currentIdentity,
  ticket,
}: TicketOperationPanelProps) {
  const permission = getTicketOperationPermission(ticket, currentIdentity);
  const operations: OperationKind[] = [
    permission.canEdit ? "edit" : null,
    permission.canResolve ? "resolve" : null,
    permission.canReject ? "reject" : null,
    permission.canReassign ? "reassign" : null,
    permission.canReopen ? "reopen" : null,
  ].filter((item): item is OperationKind => Boolean(item));
  const [activeOperation, setActiveOperation] = useState<OperationKind | null>(
    operations[0] ?? null,
  );
  const visibleOperation =
    activeOperation && operations.includes(activeOperation)
      ? activeOperation
      : null;

  if (operations.length === 0) {
    return (
      <section className="border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-950">可用操作</h3>
        <p className="mt-3 text-slate-500 text-sm leading-6">
          当前身份和工单状态下暂无可执行操作。
        </p>
      </section>
    );
  }

  return (
    <section className="border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-slate-950">可用操作</h3>
        <div className="flex flex-wrap gap-2">
          {operations.map((operation) => {
            const meta = operationMeta[operation];
            const Icon = meta.icon;

            return (
              <Button
                className={cn(
                  "rounded",
                  visibleOperation === operation && "border-[#005ac2]",
                )}
                key={operation}
                onClick={() => setActiveOperation(operation)}
                size="sm"
                type="button"
                variant={visibleOperation === operation ? "outline" : "ghost"}
              >
                <Icon className="size-4" />
                {meta.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-5">
        {visibleOperation === "edit" ? (
          <TicketEditForm
            onCancel={() => setActiveOperation(null)}
            ticket={ticket}
          />
        ) : null}
        {visibleOperation === "resolve" ? (
          <TicketResolveForm ticketId={ticket.id} />
        ) : null}
        {visibleOperation === "reject" ? (
          <TicketRejectForm ticketId={ticket.id} />
        ) : null}
        {visibleOperation === "reassign" ? (
          <TicketReassignForm candidates={candidates} ticketId={ticket.id} />
        ) : null}
        {visibleOperation === "reopen" ? (
          <TicketReopenForm ticketId={ticket.id} />
        ) : null}
      </div>
    </section>
  );
}
