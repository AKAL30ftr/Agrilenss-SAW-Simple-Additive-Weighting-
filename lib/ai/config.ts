export interface AiRuntimeConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export function getAiRuntimeConfig(): AiRuntimeConfig | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();
  const baseUrl = process.env.OPENAI_BASE_URL?.trim();

  if (!apiKey || !model) {
    return null;
  }

  return {
    apiKey,
    model,
    ...(baseUrl ? { baseUrl } : {}),
  };
}
