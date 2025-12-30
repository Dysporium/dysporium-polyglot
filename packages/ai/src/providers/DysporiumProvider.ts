import { generateText } from '@dysporium-sdk/core';
import type { TranslationRequest, TranslationResult, DysporiumProviderConfig } from '../types';
import { BaseProvider } from './BaseProvider';

export class DysporiumProvider extends BaseProvider {
  readonly name: string;
  private model: unknown;
  private maxTokens: number;
  private temperature: number;

  constructor(name: string, config: DysporiumProviderConfig) {
    super();
    this.name = name;
    this.model = config.model;
    this.maxTokens = config.maxTokens ?? 4096;
    this.temperature = config.temperature ?? 0.3;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const { text, sourceLocale, targetLocale, context } = request;
    const texts = Array.isArray(text) ? text : [text];

    const systemPrompt = this.buildSystemPrompt(sourceLocale, targetLocale, context);
    const userPrompt = this.buildUserPrompt(texts);

    const result = await generateText({
      model: this.model as Parameters<typeof generateText>[0]['model'],
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    });

    const translations = this.parseMultipleTranslations(result.text, texts.length);

    return {
      translations,
      sourceLocale,
      targetLocale,
    };
  }
}

export function createDysporiumProvider(
  name: string,
  config: DysporiumProviderConfig
): DysporiumProvider {
  return new DysporiumProvider(name, config);
}

