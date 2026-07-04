import {
  ChatEventType,
  COZE_CN_BASE_URL,
  CozeAPI,
  RoleType,
  type StreamChatReq,
} from "@coze/api";
import { randomUUID } from "node:crypto";

import { assistantEnv } from "@/lib/assistant/env";

const cozeTimeoutMs = 60_000;

export type CozeKnowledgeStatus = "empty" | "failed" | "success" | "timeout";

export type CozeKnowledgeResult = {
  content: string;
  error?: string;
  kind: "coze_knowledge_answer";
  sourceNote: string;
  status: CozeKnowledgeStatus;
};

let cozeClient: CozeAPI | null = null;

function getCozeClient() {
  cozeClient ??= new CozeAPI({
    baseURL: COZE_CN_BASE_URL,
    token: assistantEnv.cozeApiToken,
  });

  return cozeClient;
}

function trimForCoze(value: string, maxLength: number) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}\n\n[上下文已截断]`;
}

function buildCozeQuestion(input: {
  contextSummary?: string;
  question: string;
}) {
  const question = trimForCoze(input.question, 1200);
  const contextSummary = input.contextSummary
    ? trimForCoze(input.contextSummary, 2000)
    : "";

  if (!contextSummary) {
    return question;
  }

  return [
    "请回答下面的建筑施工质检知识问题。",
    "",
    `问题：${question}`,
    "",
    "已授权上下文摘要：",
    contextSummary,
    "",
    "请只基于施工质检知识和上述已授权上下文回答；如果缺少判断条件，请明确追问。",
  ].join("\n");
}

function inferSourceNote(content: string) {
  if (/来源|参考|GB\/?T?\s*\d|JGJ\s*\d|CJJ\s*\d|CECS\s*\d/.test(content)) {
    return "来源见 Coze 返回内容。";
  }

  return "未返回明确来源。";
}

function fallbackResult(
  status: Exclude<CozeKnowledgeStatus, "success">,
  content: string,
  error?: string,
): CozeKnowledgeResult {
  return {
    content,
    error,
    kind: "coze_knowledge_answer",
    sourceNote: "未返回明确来源。",
    status,
  };
}

export async function queryCozeConstructionKnowledge(input: {
  contextSummary?: string;
  question: string;
}): Promise<CozeKnowledgeResult> {
  const question = input.question.trim();

  if (!question) {
    return fallbackResult("empty", "没有收到可用于查询的施工质检知识问题。");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cozeTimeoutMs);

  try {
    const request = {
      additional_messages: [
        {
          content: buildCozeQuestion({
            contextSummary: input.contextSummary,
            question,
          }),
          content_type: "text",
          role: RoleType.User,
        },
      ],
      auto_save_history: false,
      bot_id: assistantEnv.cozeBotId,
      enable_card: false,
      user_id: `qa-new-${randomUUID()}`,
    } satisfies StreamChatReq & { enable_card: boolean };

    const stream = await getCozeClient().chat.stream(request, {
      signal: controller.signal,
    });
    let content = "";
    let failureMessage: string | null = null;

    for await (const part of stream) {
      if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
        if (part.data.type === "answer") {
          content += part.data.content;
        }
      }

      if (part.event === ChatEventType.CONVERSATION_MESSAGE_COMPLETED) {
        if (part.data.type === "answer" && !content.trim()) {
          content = part.data.content;
        }
      }

      if (part.event === ChatEventType.CONVERSATION_CHAT_FAILED) {
        failureMessage =
          part.data.last_error?.msg || "Coze 知识接口返回失败状态。";
      }

      if (part.event === ChatEventType.CONVERSATION_CHAT_REQUIRES_ACTION) {
        failureMessage = "Coze 知识接口要求额外工具动作，阶段 6 不处理。";
      }

      if (part.event === ChatEventType.ERROR) {
        failureMessage = part.data.msg || "Coze 知识接口返回错误事件。";
      }
    }

    if (failureMessage) {
      return fallbackResult(
        "failed",
        "Coze 知识接口暂时不可用，当前无法提供可靠知识回答。请稍后重试或补充更具体的问题。",
        failureMessage,
      );
    }

    const normalizedContent = content.trim();
    if (!normalizedContent) {
      return fallbackResult(
        "empty",
        "Coze 未返回可用知识内容，当前无法提供可靠知识回答。请补充更具体的施工部位、专业范围或实测条件后重试。",
      );
    }

    return {
      content: normalizedContent,
      kind: "coze_knowledge_answer",
      sourceNote: inferSourceNote(normalizedContent),
      status: "success",
    };
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("aborted"));

    return fallbackResult(
      isTimeout ? "timeout" : "failed",
      isTimeout
        ? "Coze 知识接口响应超时，当前无法提供可靠知识回答。请稍后重试或补充更具体的问题。"
        : "Coze 知识接口暂时不可用，当前无法提供可靠知识回答。请稍后重试。",
      error instanceof Error ? error.message : "Unknown Coze error",
    );
  } finally {
    clearTimeout(timeout);
  }
}
