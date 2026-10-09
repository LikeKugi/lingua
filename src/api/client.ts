import type {ChatMessage} from '../types';
import {UI} from '../i18n/strings';

type ChatResponse = {
  choices?: Array<{message?: {content?: string | null}}>;
  error?: {message?: string};
};

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/i.test(trimmed)) {
    throw new ApiError(UI.settings.invalidUrl);
  }
  return trimmed;
}

const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(baseUrl: string, apiKey: string, path: string): Promise<T> {
  if (!apiKey.trim()) {
    throw new ApiError(UI.common.noApiKey);
  }
  const endpoint = `${normalizeBaseUrl(baseUrl)}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {Authorization: `Bearer ${apiKey.trim()}`},
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(controller.signal.aborted ? UI.common.timeout : UI.common.network);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 401
        ? UI.common.invalidKey
        : response.status === 404
          ? UI.common.notFound
          : UI.common.genericApi,
      response.status,
    );
  }
  return (await response.json()) as T;
}

export async function loadModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const response = await request<{data?: Array<{id?: string}>}>(
    baseUrl,
    apiKey,
    '/models',
  );
  return (response.data ?? [])
    .map(model => model.id)
    .filter((model): model is string => Boolean(model))
    .sort((first, second) => first.localeCompare(second));
}

/** Resolves with the number of models the provider exposes. */
export async function checkConnection(baseUrl: string, apiKey: string): Promise<number> {
  const models = await loadModels(baseUrl, apiKey);
  return models.length;
}

export async function createExplanation(args: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}): Promise<string> {
  const endpoint = `${normalizeBaseUrl(args.baseUrl)}/chat/completions`;
  if (!args.apiKey.trim()) {
    throw new ApiError(UI.common.noApiKey);
  }
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${args.apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        temperature: 0.3,
        stream: false,
      }),
    });
  } catch {
    throw new ApiError(UI.common.network);
  }
  if (!response.ok) {
    throw new ApiError(
      response.status === 401
        ? UI.common.invalidKey
        : response.status === 404
          ? UI.common.notFound
          : UI.common.genericApi,
      response.status,
    );
  }
  const payload = (await response.json()) as ChatResponse;
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new ApiError(payload.error?.message ?? UI.common.genericApi);
  }
  return content;
}
