import OpenAI from 'openai';

import { AiRuntimeConfig } from './config';

export function createOpenAiClient(config: AiRuntimeConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });
}
