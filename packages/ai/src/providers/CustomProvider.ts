import type { LocaleTranslations } from '@dysporium/polyglot-core';
import type {
  AIProvider,
  TranslationRequest,
  TranslationResult,
  BatchTranslationRequest,
  CustomProviderConfig,
} from '../types';

export class CustomProvider implements AIProvider {
  readonly name: string;
  private config: CustomProviderConfig;

  constructor(config: CustomProviderConfig) {
    this.name = config.name || 'custom';
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    return this.config.translateFn(request);
  }

  async translateBatch(request: BatchTranslationRequest): Promise<LocaleTranslations> {
    if (this.config.translateBatchFn) {
      return this.config.translateBatchFn(request);
    }

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
}

export function createCustomProvider(config: CustomProviderConfig): CustomProvider {
  return new CustomProvider(config);
}
