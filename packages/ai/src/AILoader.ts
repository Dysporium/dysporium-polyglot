import type { Locale, LocaleTranslations, TranslationLoader } from '@dysporium/polyglot-core';
import type { AIProvider, AILoaderConfig } from './types';

export class AILoader implements TranslationLoader {
  readonly name = 'ai-loader';
  private provider: AIProvider;
  private sourceLocale: Locale;
  private sourceTranslations: LocaleTranslations;
  private context?: string;
  private cache: Map<Locale, LocaleTranslations> = new Map();
  private cacheResults: boolean;

  constructor(config: AILoaderConfig) {
    this.provider = config.provider;
    this.sourceLocale = config.sourceLocale;
    this.sourceTranslations = config.sourceTranslations;
    this.context = config.context;
    this.cacheResults = config.cacheResults ?? true;
  }

  async load(locale: Locale): Promise<LocaleTranslations> {
    if (locale === this.sourceLocale) {
      return this.sourceTranslations;
    }

    if (this.cacheResults && this.cache.has(locale)) {
      return this.cache.get(locale)!;
    }

    const translations = await this.provider.translateBatch({
      translations: this.sourceTranslations,
      sourceLocale: this.sourceLocale,
      targetLocale: locale,
      context: this.context,
    });

    if (this.cacheResults) {
      this.cache.set(locale, translations);
    }

    return translations;
  }

  supports(locale: Locale): boolean {
    return true;
  }

  updateSourceTranslations(translations: LocaleTranslations): void {
    this.sourceTranslations = translations;
    this.cache.clear();
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCachedLocales(): Locale[] {
    return Array.from(this.cache.keys());
  }
}

export function createAILoader(config: AILoaderConfig): AILoader {
  return new AILoader(config);
}

