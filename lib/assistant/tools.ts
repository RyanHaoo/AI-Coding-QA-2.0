import { tool } from "langchain";
import { z } from "zod";

import type {
  AssistantRuntimeContext,
  TicketDraft,
} from "@/lib/assistant/types";
import { createTicketFromAssistantDraft } from "@/lib/tickets/creation";
import {
  listProjectBuilders,
  searchVisibleTickets,
} from "@/lib/tickets/assistant-queries";
import { isTicketSeverity, isTicketSpecialty } from "@/lib/tickets/operations";
import type { TicketSeverity, TicketSpecialty } from "@/lib/tickets/types";

const severitySchema = z
  .enum(["minor", "normal", "serious", "urgent"])
  .default("normal");
const specialtySchema = z
  .enum(["architecture", "structure", "plumbing"])
  .default("architecture");

function normalizeSeverity(value?: string): TicketSeverity {
  return value && isTicketSeverity(value) ? value : "normal";
}

function normalizeSpecialty(value?: string): TicketSpecialty {
  return value && isTicketSpecialty(value) ? value : "architecture";
}

function missingDraftFields(draft: {
  assigneeMembershipId?: string | null;
  locationDetail?: string | null;
  summary?: string | null;
}) {
  const missing: string[] = [];

  if (!draft.summary?.trim()) {
    missing.push("问题描述");
  }
  if (!draft.locationDetail?.trim()) {
    missing.push("详细位置");
  }
  if (!draft.assigneeMembershipId?.trim()) {
    missing.push("责任人");
  }

  return missing;
}

export function createAssistantTools(context: AssistantRuntimeContext) {
  return [
    tool(
      async ({ query, status }) => {
        const result = await searchVisibleTickets({
          currentIdentity: context.currentIdentity,
          query,
          status,
        });

        return {
          kind: "ticket_results",
          message:
            result.tickets.length > 0
              ? `找到 ${result.tickets.length} 条有权访问的工单。`
              : "没有找到当前身份可访问的工单。",
          tickets: result.tickets,
        };
      },
      {
        description:
          "按工单编号、关键词、位置、状态或“我的工单”查询当前项目当前身份有权访问的工单。",
        name: "search_visible_tickets",
        schema: z.object({
          query: z.string().describe("用户的查单表达"),
          status: z
            .enum(["pending", "closed", "all"])
            .optional()
            .describe("可选状态过滤"),
        }),
      },
    ),
    tool(
      async () => ({
        builders: await listProjectBuilders(context.currentIdentity),
        kind: "builder_candidates",
      }),
      {
        description: "列出当前项目可作为责任人的施工方候选。",
        name: "list_project_builders",
        schema: z.object({}),
      },
    ),
    tool(
      async (input) => {
        const draft: TicketDraft = {
          assigneeMembershipId: input.assigneeMembershipId?.trim() || null,
          description: input.description?.trim() ?? "",
          imageUrls: (input.imageUrls ?? []).filter((url) =>
            context.uploadedImageUrls.includes(url),
          ),
          locationDetail: input.locationDetail?.trim() ?? "",
          missingFields: [],
          severity: normalizeSeverity(input.severity),
          specialty: normalizeSpecialty(input.specialty),
          summary: input.summary?.trim() ?? "",
        };
        draft.missingFields = missingDraftFields(draft);

        return {
          draft,
          kind: "ticket_draft",
          message:
            draft.missingFields.length > 0
              ? `草稿还缺少：${draft.missingFields.join("、")}。`
              : "已整理建单草稿，请用户确认或调整后再创建。",
        };
      },
      {
        description:
          "基于同一轮文字和图片多模态输入整理待确认工单草稿。缺少问题描述、详细位置或责任人时必须返回缺失字段。",
        name: "prepare_ticket_draft",
        schema: z.object({
          assigneeMembershipId: z.string().optional(),
          description: z.string().optional(),
          imageUrls: z.array(z.string()).optional(),
          locationDetail: z.string().optional(),
          severity: severitySchema.optional(),
          specialty: specialtySchema.optional(),
          summary: z.string().optional(),
        }),
      },
    ),
    tool(
      async (input) => {
        if (context.currentIdentity.role === "builder") {
          return {
            error: "施工方不能发起工单。请联系质检员或管理员创建。",
            kind: "ticket_create_denied",
          };
        }

        const assigneeMembershipId = input.assigneeMembershipId?.trim() ?? "";
        const locationDetail = input.locationDetail?.trim() ?? "";
        const summary = input.summary?.trim() ?? "";
        const missing = missingDraftFields({
          assigneeMembershipId,
          locationDetail,
          summary,
        });
        if (missing.length > 0) {
          return {
            error: `请先补全：${missing.join("、")}。`,
            kind: "ticket_create_denied",
            missingFields: missing,
          };
        }

        const imageUrls = (input.imageUrls ?? []).filter((url) =>
          context.uploadedImageUrls.includes(url),
        );
        const result = await createTicketFromAssistantDraft(
          {
            assigneeMembershipId,
            description: input.description ?? "",
            imageUrls,
            locationDetail,
            severity: normalizeSeverity(input.severity),
            specialty: normalizeSpecialty(input.specialty),
            summary,
          },
          context.currentIdentity,
        );

        if (result.error || !result.ticket) {
          return {
            error: result.error ?? "创建工单失败。",
            kind: "ticket_create_denied",
          };
        }

        return {
          detailHref:
            context.currentIdentity.role === "admin"
              ? `/?view=admin-tickets&ticketId=${result.ticket.id}`
              : `/?view=tickets&ticketStatus=pending&ticketSort=newest&ticketId=${result.ticket.id}`,
          imageUrls: result.ticket.imageUrls,
          kind: "ticket_created",
          ticketId: result.ticket.id,
          ticketNumber: result.ticket.ticketNumber,
        };
      },
      {
        description:
          "在用户明确确认建单草稿后创建待处理工单。只能由质检员或管理员调用，施工方必须拒绝。",
        name: "create_ticket_from_confirmed_draft",
        schema: z.object({
          assigneeMembershipId: z.string().nullable().optional(),
          description: z.string().optional(),
          imageUrls: z.array(z.string()).optional(),
          locationDetail: z.string().optional(),
          severity: severitySchema.optional(),
          specialty: specialtySchema.optional(),
          summary: z.string().optional(),
        }),
      },
    ),
  ];
}
