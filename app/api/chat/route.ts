import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { Command } from "@langchain/langgraph";
import {
  consumeStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import type { HITLResponse } from "langchain";

import { createAssistantAgent } from "@/lib/assistant/agent";
import { resolveAssistantIdentity } from "@/lib/assistant/runtime";
import {
  ensureOwnedAssistantSession,
  saveAssistantSessionMessages,
} from "@/lib/assistant/session";
import { collectUploadedImageUrls } from "@/lib/assistant/uploads";

type ChatRequestBody = {
  id?: string;
  messages?: UIMessage[];
  resume?: HITLResponse;
  sessionId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;
  const messages = Array.isArray(body.messages) ? body.messages : [];

  const identity = await resolveAssistantIdentity();
  if (!identity.currentIdentity || !identity.userId) {
    return Response.json(identity.error, { status: identity.status });
  }

  const session = await ensureOwnedAssistantSession({
    currentIdentity: identity.currentIdentity,
    sessionId: body.sessionId,
    userId: identity.userId,
  });

  const context = {
    currentIdentity: identity.currentIdentity,
    sessionId: session.id,
    uploadedImageUrls: collectUploadedImageUrls(messages),
    userId: identity.userId,
  };
  const agent = createAssistantAgent(context);
  const baseMessages = await toBaseMessages(messages);
  const threadId = `assistant:${session.id}`;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const input = body.resume
        ? new Command({ resume: body.resume })
        : { messages: baseMessages };
      const langchainStream = await agent.stream(input, {
        configurable: { thread_id: threadId },
        streamMode: ["values", "messages", "tools"],
      });
      writer.merge(
        toUIMessageStream(langchainStream, {
          onError: (error) => {
            console.error(error);
          },
        }),
      );
    },
    onEnd: async ({ messages: finalMessages }) => {
      await saveAssistantSessionMessages({
        messages: finalMessages,
        sessionId: session.id,
        userId: identity.userId,
      });
    },
    onError: (error) => {
      console.error(error);
      return "助手暂时无法完成请求，请稍后重试。";
    },
    originalMessages: messages,
  });

  return createUIMessageStreamResponse({
    consumeSseStream: consumeStream,
    stream,
  });
}
