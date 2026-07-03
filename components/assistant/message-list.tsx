"use client";

import Image from "next/image";
import Link from "next/link";
import { isToolUIPart, type UIMessage } from "ai";

import { TicketDraftCard } from "@/components/assistant/ticket-draft-card";
import { TicketResultList } from "@/components/assistant/ticket-result-list";
import type { TicketDraft } from "@/lib/assistant/types";
import type { AssistantTicketResult } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";

type BuilderCandidate = {
  department: string;
  fullName: string;
  membershipId: string;
};

export function MessageList({
  builders,
  messages,
  onConfirmDraft,
}: {
  builders: BuilderCandidate[];
  messages: UIMessage[];
  onConfirmDraft: (draft: TicketDraft) => void;
}) {
  return (
    <div className="grid gap-5">
      {messages.map((message) => (
        <article
          className={cn(
            "flex",
            message.role === "user" ? "justify-end" : "justify-start",
          )}
          key={message.id}
        >
          <div
            className={cn(
              "grid min-w-0 max-w-[min(100%,42rem)] gap-3 overflow-hidden",
              message.role === "user"
                ? "max-w-[85%] rounded-lg bg-[#005ac2] px-4 py-3 text-white"
                : "text-slate-900",
            )}
          >
            {message.parts.map((part, index) => (
              <MessagePart
                builders={builders}
                key={`${message.id}-${index}`}
                onConfirmDraft={onConfirmDraft}
                part={part}
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function MessagePart({
  builders,
  onConfirmDraft,
  part,
}: {
  builders: BuilderCandidate[];
  onConfirmDraft: (draft: TicketDraft) => void;
  part: UIMessage["parts"][number];
}) {
  if (part.type === "text") {
    const createdTicket = parseCreatedTicketFromText(part.text);

    if (createdTicket) {
      return (
        <TicketResultList message="工单已创建成功" tickets={[createdTicket]} />
      );
    }

    const parsedTickets = parseTicketResultsFromText(part.text);

    if (parsedTickets.length > 0) {
      return <TicketResultList tickets={parsedTickets} />;
    }

    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-6">
        {part.text}
      </p>
    );
  }

  if (part.type === "file" && part.mediaType?.startsWith("image/")) {
    return (
      <Image
        alt={part.filename ?? "现场图片"}
        className="max-h-64 rounded-md border border-white/30 object-cover"
        height={320}
        src={part.url}
        unoptimized={part.url.startsWith("http")}
        width={480}
      />
    );
  }

  if (!isToolUIPart(part)) {
    return null;
  }

  if (getToolPartName(part) === "create_ticket_from_confirmed_draft") {
    if (part.state === "approval-requested") {
      return (
        <TicketDraftCard
          builders={builders}
          draft={normalizeDraftInput(part.input)}
          onConfirm={onConfirmDraft}
        />
      );
    }

    if (part.state === "approval-responded") {
      return (
        <TicketDraftCard
          builders={builders}
          draft={normalizeDraftInput(part.input)}
          onConfirm={onConfirmDraft}
          readOnly
        />
      );
    }

    if (part.state === "output-available") {
      return (
        <>
          <TicketDraftCard
            builders={builders}
            draft={normalizeDraftInput(part.input)}
            onConfirm={onConfirmDraft}
            readOnly
          />
          <ToolOutput output={part.output} />
        </>
      );
    }

    if (part.state === "output-error") {
      return (
        <>
          <TicketDraftCard
            builders={builders}
            draft={normalizeDraftInput(part.input)}
            onConfirm={onConfirmDraft}
            readOnly
          />
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {part.errorText}
          </div>
        </>
      );
    }

    return null;
  }

  if (part.state === "output-available") {
    return <ToolOutput output={part.output} />;
  }

  return null;
}

function ToolOutput({ output }: { output: unknown }) {
  const result = output as {
    detailHref?: string;
    error?: string;
    kind?: string;
    message?: string;
    ticketNumber?: string;
    tickets?: AssistantTicketResult[];
  };

  if (result.kind === "ticket_results") {
    return (
      <TicketResultList
        message={result.message}
        tickets={result.tickets ?? []}
      />
    );
  }

  if (result.kind === "ticket_created") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 text-sm">
        <p className="font-semibold">工单创建成功</p>
        <p className="mt-1">工单编号：#{result.ticketNumber}</p>
        {result.detailHref ? (
          <Link
            className="mt-2 inline-flex font-medium text-emerald-800 hover:underline"
            href={result.detailHref}
          >
            查看详情
          </Link>
        ) : null}
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
        {result.error}
      </div>
    );
  }

  return null;
}

function getToolPartName(part: UIMessage["parts"][number]) {
  if ("toolName" in part && typeof part.toolName === "string") {
    return part.toolName;
  }

  return part.type.startsWith("tool-") ? part.type.slice("tool-".length) : "";
}

function normalizeDraftInput(input: unknown): TicketDraft {
  const draft = isRecord(input) ? input : {};
  const assigneeMembershipId =
    typeof draft.assigneeMembershipId === "string"
      ? draft.assigneeMembershipId
      : null;
  const summary = typeof draft.summary === "string" ? draft.summary : "";
  const locationDetail =
    typeof draft.locationDetail === "string" ? draft.locationDetail : "";
  const missingFields: string[] = [];

  if (!summary.trim()) {
    missingFields.push("问题描述");
  }
  if (!locationDetail.trim()) {
    missingFields.push("详细位置");
  }
  if (!assigneeMembershipId?.trim()) {
    missingFields.push("责任人");
  }

  return {
    assigneeMembershipId,
    description: typeof draft.description === "string" ? draft.description : "",
    imageUrls: Array.isArray(draft.imageUrls)
      ? draft.imageUrls.filter((url): url is string => typeof url === "string")
      : [],
    locationDetail,
    missingFields,
    severity: isDraftSeverity(draft.severity) ? draft.severity : "normal",
    specialty: isDraftSpecialty(draft.specialty)
      ? draft.specialty
      : "architecture",
    summary,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDraftSeverity(value: unknown): value is TicketDraft["severity"] {
  return (
    value === "minor" ||
    value === "normal" ||
    value === "serious" ||
    value === "urgent"
  );
}

function isDraftSpecialty(value: unknown): value is TicketDraft["specialty"] {
  return (
    value === "architecture" || value === "structure" || value === "plumbing"
  );
}

function parseTicketResultsFromText(text: string): AssistantTicketResult[] {
  if (!text.includes("工单编号") || !text.includes("查看详情")) {
    return [];
  }

  const normalized = text.replace(/\*\*/g, "");
  const blocks = normalized
    .split(/\n\s*\d+\.\s*/)
    .map((block) => block.trim())
    .filter((block) => block.includes("工单编号"));

  return blocks.flatMap((block) => {
    const ticketNumber = block.match(/工单编号[:：]\s*([A-Z0-9-]+)/i)?.[1];
    const summary = block.match(/摘要[:：]\s*([^\n]+)/)?.[1]?.trim();
    const locationDetail = block.match(/位置[:：]\s*([^\n]+)/)?.[1]?.trim();
    const assigneeName = block.match(/责任人[:：]\s*([^\n]+)/)?.[1]?.trim();
    const severityText = block.match(/严重程度[:：]\s*([^\n]+)/)?.[1]?.trim();
    const detailHref =
      block.match(/\[查看详情\]\(([^)]+)\)/)?.[1] ??
      block.match(/查看详情\]\(([^)]+)\)/)?.[1] ??
      "";

    if (!ticketNumber || !summary || !locationDetail || !assigneeName) {
      return [];
    }

    const severity = severityText?.includes("紧急")
      ? "urgent"
      : severityText?.includes("严重")
        ? "serious"
        : severityText?.includes("轻微")
          ? "minor"
          : "normal";

    return [
      {
        assigneeName,
        detailHref: detailHref || "/?view=tickets",
        locationDetail,
        severity,
        status: "pending",
        summary,
        ticketId: ticketNumber,
        ticketNumber,
      } satisfies AssistantTicketResult,
    ];
  });
}

function parseCreatedTicketFromText(
  text: string,
): AssistantTicketResult | null {
  if (!text.includes("工单已创建") || !text.includes("工单编号")) {
    return null;
  }

  const normalized = text.replace(/\*\*/g, "");
  const compact = normalized.replace(/\n(?=[^-\n]*[&?=])/g, "");
  const ticketNumber = compact.match(/工单编号[:：]\s*([A-Z0-9-]+)/i)?.[1];
  const detailHref =
    compact.match(/\[查看工单\]\(([\s\S]*?)\)/)?.[1]?.replace(/\s/g, "") ??
    compact.match(/\[查看详情\]\(([\s\S]*?)\)/)?.[1]?.replace(/\s/g, "") ??
    "";
  const assigneeName =
    compact.match(/责任人[:：]\s*([^\n]+)/)?.[1]?.trim() ?? "待分配";
  const summary =
    compact.match(/问题[:：]\s*([^\n]+)/)?.[1]?.trim() ??
    compact.match(/摘要[:：]\s*([^\n]+)/)?.[1]?.trim() ??
    "已创建的质检工单";

  if (!ticketNumber) {
    return null;
  }

  return {
    assigneeName,
    detailHref: detailHref || "/?view=tickets",
    locationDetail: "查看工单详情",
    severity: "normal",
    status: "pending",
    summary,
    ticketId: ticketNumber,
    ticketNumber,
  };
}
