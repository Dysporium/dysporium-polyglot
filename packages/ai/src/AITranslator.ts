import type { Locale, TranslationKey, TranslateOptions } from '@dysporium/polyglot-core';
import { Translator } from '@dysporium/polyglot-core';
import type { AIProvider, AITranslatorConfig } from './types';

export class AITranslator {
  private translator: Translator;
  private provider: AIProvider;
  private sourceLocale: Locale;
  private autoTranslate: boolean;
  private context?: string;
  private translationCache: Map<string, string> = new Map();
  private pendingTranslations: Map<string, Promise<string>> = new Map();

  constructor(translator: Translator, config: AITranslatorConfig) {
    this.translator = translator;
    this.provider = config.provider;
    this.sourceLocale = config.sourceLocale;
    this.autoTranslate = config.autoTranslate ?? false;
    this.context = config.context;

    if (this.autoTranslate) {
      this.setupAutoTranslation();
    }
  }

  async translateKey(
    key: TranslationKey,
    targetLocale: Locale,
    options?: TranslateOptions
  ): Promise<string> {
    const cacheKey = `${key}:${targetLocale}`;

    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    if (this.pendingTranslations.has(cacheKey)) {
      return this.pendingTranslations.get(cacheKey)!;
    }

    const sourceText = this.translator.t(key, { ...options, locale: this.sourceLocale });

    const translationPromise = this.provider
      .translate({
        text: sourceText,
        sourceLocale: this.sourceLocale,
        targetLocale,
        context: this.context,
      })
      .then((result) => {
        const translation = result.translations[0];
        this.translationCache.set(cacheKey, translation);
        this.pendingTranslations.delete(cacheKey);
        return translation;
      })
      .catch((error) => {
        this.pendingTranslations.delete(cacheKey);
        throw error;
      });

    this.pendingTranslations.set(cacheKey, translationPromise);
    return translationPromise;
  }

  async translateKeys(
    keys: TranslationKey[],
    targetLocale: Locale
  ): Promise<Record<TranslationKey, string>> {
    const sourceTexts = keys.map((key) =>
      this.translator.t(key, { locale: this.sourceLocale })
    );

    const result = await this.provider.translate({
      text: sourceTexts,
      sourceLocale: this.sourceLocale,
      targetLocale,
      context: this.context,
    });

    const translations: Record<TranslationKey, string> = {};
    keys.forEach((key, index) => {
      const translation = result.translations[index];
      translations[key] = translation;
      this.translationCache.set(`${key}:${targetLocale}`, translation);
    });

    return translations;
  }

  async generateLocale(targetLocale: Locale): Promise<void> {
    const sourceTranslations = this.translator.getTranslations(this.sourceLocale);
    if (!sourceTranslations) {
      throw new Error(`No translations found for source locale: ${this.sourceLocale}`);
    }

    const translated = await this.provider.translateBatch({
      translations: sourceTranslations,
      sourceLocale: this.sourceLocale,
      targetLocale,
      context: this.context,
    });

    this.translator.setTranslations(targetLocale, translated);
  }

  t(key: TranslationKey, options?: TranslateOptions): string {
    const locale = options?.locale || this.translator.getLocale();

    if (this.translator.exists(key, locale)) {
      return this.translator.t(key, options);
    }

    const cacheKey = `${key}:${locale}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    if (this.autoTranslate && locale !== this.sourceLocale) {
      this.translateKey(key, locale, options).catch(() => {});
    }

    return this.translator.t(key, { ...options, locale: this.sourceLocale });
  }

  clearCache(): void {
    this.translationCache.clear();
  }

  getTranslator(): Translator {
    return this.translator;
  }

  private setupAutoTranslation(): void {
    this.translator.on('translationMissing', async ({ key, locale }) => {
      if (locale !== this.sourceLocale && this.translator.exists(key, this.sourceLocale)) {
        try {
          const translation = await this.translateKey(key, locale);
          this.translator.addTranslations(locale, { [key]: translation });
        } catch (error) {
          console.warn(`[Polyglot AI] Failed to auto-translate "${key}" to ${locale}:`, error);
        }
      }
    });
  }
}

export function createAITranslator(
  translator: Translator,
  config: AITranslatorConfig
): AITranslator {
  return new AITranslator(translator, config);
}

