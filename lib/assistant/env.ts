const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL;
const openRouterBaseUrl =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

if (!openRouterApiKey) {
  throw new Error("Missing OPENROUTER_API_KEY");
}

if (!openRouterModel) {
  throw new Error("Missing OPENROUTER_MODEL");
}

if (!openRouterBaseUrl) {
  throw new Error("Missing OPENROUTER_BASE_URL");
}

export const assistantEnv = {
  openRouterApiKey,
  openRouterBaseUrl,
  openRouterModel,
};
