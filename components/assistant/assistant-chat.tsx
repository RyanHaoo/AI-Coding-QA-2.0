"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { useLayoutEffect, useRef } from "react";

import { AssistantEmptyState } from "@/components/assistant/assistant-empty-state";
import { AssistantInput } from "@/components/assistant/assistant-input";
import { MessageList } from "@/components/assistant/message-list";
import type { TicketDraft } from "@/lib/assistant/types";

type BuilderCandidate = {
  department: string;
  fullName: string;
  membershipId: string;
};

export function AssistantChat({
  builders,
  initialMessages,
  sessionId,
}: {
  builders: BuilderCandidate[];
  initialMessages: UIMessage[];
  sessionId: string;
}) {
  const { error, messages, sendMessage, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
  });
  const busy = status === "submitted" || status === "streaming";
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    scrollArea.scrollTop = scrollArea.scrollHeight;
  });

  async function send(input: { files: FileUIPart[]; text: string }) {
    await sendMessage({
      files: input.files,
      text: input.text,
    });
  }

  function confirmDraft(draft: TicketDraft) {
    void sendMessage(undefined, {
      body: {
        resume: {
          decisions: [
            {
              editedAction: {
                args: draft,
                name: "create_ticket_from_confirmed_draft",
              },
              type: "edit",
            },
          ],
        },
      },
    });
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-4xl flex-col overflow-hidden">
      <div
        data-assistant-scroll-area="true"
        className="min-w-0 flex-1 overflow-y-auto overscroll-contain pb-6"
        ref={scrollAreaRef}
      >
        {messages.length === 0 ? (
          <AssistantEmptyState />
        ) : (
          <MessageList
            builders={builders}
            messages={messages}
            onConfirmDraft={confirmDraft}
          />
        )}
        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {error.message}
          </div>
        ) : null}
      </div>

      <div className="min-w-0 shrink-0 border-slate-200 border-t bg-[#f7f9fb]/90 py-4 backdrop-blur">
        {busy ? <ResponseDots /> : null}
        <AssistantInput disabled={busy} onSend={send} />
      </div>
    </div>
  );
}

function ResponseDots() {
  return (
    <output
      aria-label="助手正在响应"
      className="mb-2 flex h-6 items-center justify-center gap-1 px-1"
    >
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
    </output>
  );
}
