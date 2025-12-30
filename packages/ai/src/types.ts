import type { Locale, LocaleTranslations } from '@dysporium/polyglot-core';

export interface TranslationRequest {
  text: string | string[];
  sourceLocale: Locale;
  targetLocale: Locale;
  context?: string;
}

export interface TranslationResult {
  translations: string[];
  sourceLocale: Locale;
  targetLocale: Locale;
}

export interface BatchTranslationRequest {
  translations: LocaleTranslations;
  sourceLocale: Locale;
  targetLocale: Locale;
  context?: string;
}

export interface AIProvider {
  readonly name: string;
  translate(request: TranslationRequest): Promise<TranslationResult>;
  translateBatch(request: BatchTranslationRequest): Promise<LocaleTranslations>;
}

export interface AILoaderConfig {
  provider: AIProvider;
  sourceLocale: Locale;
  sourceTranslations: LocaleTranslations;
  context?: string;
  cacheResults?: boolean;
}

export interface AITranslatorConfig {
  provider: AIProvider;
  sourceLocale: Locale;
  autoTranslate?: boolean;
  cacheResults?: boolean;
  context?: string;
}

export interface DysporiumProviderConfig {
  model: unknown;
  maxTokens?: number;
  temperature?: number;
}

export interface OpenAIProviderConfig extends DysporiumProviderConfig {
  model: ReturnType<typeof import('@dysporium-sdk/openai').createOpenAI>;
}

export interface AnthropicProviderConfig extends DysporiumProviderConfig {
  model: ReturnType<typeof import('@dysporium-sdk/anthropic').createAnthropic>;
}

export interface QwenProviderConfig extends DysporiumProviderConfig {
  model: ReturnType<typeof import('@dysporium-sdk/qwen').createQwen>;
}

export interface CustomProviderConfig {
  name?: string;
  translateFn: (request: TranslationRequest) => Promise<TranslationResult>;
  translateBatchFn?: (request: BatchTranslationRequest) => Promise<LocaleTranslations>;
}
