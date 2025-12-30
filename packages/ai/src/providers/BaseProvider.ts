import type { LocaleTranslations } from '@dysporium/polyglot-core';
import type {
  AIProvider,
  TranslationRequest,
  TranslationResult,
  BatchTranslationRequest,
} from '../types';

export abstract class BaseProvider implements AIProvider {
  abstract readonly name: string;

  abstract translate(request: TranslationRequest): Promise<TranslationResult>;

  async translateBatch(request: BatchTranslationRequest): Promise<LocaleTranslations> {
    const { translations, sourceLocale, targetLocale, context } = request;
    const keys = Object.keys(translations);
    const values = keys.map((key) => {
      const value = translations[key];
      return typeof value === 'string' ? value : JSON.stringify(value);
    });

    const result = await this.translate({
      text: values,
      sourceLocale,
      targetLocale,
      context,
    });

    const translatedMap: LocaleTranslations = {};
    keys.forEach((key, index) => {
      translatedMap[key] = result.translations[index] || values[index];
    });

    return translatedMap;
  }

  protected buildSystemPrompt(sourceLocale: string, targetLocale: string, context?: string): string {
    let prompt = `You are a professional translator. Translate the following text from ${sourceLocale} to ${targetLocale}. `;
    prompt += 'Maintain the original meaning, tone, and formatting. ';
    prompt += 'Preserve any placeholders like {{variable}} or {variable} exactly as they appear. ';
    prompt += 'Do not add explanations or notes - only provide the translation.';

    if (context) {
      prompt += `\n\nContext for these translations: ${context}`;
    }

    return prompt;
  }

  protected buildUserPrompt(texts: string[]): string {
    if (texts.length === 1) {
      return texts[0];
    }

    return texts
      .map((text, index) => `[${index + 1}] ${text}`)
      .join('\n');
  }

  protected parseMultipleTranslations(response: string, count: number): string[] {
    if (count === 1) {
      return [response.trim()];
    }

    const lines = response.split('\n').filter((line) => line.trim());
    const translations: string[] = [];

    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)$/);
      if (match) {
        const index = parseInt(match[1], 10) - 1;
        translations[index] = match[2].trim();
      }
    }

    if (translations.filter(Boolean).length !== count) {
      return lines.slice(0, count).map((line) => {
        const match = line.match(/^\[?\d+\]?\s*(.+)$/);
        return match ? match[1].trim() : line.trim();
      });
    }

    return translations;
  }
}
