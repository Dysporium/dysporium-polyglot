import type {
  Locale,
  TranslationKey,
  LocaleTranslations,
  TranslationsMap,
  PolyglotConfig,
  TranslateOptions,
  TranslationLoader,
  MissingTranslationHandler,
  LocaleChangedEvent,
  TranslationsLoadedEvent,
  TranslationMissingEvent,
  ErrorEvent,
} from './types';
import { TranslationStore } from './TranslationStore';
import { LanguageDetector } from './LanguageDetector';
import { InterpolationFormatter } from './formatters/InterpolationFormatter';
import { PluralFormatter, getPluralKeyVariants } from './formatters/PluralFormatter';
import { createFormatterPipeline, type Formatter } from './formatters/Formatter';
import { EventEmitter } from './utils/EventEmitter';

export type TranslatorEvents = {
  localeChanged: LocaleChangedEvent;
  translationsLoaded: TranslationsLoadedEvent;
  translationMissing: TranslationMissingEvent;
  error: ErrorEvent;
}

const DEFAULT_CONFIG: Required<Omit<PolyglotConfig, 'translations' | 'onMissingTranslation' | 'fallbackLocales'>> & {
  translations: TranslationsMap;
  onMissingTranslation: MissingTranslationHandler | null;
  fallbackLocales: Locale[];
} = {
  defaultLocale: 'en',
  currentLocale: 'en',
  supportedLocales: [],
  translations: {},
  detectLocale: true,
  fallbackLocales: [],
  debug: false,
  onMissingTranslation: null,
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    escapeHtml: false,
  },
  pluralization: {
    rules: {},
  },
};

export class Translator extends EventEmitter<TranslatorEvents> {
  private store: TranslationStore;
  private detector: LanguageDetector;
  private formatter: Formatter;
  private interpolationFormatter: InterpolationFormatter;
  private pluralFormatter: PluralFormatter;
  private loaders: TranslationLoader[] = [];
  
  private currentLocale: Locale;
  private defaultLocale: Locale;
  private fallbackLocales: Locale[];
  private supportedLocales: Locale[];
  private debug: boolean;
  private onMissingTranslation: MissingTranslationHandler | null;
  private loadingPromises: Map<Locale, Promise<void>> = new Map();

  constructor(config: PolyglotConfig = { defaultLocale: 'en' }) {
    super();
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    this.store = new TranslationStore(mergedConfig.translations);
    this.detector = new LanguageDetector({
      supportedLocales: mergedConfig.supportedLocales,
    });
    this.interpolationFormatter = new InterpolationFormatter(mergedConfig.interpolation);
    this.pluralFormatter = new PluralFormatter({
      rules: mergedConfig.pluralization?.rules,
      locale: mergedConfig.currentLocale || mergedConfig.defaultLocale,
    });
    this.formatter = createFormatterPipeline([
      this.pluralFormatter,
      this.interpolationFormatter,
    ]);
    this.defaultLocale = mergedConfig.defaultLocale;
    this.fallbackLocales = mergedConfig.fallbackLocales;
    this.supportedLocales = mergedConfig.supportedLocales;
    this.debug = mergedConfig.debug;
    this.onMissingTranslation = mergedConfig.onMissingTranslation;
    if (mergedConfig.detectLocale && typeof window !== 'undefined') {
      this.currentLocale = this.detector.detect() || mergedConfig.currentLocale || mergedConfig.defaultLocale;
    } else {
      this.currentLocale = mergedConfig.currentLocale || mergedConfig.defaultLocale;
    }
    this.pluralFormatter.setLocale(this.currentLocale);
  }

  t(key: TranslationKey, options: TranslateOptions = {}): string {
    const locale = options.locale || this.currentLocale;
    let value = this.resolveTranslation(key, locale, options);
    if (value === undefined) {
      return this.handleMissingTranslation(key, locale, options);
    }
    return this.formatter.format(value, { ...options, locale });
  }

  translate(key: TranslationKey, options: TranslateOptions = {}): string {
    return this.t(key, options);
  }

  exists(key: TranslationKey, locale?: Locale): boolean {
    const targetLocale = locale || this.currentLocale;
    return this.store.has(targetLocale, key);
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  async setLocale(locale: Locale): Promise<void> {
    if (locale === this.currentLocale) {
      return;
    }
    const previousLocale = this.currentLocale;
    this.currentLocale = locale;
    this.pluralFormatter.setLocale(locale);
    this.detector.setLocale(locale);
    if (!this.store.getLocale(locale) && this.loaders.length > 0) {
      await this.loadTranslations(locale);
    }
    this.emit('localeChanged', { previousLocale, newLocale: locale });
  }

  getDefaultLocale(): Locale {
    return this.defaultLocale;
  }

  getSupportedLocales(): Locale[] {
    return [...this.supportedLocales];
  }

  getAvailableLocales(): Locale[] {
    return this.store.getAvailableLocales();
  }

  addTranslations(locale: Locale, translations: LocaleTranslations): void {
    this.store.mergeLocale(locale, translations);
    this.emit('translationsLoaded', {
      locale,
      count: this.store.count(locale),
    });
  }

  setTranslations(locale: Locale, translations: LocaleTranslations): void {
    this.store.setLocale(locale, translations);
    this.emit('translationsLoaded', {
      locale,
      count: this.store.count(locale),
    });
  }

  getTranslations(locale?: Locale): LocaleTranslations | undefined {
    return this.store.getLocale(locale || this.currentLocale);
  }

  async loadTranslations(locale: Locale): Promise<void> {
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale);
    }
    const loadPromise = this.doLoadTranslations(locale);
    this.loadingPromises.set(locale, loadPromise);
    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(locale);
    }
  }

  async preloadTranslations(locales: Locale[]): Promise<void> {
    await Promise.all(locales.map((locale) => this.loadTranslations(locale)));
  }

  use(loader: TranslationLoader): this {
    this.loaders.push(loader);
    return this;
  }

  removeLoader(name: string): boolean {
    const index = this.loaders.findIndex((l) => l.name === name);
    if (index !== -1) {
      this.loaders.splice(index, 1);
      return true;
    }
    return false;
  }

  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  setMissingHandler(handler: MissingTranslationHandler | null): void {
    this.onMissingTranslation = handler;
  }

  setInterpolationConfig(config: { prefix?: string; suffix?: string; escapeHtml?: boolean }): void {
    this.interpolationFormatter.setConfig(config);
  }

  private resolveTranslation(
    key: TranslationKey,
    locale: Locale,
    options: TranslateOptions
  ): string | undefined {
    if (options.count !== undefined) {
      const pluralKey = this.resolvePluralKey(key, locale, options.count);
      if (pluralKey) {
        return this.store.get(locale, pluralKey);
      }
    }
    let value = this.store.get(locale, key);
    if (value !== undefined) {
      return value;
    }
    for (const fallbackLocale of this.fallbackLocales) {
      value = this.store.get(fallbackLocale, key);
      if (value !== undefined) {
        return value;
      }
    }
    if (locale !== this.defaultLocale) {
      value = this.store.get(this.defaultLocale, key);
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  private resolvePluralKey(
    baseKey: TranslationKey,
    locale: Locale,
    count: number
  ): TranslationKey | null {
    const suffix = this.pluralFormatter.getPluralKeySuffix(count, locale);
    const pluralKey = `${baseKey}${suffix}`;
    if (this.store.has(locale, pluralKey)) {
      return pluralKey;
    }
    const variants = getPluralKeyVariants(baseKey);
    for (const variant of variants) {
      if (this.store.has(locale, variant)) {
        const formIndex = this.pluralFormatter.getPluralFormIndex(count, locale);
        const orderedVariants = variants.filter((v) => this.store.has(locale, v));
        return orderedVariants[Math.min(formIndex, orderedVariants.length - 1)] || null;
      }
    }
    return null;
  }

  private handleMissingTranslation(
    key: TranslationKey,
    locale: Locale,
    options: TranslateOptions
  ): string {
    this.emit('translationMissing', { key, locale });
    if (this.debug) {
      console.warn(`[Polyglot] Missing translation: "${key}" for locale "${locale}"`);
    }
    if (this.onMissingTranslation) {
      return this.onMissingTranslation(key, locale, options);
    }
    if (options.defaultValue !== undefined) {
      return this.formatter.format(options.defaultValue, options);
    }
    return key;
  }

  private async doLoadTranslations(locale: Locale): Promise<void> {
    for (const loader of this.loaders) {
      if (loader.supports?.(locale) !== false) {
        try {
          const translations = await loader.load(locale);
          this.store.mergeLocale(locale, translations);
          this.emit('translationsLoaded', {
            locale,
            count: this.store.count(locale),
          });
          return;
        } catch (error) {
          this.emit('error', {
            error: error instanceof Error ? error : new Error(String(error)),
            context: `Failed to load translations for locale "${locale}" using loader "${loader.name}"`,
          });
        }
      }
    }
    if (this.debug) {
      console.warn(`[Polyglot] No loader could load translations for locale: ${locale}`);
    }
  }
}
