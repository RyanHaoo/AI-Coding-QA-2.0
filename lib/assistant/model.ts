import { ChatOpenAI } from "@langchain/openai";

import { assistantEnv } from "@/lib/assistant/env";

export function createAssistantModel() {
  return new ChatOpenAI({
    apiKey: assistantEnv.openRouterApiKey,
    configuration: {
      baseURL: assistantEnv.openRouterBaseUrl,
    },
    model: assistantEnv.openRouterModel,
    streaming: true,
    temperature: 0.2,
  });
}
