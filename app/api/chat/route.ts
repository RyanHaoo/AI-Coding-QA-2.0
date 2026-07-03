import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import {
  consumeStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

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

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const langchainStream = await agent.stream(
        { messages: baseMessages },
        { streamMode: ["values", "messages", "tools"] },
      );
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
