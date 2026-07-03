import type { UIMessage } from "ai";

import type { TicketDraft } from "@/lib/assistant/types";
import type { ProjectMembership } from "@/lib/identity/types";
import { createAdminClient } from "@/lib/supabase/admin";

type AssistantSessionRow = {
  draft_state: TicketDraft | null;
  id: string;
  messages: UIMessage[] | null;
};

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
    const row = data as unknown as AssistantSessionRow;
    return {
      draftState: row.draft_state ?? null,
      id: row.id,
      messages: row.messages ?? [],
    };
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

  const row = inserted as unknown as AssistantSessionRow;
  return {
    draftState: row.draft_state ?? null,
    id: row.id,
    messages: row.messages ?? [],
  };
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

  const row = data as unknown as AssistantSessionRow;
  return {
    draftState: row.draft_state ?? null,
    id: row.id,
    messages: row.messages ?? [],
  };
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
