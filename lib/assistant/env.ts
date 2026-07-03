const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL;
const openRouterBaseUrl =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const cozeApiToken = process.env.COZE_API_TOKEN;
const cozeBotId = process.env.COZE_BOT_ID;

if (!openRouterApiKey) {
  throw new Error("Missing OPENROUTER_API_KEY");
}

if (!openRouterModel) {
  throw new Error("Missing OPENROUTER_MODEL");
}

if (!openRouterBaseUrl) {
  throw new Error("Missing OPENROUTER_BASE_URL");
}

if (!cozeApiToken) {
  throw new Error("Missing COZE_API_TOKEN");
}

if (!cozeBotId) {
  throw new Error("Missing COZE_BOT_ID");
}

export const assistantEnv = {
  cozeApiToken,
  cozeBotId,
  openRouterApiKey,
  openRouterBaseUrl,
  openRouterModel,
};
