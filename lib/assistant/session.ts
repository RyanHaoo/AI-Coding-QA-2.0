import type { UIMessage } from "ai";

import type { TicketDraft } from "@/lib/assistant/types";
import type { ProjectMembership } from "@/lib/identity/types";
import { createAdminClient } from "@/lib/supabase/admin";

type AssistantSessionRow = {
  draft_state: TicketDraft | null;
  id: string;
  messages: UIMessage[] | null;
};

export const MAX_ASSISTANT_READ_MESSAGES = 20;

export function trimAssistantMessages(messages: UIMessage[]) {
  return messages.slice(-MAX_ASSISTANT_READ_MESSAGES);
}

export function mergeAssistantMessages(
  existingMessages: UIMessage[],
  finalMessages: UIMessage[],
) {
  const finalById = new Map(
    finalMessages.map((message) => [message.id, message]),
  );
  const existingIds = new Set(existingMessages.map((message) => message.id));
  const mergedMessages = existingMessages.map(
    (message) => finalById.get(message.id) ?? message,
  );

  for (const message of finalMessages) {
    if (!existingIds.has(message.id)) {
      mergedMessages.push(message);
    }
  }

  return mergedMessages;
}

function toAssistantSession(row: AssistantSessionRow) {
  const fullMessages = row.messages ?? [];

  return {
    draftState: row.draft_state ?? null,
    fullMessages,
    id: row.id,
    messages: trimAssistantMessages(fullMessages),
  };
}

type AssistantSessionWriteClient = {
  from(table: "assistant_sessions"): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        eq(
          column: string,
          value: string,
        ): {
          eq(
            column: string,
            value: string,
          ): {
            maybeSingle(): Promise<{ data: unknown; error: Error | null }>;
          };
        };
      };
    };
    insert(values: Record<string, unknown>): {
      select(columns: string): {
        single(): Promise<{ data: unknown; error: Error | null }>;
      };
    };
    update(values: Record<string, unknown>): {
      eq(
        column: string,
        value: string,
      ): {
        eq(column: string, value: string): Promise<{ error: Error | null }>;
      };
    };
  };
};

export async function getOrCreateAssistantSession(input: {
  currentIdentity: ProjectMembership;
  userId: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("assistant_sessions")
    .select("id, messages, draft_state")
    .eq("user_id", input.userId)
    .eq("membership_id", input.currentIdentity.id)
    .maybeSingle();

  if (error) {
    throw new Error(`助手会话读取失败：${error.message}`);
  }

  if (data) {
    return toAssistantSession(data as unknown as AssistantSessionRow);
  }

  const writeSupabase = supabase as unknown as AssistantSessionWriteClient;
  const { data: inserted, error: insertError } = await writeSupabase
    .from("assistant_sessions")
    .insert({
      membership_id: input.currentIdentity.id,
      messages: [],
      project_id: input.currentIdentity.project.id,
      user_id: input.userId,
    })
    .select("id, messages, draft_state")
    .single();

  if (insertError || !inserted) {
    throw new Error(
      `助手会话创建失败：${insertError?.message ?? "无返回数据"}`,
    );
  }

  return toAssistantSession(inserted as unknown as AssistantSessionRow);
}

export async function ensureOwnedAssistantSession(input: {
  currentIdentity: ProjectMembership;
  sessionId?: string | null;
  userId: string;
}) {
  const session = await getOrCreateAssistantSession(input);

  if (!input.sessionId || input.sessionId === session.id) {
    return session;
  }

  const supabase =
    createAdminClient() as unknown as AssistantSessionWriteClient;
  const { data, error } = await supabase
    .from("assistant_sessions")
    .select("id, messages, draft_state")
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .eq("membership_id", input.currentIdentity.id)
    .maybeSingle();

  if (error) {
    throw new Error(`助手会话校验失败：${error.message}`);
  }

  if (!data) {
    throw new Error("助手会话不存在或无权访问。");
  }

  return toAssistantSession(data as unknown as AssistantSessionRow);
}

export async function saveAssistantSessionMessages(input: {
  draftState?: TicketDraft | null;
  messages: UIMessage[];
  sessionId: string;
  userId: string;
}) {
  const supabase =
    createAdminClient() as unknown as AssistantSessionWriteClient;
  const { error } = await supabase
    .from("assistant_sessions")
    .update({
      draft_state: input.draftState ?? null,
      messages: input.messages,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .eq("user_id", input.userId);

  if (error) {
    throw new Error(`助手会话保存失败：${error.message}`);
  }
}
